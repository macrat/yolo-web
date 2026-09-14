/**
 * What `validateFrontmatter` does to a frontmatter block that breaks the schema.
 *
 * The reader of this validator is the writer of a post. A frontmatter key that
 * goes missing, or a value that comes back from YAML as another type than it
 * was written as, has no second reader: nothing downstream can tell a post that
 * carries no tags from a post whose `tags` key was lost, so a value quietly
 * swapped for a type-correct default (`""`, `[]`) publishes a post with its
 * tags or its category gone and reports success everywhere. The only moment the
 * loss can still be caught is here, and the only person who can act on it is
 * the writer — so every check below asks two things of a rejection: that it
 * happens at all, and that the message hands the writer what they need to fix
 * the file.
 *
 * A message needs four things: which file, which key, what the key must hold,
 * and what it actually held. The checks pin those four and nothing else — the
 * wording around them is free to change.
 *
 * `published_at` written without quotes is the case that all of this exists
 * for: YAML hands back a `Date`, and a `Date` encoded into a message as JSON
 * comes out as a quoted string — the exact spelling of a *correctly* written
 * value. A message that says the timestamp must be a string and shows a quoted
 * timestamp as what was found tells the writer nothing, so the type is named
 * instead, and that is checked here both ways.
 */

import { describe, test, expect } from "vitest";
import {
  validateFrontmatter,
  ALL_CATEGORIES,
  type BlogFrontmatter,
} from "@/blog/_lib/blog";

const FILE = "src/blog/content/example-post.md";

/** An unquoted `published_at` as YAML hands it back. */
const UNQUOTED_TIMESTAMP = new Date("2026-07-16T12:00:00+09:00");

/** A frontmatter block that obeys the schema, for one key at a time to break. */
function validData(): Record<string, unknown> {
  return {
    title: "フロントマターの検証",
    slug: "frontmatter-validation",
    description: "記事のフロントマターを検証する仕組みの解説。",
    published_at: "2026-07-16T12:00:00+09:00",
    updated_at: null,
    tags: ["Next.js", "テスト"],
    category: "dev-notes",
    series: null,
    related_tool_slugs: ["char-count"],
    draft: false,
  };
}

function dataWithout(key: string): Record<string, unknown> {
  const data = validData();
  delete data[key];
  return data;
}

function dataWith(key: string, value: unknown): Record<string, unknown> {
  return { ...validData(), [key]: value };
}

/**
 * The message `data` is rejected with.
 *
 * A frontmatter the validator accepts fails here, naming what was wrong with
 * it. Handing back a message that was never produced would turn every check
 * below into a complaint about a missing string, hiding the acceptance that is
 * the actual break.
 */
function rejectionOf(
  data: Record<string, unknown>,
  what: string,
  file: string = FILE,
): string {
  try {
    validateFrontmatter(file, data);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error(
    `${what} frontmatter が通った。この記事は欠けたまま、あるいは壊れた値のまま公開される`,
  );
}

/** The keys a post must carry; leaving any of them out is a broken post. */
const REQUIRED_KEYS = [
  "title",
  "slug",
  "description",
  "published_at",
  "updated_at",
  "tags",
  "category",
  "related_tool_slugs",
  "draft",
];

/**
 * A frontmatter that breaks the schema, and what its rejection has to tell the
 * writer: the key at fault, a phrase naming what that key must hold, and the
 * value that was found in the file.
 */
interface BrokenValue {
  what: string;
  key: string;
  value: unknown;
  mustSay: string;
  mustShow: string;
}

const BROKEN_VALUES: BrokenValue[] = [
  {
    what: "title に配列を書いた",
    key: "title",
    value: ["フロントマターの検証"],
    mustSay: "文字列",
    mustShow: '["フロントマターの検証"]',
  },
  {
    what: "slug に数値を書いた",
    key: "slug",
    value: 2026,
    mustSay: "文字列",
    mustShow: "2026",
  },
  {
    what: "description を空にした（YAML の null）",
    key: "description",
    value: null,
    mustSay: "文字列",
    mustShow: "null",
  },
  {
    what: "published_at に引用符なしの日時を書いた",
    key: "published_at",
    value: UNQUOTED_TIMESTAMP,
    mustSay: "文字列",
    mustShow: `Date(${UNQUOTED_TIMESTAMP.toISOString()})`,
  },
  {
    what: "updated_at に引用符なしの日時を書いた",
    key: "updated_at",
    value: UNQUOTED_TIMESTAMP,
    mustSay: "文字列または null",
    mustShow: `Date(${UNQUOTED_TIMESTAMP.toISOString()})`,
  },
  {
    what: "updated_at に配列を書いた",
    key: "updated_at",
    value: ["2026-07-16T12:00:00+09:00"],
    mustSay: "文字列または null",
    mustShow: '["2026-07-16T12:00:00+09:00"]',
  },
  {
    what: "tags に文字列を書いた",
    key: "tags",
    value: "Next.js",
    mustSay: "文字列の配列",
    mustShow: '"Next.js"',
  },
  {
    what: "tags を空にした（YAML の null）",
    key: "tags",
    value: null,
    mustSay: "文字列の配列",
    mustShow: "null",
  },
  {
    what: "tags に文字列でない要素を混ぜた",
    key: "tags",
    value: ["Next.js", 2026],
    mustSay: "文字列の配列",
    mustShow: '["Next.js",2026]',
  },
  {
    what: "related_tool_slugs に文字列を書いた",
    key: "related_tool_slugs",
    value: "char-count",
    mustSay: "文字列の配列",
    mustShow: '"char-count"',
  },
  {
    what: "category に未知のカテゴリIDを書いた",
    key: "category",
    value: "guide",
    mustSay: ALL_CATEGORIES.join(" / "),
    mustShow: '"guide"',
  },
  {
    what: "category に配列を書いた",
    key: "category",
    value: ["dev-notes"],
    mustSay: ALL_CATEGORIES.join(" / "),
    mustShow: '["dev-notes"]',
  },
  {
    what: "draft に文字列を書いた",
    key: "draft",
    value: "false",
    mustSay: "真偽値",
    mustShow: '"false"',
  },
  {
    what: "series に数値を書いた",
    key: "series",
    value: 1,
    mustSay: "文字列または null",
    mustShow: "1",
  },
];

describe("validateFrontmatter が規約に合う frontmatter を通すこと", () => {
  test("すべてのキーが書かれた frontmatter は、書かれたとおりの値で通る", () => {
    expect(validateFrontmatter(FILE, validData())).toEqual<BlogFrontmatter>({
      title: "フロントマターの検証",
      slug: "frontmatter-validation",
      description: "記事のフロントマターを検証する仕組みの解説。",
      published_at: "2026-07-16T12:00:00+09:00",
      updated_at: null,
      tags: ["Next.js", "テスト"],
      category: "dev-notes",
      series: null,
      related_tool_slugs: ["char-count"],
      draft: false,
    });
  });

  test("updated_at の null は「未更新」として通る", () => {
    expect(
      validateFrontmatter(FILE, dataWith("updated_at", null)).updated_at,
    ).toBeNull();
  });

  test("updated_at に日時の文字列を書いた記事も通る", () => {
    expect(
      validateFrontmatter(
        FILE,
        dataWith("updated_at", "2026-09-01T09:00:00+09:00"),
      ).updated_at,
    ).toBe("2026-09-01T09:00:00+09:00");
  });

  test("series を書かない記事は、シリーズ無しとして通る", () => {
    expect(validateFrontmatter(FILE, dataWithout("series")).series).toBeNull();
  });

  test("series に null を書いた記事も、シリーズ無しとして通る", () => {
    expect(
      validateFrontmatter(FILE, dataWith("series", null)).series,
    ).toBeNull();
  });

  test("series にシリーズIDを書いた記事は、そのIDのまま通る", () => {
    expect(
      validateFrontmatter(FILE, dataWith("series", "ai-agent-ops")).series,
    ).toBe("ai-agent-ops");
  });

  test.each(ALL_CATEGORIES)("category が %s の記事は通る", (category) => {
    expect(
      validateFrontmatter(FILE, dataWith("category", category)).category,
    ).toBe(category);
  });

  test("コードが読まないキーが書かれていても通る", () => {
    const data = dataWith("series", "ai-agent-ops");
    data.series_order = 3;
    data.trust_level = "verified";

    expect(validateFrontmatter(FILE, data).series).toBe("ai-agent-ops");
  });
});

describe("validateFrontmatter が必須キーの欠落を拒むこと", () => {
  test.each(REQUIRED_KEYS)("%s が無い frontmatter は拒まれる", (key) => {
    const message = rejectionOf(dataWithout(key), `${key} を書いていない`);

    expect(message, "どのファイルを直せばよいか分からない").toContain(FILE);
    expect(message, "どのキーが無いのか分からない").toContain(key);
    expect(
      message,
      "書いてもいない値を「実際に書かれていた値」として示されても、書き手は自分のファイルの中にそれを探せない",
    ).not.toContain("undefined");
  });

  test("キーの欠落は、値の型違いとは違う言い方で伝えられる", () => {
    // 「書き忘れた」と「書いたが形が違う」では、書き手がすることが違う。
    expect(rejectionOf(dataWithout("tags"), "tags を書いていない")).not.toBe(
      rejectionOf(dataWith("tags", "Next.js"), "tags に文字列を書いた"),
    );
  });
});

describe("validateFrontmatter が規約に合わない値を拒むこと", () => {
  test.each(BROKEN_VALUES)(
    "$what frontmatter は拒まれ、直し方が伝えられる",
    ({ what, key, value, mustSay, mustShow }) => {
      const message = rejectionOf(dataWith(key, value), what);

      expect(message, "どのファイルを直せばよいか分からない").toContain(FILE);
      expect(message, "どのキーが悪いのか分からない").toContain(key);
      expect(message, "そのキーに何を書けばよいのか分からない").toContain(
        mustSay,
      );
      expect(message, "ファイルに何が書かれていたのか分からない").toContain(
        mustShow,
      );
    },
  );

  test("引用符なしの日時は、引用符付きの文字列として示されない", () => {
    // YAML が Date にした値を JSON で書くと "2026-07-16T03:00:00.000Z" となり、
    // 正しく引用符を付けて書いた値と見分けがつかない。書き手は自分の書いた
    // 行が拒まれた理由に辿り着けなくなる。
    const message = rejectionOf(
      dataWith("published_at", UNQUOTED_TIMESTAMP),
      "published_at に引用符なしの日時を書いた",
    );

    expect(message).not.toContain(
      JSON.stringify(UNQUOTED_TIMESTAMP.toISOString()),
    );
  });

  test("メッセージが名指しするのは、いま読んでいるファイルであること", () => {
    // 記事は何十本もある。名前が固定なら、書き手はどれを開けばよいか分からない。
    const other = "src/blog/content/another-post.md";
    const message = rejectionOf(
      dataWithout("tags"),
      "tags を書いていない",
      other,
    );

    expect(message).toContain(other);
    expect(message).not.toContain(FILE);
  });
});
