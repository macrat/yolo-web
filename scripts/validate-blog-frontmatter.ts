#!/usr/bin/env npx tsx
/**
 * ブログ記事 frontmatter の検証。
 * pre-commit フック (.claude/hooks/pre-commit-check.sh) から呼ばれ、コミットを機械的にゲートする。
 * (旧アンチパターン AP-W13 をチェックリストからフックへ移管・強制化したもの)
 *
 * 検証内容:
 *  - frontmatter が厳格な YAML としてパースできる (壊れた frontmatter は触った時点で修復させる)
 *  - published_at が存在し、タイムゾーン付きの日時としてパースでき、未来時刻でない
 *    (未来時刻は検索エンジンのペナルティに直結する致命傷)
 *  - updated_at は初期状態 (未更新) が null。値を持つ場合はタイムゾーン付き日時で、
 *    未来時刻でなく、published_at 以降であること
 *  - 新規記事 (gitに履歴が無い) では updated_at が null であること (改訂偽装の防止)
 *
 * updated_at の正本ルールは `.claude/rules/blog-writing.md`。実装 (src/blog/_lib/blog.ts) は
 * null を published_at にフォールバックして扱う。
 *
 * Usage: npx tsx scripts/validate-blog-frontmatter.ts <file.md> [...]
 */
import { readFileSync } from "fs";
import { execFileSync } from "child_process";
import yaml from "js-yaml";

const SKEW_MS = 5 * 60 * 1000; // 時計ずれの許容幅

// タイムゾーン指定子 (+0900 / +09:00 / Z) を必須にする
const DATETIME_PATTERN = /T.*([+-]\d{2}:?\d{2}|Z)$/;

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

// 日時文字列を検証する。エラーがあれば報告して null を返す。
function parseDatetime(
  file: string,
  key: string,
  value: string,
): number | null {
  if (!DATETIME_PATTERN.test(value)) {
    fail(
      file,
      `${key} "${value}" にタイムゾーン指定子がありません。date +"%Y-%m-%dT%H:%M:%S%z" の実測値を使ってください`,
    );
    return null;
  }
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    fail(file, `${key} "${value}" を日時としてパースできません`);
    return null;
  }
  if (ms > Date.now() + SKEW_MS) {
    fail(file, `${key} "${value}" が未来時刻です`);
    return null;
  }
  return ms;
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

  let fm: Record<string, unknown>;
  try {
    fm = yaml.load(match[1]) as Record<string, unknown>;
  } catch (e) {
    fail(
      file,
      `frontmatter を YAML としてパースできません。壊れた記述 (キーを失った配列の残骸等) を修復してください: ${e instanceof Error ? e.message.split("\n")[0] : e}`,
    );
    continue;
  }

  if (fm.draft === true) continue; // 下書きは公開日時の検証対象外

  const pub = fm.published_at;
  if (pub instanceof Date) {
    // 引用符なしの日付は js-yaml が Date として解釈する
    fail(
      file,
      'published_at はダブルクォートで囲んだ文字列にしてください (例: "2026-07-16T12:00:00+0900")',
    );
    continue;
  }
  if (typeof pub !== "string" || pub === "") {
    fail(file, "published_at が設定されていません (必須)");
    continue;
  }
  const pubMs = parseDatetime(file, "published_at", pub);

  const upd = fm.updated_at;
  if (upd === null || upd === undefined || upd === "") {
    // 初期状態 (未更新) は null が正 (.claude/rules/blog-writing.md)
  } else if (upd instanceof Date) {
    fail(
      file,
      'updated_at はダブルクォートで囲んだ文字列にしてください (例: "2026-07-16T12:00:00+0900")',
    );
  } else if (typeof upd !== "string") {
    fail(
      file,
      `updated_at は null または日時文字列にしてください (現在: ${JSON.stringify(upd)})`,
    );
  } else if (isNewFile(file)) {
    fail(
      file,
      `新規記事の updated_at は null にしてください (未更新を表す。現在: "${upd}")`,
    );
  } else {
    const updMs = parseDatetime(file, "updated_at", upd);
    if (updMs !== null && pubMs !== null && updMs < pubMs) {
      fail(file, `updated_at "${upd}" が published_at "${pub}" より前です`);
    }
  }
}

process.exit(failed ? 1 : 0);
