/**
 * frontmatter 検証の回帰テスト（in-memory テスト）
 *
 * collectProblems() を直接呼び出し、不正な frontmatter を渡したときに
 * 「何が問題なのか」が書き手に伝わる文言で返ることを固定する。
 *
 * とくに、frontmatter ブロックそのものが欠けている記事を
 * 「published_at が無い」と報告してしまわないこと（直すべき場所を見失う）を
 * 構造の不備として個別に検出できることを確認する。
 */
import { describe, expect, test } from "vitest";

import {
  collectProblems,
  type ArticleContext,
} from "../validate-blog-frontmatter";

const NOW = Date.parse("2026-09-14T12:00:00+0900");

const EXISTING: ArticleContext = { isNew: false, now: NOW };
const NEW_ARTICLE: ArticleContext = { isNew: true, now: NOW };

describe("frontmatter の構造", () => {
  test("frontmatter ブロックが無いファイルは、ブロックが無いことを指摘する", () => {
    const problems = collectProblems("# 見出しだけの記事\n\n本文\n", EXISTING);
    expect(problems).toEqual([
      "frontmatter がありません。ファイルの1行目を --- で始め、published_at 等を書いたあと --- の行で閉じてください",
    ]);
  });

  test("--- が閉じていないファイルも、ブロックが無いことを指摘する", () => {
    const problems = collectProblems(
      '---\ntitle: "閉じ忘れ"\npublished_at: "2026-09-01T12:00:00+0900"\n\n本文\n',
      EXISTING,
    );
    expect(problems).toEqual([
      "frontmatter がありません。ファイルの1行目を --- で始め、published_at 等を書いたあと --- の行で閉じてください",
    ]);
  });

  test("中身が空のブロックも、ブロックが無いことを指摘する", () => {
    const problems = collectProblems("---\n\n---\n\n本文\n", EXISTING);
    expect(problems).toEqual([
      "frontmatter がありません。ファイルの1行目を --- で始め、published_at 等を書いたあと --- の行で閉じてください",
    ]);
  });

  test("マッピングでないブロック（裸のスカラー）は、key: value でないことを指摘する", () => {
    const problems = collectProblems(
      "---\nただのスカラー\n---\n\n本文\n",
      EXISTING,
    );
    expect(problems).toEqual([
      "frontmatter が key: value のマッピングになっていません。published_at 等をキーと値の組で書いてください",
    ]);
  });

  test("YAML として壊れているブロックは、パースできないことを原因付きで指摘する", () => {
    const problems = collectProblems(
      '---\ntitle: "壊れた YAML"\n  - キーを失った配列の残骸\n---\n\n本文\n',
      EXISTING,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("frontmatter を YAML としてパースできません");
  });

  test("構造が正しく日時も揃っていれば問題なし", () => {
    const problems = collectProblems(
      '---\ntitle: "正常な記事"\npublished_at: "2026-09-01T12:00:00+0900"\nupdated_at: null\n---\n\n本文\n',
      EXISTING,
    );
    expect(problems).toEqual([]);
  });

  test("下書きは公開日時の検証対象外", () => {
    const problems = collectProblems(
      '---\ntitle: "下書き"\ndraft: true\n---\n\n本文\n',
      EXISTING,
    );
    expect(problems).toEqual([]);
  });
});

describe("published_at", () => {
  test("frontmatter はあるが published_at が無い場合だけ、published_at の欠落を指摘する", () => {
    const problems = collectProblems(
      '---\ntitle: "日時なし"\n---\n\n本文\n',
      EXISTING,
    );
    expect(problems).toEqual(["published_at が設定されていません (必須)"]);
  });

  test("引用符なしの日時は Date になるため、文字列にするよう指摘する", () => {
    const problems = collectProblems(
      "---\npublished_at: 2026-09-01T12:00:00Z\n---\n\n本文\n",
      EXISTING,
    );
    expect(problems).toEqual([
      'published_at はダブルクォートで囲んだ文字列にしてください (例: "2026-07-16T12:00:00+0900")',
    ]);
  });

  test("タイムゾーン指定子が無ければ指摘する", () => {
    const problems = collectProblems(
      '---\npublished_at: "2026-09-01T12:00:00"\n---\n\n本文\n',
      EXISTING,
    );
    expect(problems).toEqual([
      'published_at "2026-09-01T12:00:00" にタイムゾーン指定子がありません。date +"%Y-%m-%dT%H:%M:%S%z" の実測値を使ってください',
    ]);
  });

  test("未来時刻は指摘する", () => {
    const problems = collectProblems(
      '---\npublished_at: "2026-09-20T12:00:00+0900"\n---\n\n本文\n',
      EXISTING,
    );
    expect(problems).toEqual([
      'published_at "2026-09-20T12:00:00+0900" が未来時刻です',
    ]);
  });
});

describe("updated_at", () => {
  test("新規記事に updated_at があれば指摘する", () => {
    const problems = collectProblems(
      '---\npublished_at: "2026-09-01T12:00:00+0900"\nupdated_at: "2026-09-02T12:00:00+0900"\n---\n\n本文\n',
      NEW_ARTICLE,
    );
    expect(problems).toEqual([
      '新規記事の updated_at は null にしてください (未更新を表す。現在: "2026-09-02T12:00:00+0900")',
    ]);
  });

  test("published_at より前の updated_at は指摘する", () => {
    const problems = collectProblems(
      '---\npublished_at: "2026-09-01T12:00:00+0900"\nupdated_at: "2026-08-01T12:00:00+0900"\n---\n\n本文\n',
      EXISTING,
    );
    expect(problems).toEqual([
      'updated_at "2026-08-01T12:00:00+0900" が published_at "2026-09-01T12:00:00+0900" より前です',
    ]);
  });

  test("日時文字列でも null でもない updated_at は指摘する", () => {
    const problems = collectProblems(
      '---\npublished_at: "2026-09-01T12:00:00+0900"\nupdated_at: 42\n---\n\n本文\n',
      EXISTING,
    );
    expect(problems).toEqual([
      "updated_at は null または日時文字列にしてください (現在: 42)",
    ]);
  });
});
