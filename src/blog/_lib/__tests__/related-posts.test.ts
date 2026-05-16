import { describe, test, expect } from "vitest";
import { getRelatedPosts } from "@/blog/_lib/blog";
import type { BlogPostMeta } from "@/blog/_lib/blog";

/** テスト用の BlogPostMeta を生成するヘルパー */
function makeMeta(overrides: Partial<BlogPostMeta>): BlogPostMeta {
  return {
    title: "Test Post",
    slug: "test-slug",
    description: "description",
    published_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tags: [],
    category: "dev-notes",
    related_tool_slugs: [],
    draft: false,
    readingTime: 3,
    ...overrides,
  };
}

describe("getRelatedPosts", () => {
  test("自分自身は結果に含まれないこと", () => {
    const current = makeMeta({ slug: "current", category: "dev-notes" });
    const other = makeMeta({ slug: "other", category: "dev-notes" });
    const all = [current, other];

    const result = getRelatedPosts(current, all);
    const slugs = result.map((p) => p.slug);
    expect(slugs).not.toContain("current");
  });

  test("同一シリーズの記事は結果に含まれないこと", () => {
    const current = makeMeta({
      slug: "current",
      category: "dev-notes",
      series: "my-series",
    });
    const sameSeries = makeMeta({
      slug: "same-series",
      category: "dev-notes",
      series: "my-series",
    });
    const noSeries = makeMeta({
      slug: "no-series",
      category: "dev-notes",
    });
    const all = [current, sameSeries, noSeries];

    const result = getRelatedPosts(current, all);
    const slugs = result.map((p) => p.slug);
    expect(slugs).not.toContain("same-series");
    expect(slugs).toContain("no-series");
  });

  test("最大3件を返すこと", () => {
    const current = makeMeta({ slug: "current", category: "dev-notes" });
    const others = Array.from({ length: 10 }, (_, i) =>
      makeMeta({ slug: `post-${i}`, category: "dev-notes" }),
    );
    const all = [current, ...others];

    const result = getRelatedPosts(current, all);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  test("同一カテゴリの記事がより高いスコアを得ること（カテゴリ違いより上位に来る）", () => {
    const current = makeMeta({
      slug: "current",
      category: "dev-notes",
      tags: ["shared-tag"],
    });
    // 同一カテゴリ + 共通タグ: score = 10 + 3 = 13
    const sameCategory = makeMeta({
      slug: "same-cat",
      category: "dev-notes",
      tags: ["shared-tag"],
    });
    // 異なるカテゴリ + 共通タグ: score = 0 + 3 = 3（スコード>0なので除外されない）
    const differentCategory = makeMeta({
      slug: "diff-cat",
      category: "ai-workflow",
      tags: ["shared-tag"],
    });
    const all = [current, differentCategory, sameCategory];

    const result = getRelatedPosts(current, all);
    // same-cat が diff-cat より先に来ること
    const sameCatIndex = result.findIndex((p) => p.slug === "same-cat");
    const diffCatIndex = result.findIndex((p) => p.slug === "diff-cat");
    expect(sameCatIndex).not.toBe(-1);
    expect(diffCatIndex).not.toBe(-1);
    expect(sameCatIndex).toBeLessThan(diffCatIndex);
  });

  test("共通タグが多い記事が高スコアを得ること", () => {
    const current = makeMeta({
      slug: "current",
      category: "dev-notes",
      tags: ["nextjs", "react", "typescript"],
    });
    const twoTagsMatch = makeMeta({
      slug: "two-tags",
      category: "ai-workflow",
      tags: ["nextjs", "react"],
    });
    const oneTagMatch = makeMeta({
      slug: "one-tag",
      category: "ai-workflow",
      tags: ["nextjs"],
    });
    const all = [current, oneTagMatch, twoTagsMatch];

    const result = getRelatedPosts(current, all);
    const twoTagsIndex = result.findIndex((p) => p.slug === "two-tags");
    const oneTagIndex = result.findIndex((p) => p.slug === "one-tag");
    expect(twoTagsIndex).toBeLessThan(oneTagIndex);
  });

  test("関連記事が0件のとき空配列を返すこと", () => {
    const current = makeMeta({ slug: "only-post", category: "dev-notes" });
    const result = getRelatedPosts(current, [current]);
    expect(result).toEqual([]);
  });

  test("現在の記事がシリーズなしのとき、他シリーズの記事は除外されないこと", () => {
    const current = makeMeta({ slug: "current", category: "dev-notes" });
    const withSeries = makeMeta({
      slug: "has-series",
      category: "dev-notes",
      series: "some-series",
    });
    const all = [current, withSeries];

    const result = getRelatedPosts(current, all);
    expect(result.map((p) => p.slug)).toContain("has-series");
  });

  test("スコア0の記事（カテゴリ違い・タグ一致なし）は返されないこと", () => {
    const current = makeMeta({
      slug: "current",
      category: "dev-notes",
      tags: ["nextjs"],
    });
    // カテゴリが異なりタグも一致しない→スコア0
    const unrelated1 = makeMeta({
      slug: "unrelated-1",
      category: "ai-workflow",
      tags: ["python"],
    });
    const unrelated2 = makeMeta({
      slug: "unrelated-2",
      category: "site-updates",
      tags: [],
    });
    const all = [current, unrelated1, unrelated2];

    const result = getRelatedPosts(current, all);
    const slugs = result.map((p) => p.slug);
    expect(slugs).not.toContain("unrelated-1");
    expect(slugs).not.toContain("unrelated-2");
  });
});
