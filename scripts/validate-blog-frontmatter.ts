#!/usr/bin/env npx tsx
/**
 * ブログ記事 frontmatter の検証。
 * pre-commit フック (.claude/hooks/pre-commit-check.sh) から呼ばれ、コミットを機械的にゲートする。
 *
 * frontmatter の読み取りには、サイト本体がレンダリングに使うのと同じ `parseFrontmatter`
 * (src/lib/markdown.ts) をそのまま呼ぶ。読み取り経路が一つしかないので、検証を通った値と
 * 来訪者に届く値が食い違うことがない。
 *
 * 検証内容:
 *  - frontmatter ブロックがあり、厳格な YAML の key: value マッピングとして読める
 *    (ブロックが無い・--- が閉じていない・マッピングでない・YAML が壊れている、を
 *     それぞれ別の文言で指摘する。「何を直せばいいか」が一行で分かるようにするため)
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
import path from "path";
import { parseFrontmatter } from "../src/lib/markdown";

const SKEW_MS = 5 * 60 * 1000; // 時計ずれの許容幅

// タイムゾーン指定子 (+0900 / +09:00 / Z) を必須にする
const DATETIME_PATTERN = /T.*([+-]\d{2}:?\d{2}|Z)$/;

/** 記事の本文からは読み取れない、検証に必要な事実。 */
export interface ArticleContext {
  /** git に履歴が無い新規記事か (新規記事の updated_at は null が正)。 */
  isNew: boolean;
  /** 未来時刻かどうかを判定する基準時刻 (ms)。 */
  now: number;
}

// 日時文字列を検証する。問題があれば problems に積んで null を返す。
function checkDatetime(
  problems: string[],
  key: string,
  value: string,
  now: number,
): number | null {
  if (!DATETIME_PATTERN.test(value)) {
    problems.push(
      `${key} "${value}" にタイムゾーン指定子がありません。date +"%Y-%m-%dT%H:%M:%S%z" の実測値を使ってください`,
    );
    return null;
  }
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    problems.push(`${key} "${value}" を日時としてパースできません`);
    return null;
  }
  if (ms > now + SKEW_MS) {
    problems.push(`${key} "${value}" が未来時刻です`);
    return null;
  }
  return ms;
}

/**
 * 記事1本を検証し、見つかった問題を1件1行の文言で返す。問題が無ければ空配列。
 * 返す文言はファイル名を含まない (呼び出し側が `<file>: <文言>` の形に整える)。
 */
export function collectProblems(
  src: string,
  context: ArticleContext,
): string[] {
  let parsed: { data: Record<string, unknown>; frontmatter: string };
  try {
    parsed = parseFrontmatter(src);
  } catch (e) {
    return [
      `frontmatter を YAML としてパースできません。壊れた記述 (キーを失った配列の残骸等) を修復してください: ${e instanceof Error ? e.message.split("\n")[0] : e}`,
    ];
  }

  if (parsed.frontmatter.trim() === "") {
    return [
      "frontmatter がありません。ファイルの1行目を --- で始め、published_at 等を書いたあと --- の行で閉じてください",
    ];
  }

  const fm = parsed.data;
  if (Object.keys(fm).length === 0) {
    return [
      "frontmatter が key: value のマッピングになっていません。published_at 等をキーと値の組で書いてください",
    ];
  }

  const problems: string[] = [];

  if (fm.draft === true) return problems; // 下書きは公開日時の検証対象外

  const pub = fm.published_at;
  if (pub instanceof Date) {
    // 引用符なしの日付は YAML が Date として解釈する
    problems.push(
      'published_at はダブルクォートで囲んだ文字列にしてください (例: "2026-07-16T12:00:00+0900")',
    );
    return problems;
  }
  if (typeof pub !== "string" || pub === "") {
    problems.push("published_at が設定されていません (必須)");
    return problems;
  }
  const pubMs = checkDatetime(problems, "published_at", pub, context.now);

  const upd = fm.updated_at;
  if (upd === null || upd === undefined || upd === "") {
    // 初期状態 (未更新) は null が正 (.claude/rules/blog-writing.md)
  } else if (upd instanceof Date) {
    problems.push(
      'updated_at はダブルクォートで囲んだ文字列にしてください (例: "2026-07-16T12:00:00+0900")',
    );
  } else if (typeof upd !== "string") {
    problems.push(
      `updated_at は null または日時文字列にしてください (現在: ${JSON.stringify(upd)})`,
    );
  } else if (context.isNew) {
    problems.push(
      `新規記事の updated_at は null にしてください (未更新を表す。現在: "${upd}")`,
    );
  } else {
    const updMs = checkDatetime(problems, "updated_at", upd, context.now);
    if (updMs !== null && pubMs !== null && updMs < pubMs) {
      problems.push(`updated_at "${upd}" が published_at "${pub}" より前です`);
    }
  }

  return problems;
}

/**
 * 記事1本の検証に必要な、本文からは読み取れない事実を集める。
 *
 * git が履歴を答えられないときは例外を投げる。「答えられなかった」を「既存記事」に
 * 読み替えると、改訂偽装を防ぐ「新規記事の updated_at は null」の検査が何も言わずに
 * 外れるため。
 */
export function readArticleContext(file: string, now: number): ArticleContext {
  const history = execFileSync(
    "git",
    ["log", "--max-count=1", "--format=%H", "--", file],
    { encoding: "utf-8" },
  );
  return { isNew: history.trim() === "", now };
}

function main(files: string[]): number {
  let failed = false;

  const fail = (file: string, message: string) => {
    console.error(`${file}: ${message}`);
    failed = true;
  };

  for (const file of files) {
    let src: string;
    try {
      src = readFileSync(file, "utf-8");
    } catch {
      fail(file, "ファイルを読み取れません");
      continue;
    }

    let context: ArticleContext;
    try {
      context = readArticleContext(file, Date.now());
    } catch {
      fail(file, "git の履歴を読み取れず、新規記事かどうかを判定できません");
      continue;
    }

    for (const problem of collectProblems(src, context)) {
      fail(file, problem);
    }
  }

  return failed ? 1 : 0;
}

// テストから import されたときは実行しない (直接起動されたときだけ検証する)。
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename)
) {
  process.exit(main(process.argv.slice(2)));
}
