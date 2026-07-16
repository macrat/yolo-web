#!/usr/bin/env npx tsx
/**
 * ブログ記事 frontmatter の日時整合チェック。
 * pre-commit フック (.claude/hooks/pre-commit-check.sh) から呼ばれ、コミットを機械的にゲートする。
 * (旧アンチパターン AP-W13 をチェックリストからフックへ移管・強制化したもの)
 *
 * 検証内容:
 *  - published_at / updated_at が存在し、タイムゾーン付きの日時としてパースできる
 *  - どちらも未来時刻でない (検索エンジンのペナルティに直結する致命傷)
 *  - 新規記事 (gitに履歴が無い) では published_at === updated_at (改訂偽装の防止)
 *  - 既存記事では updated_at >= published_at
 *
 * frontmatter の解釈は本番パーサ (src/lib/markdown.ts の parseYamlBlock) と同じ寛容な
 * 意味論に合わせる: トップレベルの `key: value` 行だけを拾い、解釈できない行は無視する。
 * 厳格な YAML パーサを使うと、本番では正常に表示される記事をブロックしてしまう。
 * このゲートの目的は日時整合であり、YAML 全体の厳格性ではない。
 *
 * Usage: npx tsx scripts/validate-blog-frontmatter.ts <file.md> [...]
 */
import { readFileSync } from "fs";
import { execFileSync } from "child_process";

const SKEW_MS = 5 * 60 * 1000; // 時計ずれの許容幅

// タイムゾーン指定子 (+0900 / +09:00 / Z) を必須にする
const DATETIME_PATTERN = /T.*([+-]\d{2}:?\d{2}|Z)$/;

// 本番パーサ (parseYamlBlock) と同様に、トップレベルの key: value 行だけを拾う
function parseFrontmatterKeys(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (m) {
      out[m[1]] = m[2]
        .trim()
        .replace(/^"(.*)"$/, "$1")
        .replace(/^'(.*)'$/, "$1");
    }
  }
  return out;
}

function isNewFile(file: string): boolean {
  try {
    const out = execFileSync(
      "git",
      ["log", "--max-count=1", "--format=%H", "--", file],
      { encoding: "utf-8" },
    );
    return out.trim() === "";
  } catch {
    return false;
  }
}

let failed = false;
function fail(file: string, message: string) {
  console.error(`${file}: ${message}`);
  failed = true;
}

for (const file of process.argv.slice(2)) {
  let src: string;
  try {
    src = readFileSync(file, "utf-8");
  } catch {
    fail(file, "ファイルを読み取れません");
    continue;
  }

  const match = src.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    fail(file, "frontmatter がありません");
    continue;
  }

  const fm = parseFrontmatterKeys(match[1]);

  if (fm.draft === "true") continue; // 下書きは公開日時の検証対象外

  const pub = fm.published_at;
  const upd = fm.updated_at;
  if (!pub || pub === "null" || !upd || upd === "null") {
    fail(
      file,
      "published_at / updated_at が設定されていません (どちらも必須。未更新の既存記事の updated_at は published_at と同じ値を設定する)",
    );
    continue;
  }

  const entries: Array<[string, string]> = [
    ["published_at", pub],
    ["updated_at", upd],
  ];
  let parseError = false;
  for (const [key, value] of entries) {
    if (!DATETIME_PATTERN.test(value)) {
      fail(
        file,
        `${key} "${value}" にタイムゾーン指定子がありません。date +"%Y-%m-%dT%H:%M:%S%z" の実測値を使ってください`,
      );
      parseError = true;
    } else if (Number.isNaN(Date.parse(value))) {
      fail(file, `${key} "${value}" を日時としてパースできません`);
      parseError = true;
    }
  }
  if (parseError) continue;

  const now = Date.now();
  const pubMs = Date.parse(pub);
  const updMs = Date.parse(upd);

  if (pubMs > now + SKEW_MS) {
    fail(file, `published_at "${pub}" が未来時刻です`);
  }
  if (updMs > now + SKEW_MS) {
    fail(file, `updated_at "${upd}" が未来時刻です`);
  }

  if (isNewFile(file)) {
    if (pub !== upd) {
      fail(
        file,
        `新規記事は published_at と updated_at を同一値にしてください (published_at=${pub}, updated_at=${upd})`,
      );
    }
  } else if (updMs < pubMs) {
    fail(file, `updated_at "${upd}" が published_at "${pub}" より前です`);
  }
}

process.exit(failed ? 1 : 0);
