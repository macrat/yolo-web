/**
 * 四字熟語データ検証スクリプト
 *
 * yoji-data.json のバリデーションを行う:
 * - 重複チェック
 * - 漢字4文字チェック
 * - 読みの存在チェック
 * - origin/structure フィールドの値チェック
 * - 難易度・カテゴリ分布の確認
 *
 * Usage: npx tsx scripts/generate-yoji-data.ts
 */

import * as fs from "fs";
import * as path from "path";

interface YojiEntry {
  yoji: string;
  reading: string;
  meaning: string;
  difficulty: number;
  category: string;
  origin: string;
  structure: string;
}

const VALID_CATEGORIES = [
  "life",
  "effort",
  "nature",
  "emotion",
  "society",
  "knowledge",
  "conflict",
  "change",
  "virtue",
  "negative",
] as const;

const VALID_ORIGINS = [
  "漢籍",
  "仏典",
  "日本語由来",
  "故事",
  "その他",
  "不明",
] as const;

const VALID_STRUCTURES = [
  "対義",
  "類義",
  "因果",
  "修飾",
  "並列",
  "その他",
  "不明",
] as const;

const VALID_DIFFICULTIES = [1, 2, 3] as const;

// 漢字の正規表現パターン（CJK統合漢字 + 々踊り字）
const KANJI_REGEX = /^[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3005]+$/;

// ひらがなの正規表現パターン
const HIRAGANA_REGEX = /^[\u3040-\u309F]+$/;

function validate(dataPath: string): void {
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data: YojiEntry[] = JSON.parse(raw);

  let errors = 0;
  let warnings = 0;

  console.log(`\n===== 四字熟語データ検証 =====`);
  console.log(`ファイル: ${dataPath}`);
  console.log(`エントリ数: ${data.length}\n`);

  // 1. 重複チェック
  const seen = new Map<string, number>();
  for (let i = 0; i < data.length; i++) {
    const yoji = data[i].yoji;
    if (seen.has(yoji)) {
      console.error(
        `[ERROR] 重複: "${yoji}" がインデックス ${seen.get(yoji)} と ${i} に存在`,
      );
      errors++;
    }
    seen.set(yoji, i);
  }

  // 2. 各エントリの検証
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const prefix = `[${i}] ${entry.yoji}`;

    // 漢字4文字チェック
    if (entry.yoji.length !== 4) {
      console.error(`[ERROR] ${prefix}: ${entry.yoji.length}文字（4文字必要）`);
      errors++;
    }
    if (!KANJI_REGEX.test(entry.yoji)) {
      console.error(`[ERROR] ${prefix}: 漢字以外の文字を含む`);
      errors++;
    }

    // 読みチェック（ひらがなのみ）
    if (!entry.reading || entry.reading.length === 0) {
      console.error(`[ERROR] ${prefix}: 読みが空`);
      errors++;
    } else if (!HIRAGANA_REGEX.test(entry.reading)) {
      console.error(
        `[ERROR] ${prefix}: 読み "${entry.reading}" にひらがな以外の文字`,
      );
      errors++;
    }

    // 意味チェック
    if (!entry.meaning || entry.meaning.length === 0) {
      console.error(`[ERROR] ${prefix}: 意味が空`);
      errors++;
    }

    // 難易度チェック
    if (!(VALID_DIFFICULTIES as readonly number[]).includes(entry.difficulty)) {
      console.error(`[ERROR] ${prefix}: 無効な難易度 ${entry.difficulty}`);
      errors++;
    }

    // カテゴリチェック
    if (!(VALID_CATEGORIES as readonly string[]).includes(entry.category)) {
      console.error(`[ERROR] ${prefix}: 無効なカテゴリ "${entry.category}"`);
      errors++;
    }

    // originチェック
    if (!(VALID_ORIGINS as readonly string[]).includes(entry.origin)) {
      console.error(`[ERROR] ${prefix}: 無効なorigin "${entry.origin}"`);
      errors++;
    }

    // structureチェック
    if (!(VALID_STRUCTURES as readonly string[]).includes(entry.structure)) {
      console.error(`[ERROR] ${prefix}: 無効なstructure "${entry.structure}"`);
      errors++;
    }
  }

  // 3. 分布チェック
  const catCounts: Record<string, number> = {};
  const diffCounts: Record<number, number> = {};
  const originCounts: Record<string, number> = {};
  const structCounts: Record<string, number> = {};

  for (const entry of data) {
    catCounts[entry.category] = (catCounts[entry.category] || 0) + 1;
    diffCounts[entry.difficulty] = (diffCounts[entry.difficulty] || 0) + 1;
    originCounts[entry.origin] = (originCounts[entry.origin] || 0) + 1;
    structCounts[entry.structure] = (structCounts[entry.structure] || 0) + 1;
  }

  console.log(`\n--- 難易度分布 ---`);
  for (const d of [1, 2, 3]) {
    const count = diffCounts[d] || 0;
    const pct = ((count / data.length) * 100).toFixed(1);
    console.log(`  難易度${d}: ${count}件 (${pct}%)`);
  }

  console.log(`\n--- カテゴリ分布 ---`);
  for (const cat of VALID_CATEGORIES) {
    const count = catCounts[cat] || 0;
    if (count < 30) {
      console.warn(`[WARN] カテゴリ "${cat}": ${count}件（30件未満）`);
      warnings++;
    }
    console.log(`  ${cat}: ${count}件`);
  }

  console.log(`\n--- 出典分布 ---`);
  for (const [origin, count] of Object.entries(originCounts).sort()) {
    console.log(`  ${origin}: ${count}件`);
  }

  console.log(`\n--- 構造分布 ---`);
  for (const [struct, count] of Object.entries(structCounts).sort()) {
    console.log(`  ${struct}: ${count}件`);
  }

  // 4. 難易度3の読みチェックリスト出力
  const diff3 = data.filter((d) => d.difficulty === 3);
  console.log(`\n--- 難易度3（上級）の確認リスト: ${diff3.length}件 ---`);
  for (const d of diff3) {
    console.log(`  ${d.yoji} [${d.reading}] - ${d.meaning}`);
  }

  // 結果サマリ
  console.log(`\n===== 検証結果 =====`);
  console.log(`エラー: ${errors}件`);
  console.log(`警告: ${warnings}件`);
  console.log(`合計エントリ: ${data.length}件`);

  if (errors > 0) {
    console.error(`\n検証失敗: ${errors}件のエラーがあります`);
    process.exit(1);
  } else {
    console.log(`\n検証成功`);
  }
}

// メイン実行
const dataPath = path.resolve(__dirname, "../src/data/yoji-data.json");
validate(dataPath);
