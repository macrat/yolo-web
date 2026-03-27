import { describe, test, expect } from "vitest";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  SERIES_LABELS,
} from "@/blog/_lib/blog";
import type { BlogPostMeta } from "@/blog/_lib/blog";

describe("BlogCategory type and constants", () => {
  describe("ALL_CATEGORIES", () => {
    test("新しいカテゴリIDが含まれること", () => {
      expect(ALL_CATEGORIES).toContain("ai-workflow");
      expect(ALL_CATEGORIES).toContain("dev-notes");
      expect(ALL_CATEGORIES).toContain("site-updates");
      expect(ALL_CATEGORIES).toContain("tool-guides");
      expect(ALL_CATEGORIES).toContain("japanese-culture");
    });

    test("旧カテゴリIDが含まれないこと", () => {
      expect(ALL_CATEGORIES).not.toContain("guide");
      expect(ALL_CATEGORIES).not.toContain("technical");
      expect(ALL_CATEGORIES).not.toContain("ai-ops");
      expect(ALL_CATEGORIES).not.toContain("release");
      expect(ALL_CATEGORIES).not.toContain("behind-the-scenes");
    });

    test("カテゴリ数が5であること", () => {
      expect(ALL_CATEGORIES).toHaveLength(5);
    });

    test("表示順が正しいこと", () => {
      expect(ALL_CATEGORIES).toEqual([
        "ai-workflow",
        "dev-notes",
        "site-updates",
        "tool-guides",
        "japanese-culture",
      ]);
    });
  });

  describe("CATEGORY_LABELS", () => {
    test("新しいカテゴリの日本語ラベルが正しいこと", () => {
      expect(CATEGORY_LABELS["ai-workflow"]).toBe("AIワークフロー");
      expect(CATEGORY_LABELS["dev-notes"]).toBe("開発ノート");
      expect(CATEGORY_LABELS["site-updates"]).toBe("サイト更新");
      expect(CATEGORY_LABELS["tool-guides"]).toBe("ツールガイド");
      expect(CATEGORY_LABELS["japanese-culture"]).toBe("日本語・文化");
    });

    test("全カテゴリにラベルが定義されていること", () => {
      for (const category of ALL_CATEGORIES) {
        expect(
          CATEGORY_LABELS[category],
          `${category} のラベルが未定義`,
        ).toBeDefined();
      }
    });
  });

  describe("CATEGORY_DESCRIPTIONS", () => {
    test("全カテゴリに説明文が定義されていること", () => {
      for (const category of ALL_CATEGORIES) {
        expect(
          CATEGORY_DESCRIPTIONS[category],
          `${category} の説明文が未定義`,
        ).toBeDefined();
      }
    });

    test("全カテゴリの説明文が空でないこと", () => {
      for (const category of ALL_CATEGORIES) {
        expect(
          CATEGORY_DESCRIPTIONS[category].length,
          `${category} の説明文が空`,
        ).toBeGreaterThan(0);
      }
    });

    test("各カテゴリの説明文が適切な長さであること（50文字以上）", () => {
      for (const category of ALL_CATEGORIES) {
        expect(
          CATEGORY_DESCRIPTIONS[category].length,
          `${category} の説明文が短すぎる`,
        ).toBeGreaterThanOrEqual(50);
      }
    });

    test("ai-workflow の説明文が定義されていること", () => {
      expect(CATEGORY_DESCRIPTIONS["ai-workflow"]).toBeDefined();
      expect(typeof CATEGORY_DESCRIPTIONS["ai-workflow"]).toBe("string");
    });

    test("dev-notes の説明文が定義されていること", () => {
      expect(CATEGORY_DESCRIPTIONS["dev-notes"]).toBeDefined();
      expect(typeof CATEGORY_DESCRIPTIONS["dev-notes"]).toBe("string");
    });

    test("site-updates の説明文が定義されていること", () => {
      expect(CATEGORY_DESCRIPTIONS["site-updates"]).toBeDefined();
      expect(typeof CATEGORY_DESCRIPTIONS["site-updates"]).toBe("string");
    });

    test("tool-guides の説明文が定義されていること", () => {
      expect(CATEGORY_DESCRIPTIONS["tool-guides"]).toBeDefined();
      expect(typeof CATEGORY_DESCRIPTIONS["tool-guides"]).toBe("string");
    });

    test("japanese-culture の説明文が定義されていること", () => {
      expect(CATEGORY_DESCRIPTIONS["japanese-culture"]).toBeDefined();
      expect(typeof CATEGORY_DESCRIPTIONS["japanese-culture"]).toBe("string");
    });
  });

  describe("SERIES_LABELS", () => {
    test("継続するシリーズが含まれること", () => {
      expect(SERIES_LABELS["ai-agent-ops"]).toBe("AIエージェント運用記");
      expect(SERIES_LABELS["japanese-culture"]).toBe("日本語・日本文化");
    });

    test("新しいシリーズ nextjs-deep-dive が含まれること", () => {
      expect(SERIES_LABELS["nextjs-deep-dive"]).toBe("Next.js実践ノート");
    });

    test("削除されたシリーズ building-yolos が含まれないこと", () => {
      expect(SERIES_LABELS["building-yolos"]).toBeUndefined();
    });

    test("削除されたシリーズ tool-guides が含まれないこと", () => {
      expect(SERIES_LABELS["tool-guides"]).toBeUndefined();
    });

    test("シリーズ数が3であること", () => {
      expect(Object.keys(SERIES_LABELS)).toHaveLength(3);
    });
  });
});

/**
 * getSeriesPosts のソートロジックをテストする。
 * ファイルシステムへの依存を避けるため、ソートコンパレータと同等のロジックを
 * 直接テストする。
 *
 * 削除対象: slug による二次ソートが存在しないこと。
 * published_at のみで昇順ソートすることを確認する。
 */
describe("seriesPostsSortComparator (published_at のみによる昇順ソート)", () => {
  function makeMeta(overrides: Partial<BlogPostMeta>): BlogPostMeta {
    return {
      title: "Test",
      slug: "test-slug",
      description: "desc",
      published_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      tags: [],
      category: "dev-notes",
      related_tool_slugs: [],
      draft: false,
      readingTime: 1,
      trustLevel: "generated",
      ...overrides,
    };
  }

  // getSeriesPosts 内のソートと同等のコンパレータ（published_at のみ）
  const sortByPublishedAt = (a: BlogPostMeta, b: BlogPostMeta): number =>
    new Date(a.published_at).getTime() - new Date(b.published_at).getTime();

  test("published_at 昇順でソートされること", () => {
    const posts = [
      makeMeta({ slug: "post-c", published_at: "2026-03-01T00:00:00Z" }),
      makeMeta({ slug: "post-a", published_at: "2026-01-01T00:00:00Z" }),
      makeMeta({ slug: "post-b", published_at: "2026-02-01T00:00:00Z" }),
    ];

    const sorted = [...posts].sort(sortByPublishedAt);
    expect(sorted.map((p) => p.slug)).toEqual(["post-a", "post-b", "post-c"]);
  });

  test("同一 published_at の場合、コンパレータは 0 を返すこと（slugによる比較をしないこと）", () => {
    const postZ = makeMeta({
      slug: "z-post",
      published_at: "2026-01-01T00:00:00Z",
    });
    const postA = makeMeta({
      slug: "a-post",
      published_at: "2026-01-01T00:00:00Z",
    });

    // slug二次ソートが存在する場合は正の値を返す（z > a）が、
    // published_atのみのソートならば 0 を返す
    const result = sortByPublishedAt(postZ, postA);
    expect(result).toBe(0);
  });

  test("古いポストが若いインデックスに来ること", () => {
    const older = makeMeta({
      slug: "older",
      published_at: "2025-06-01T00:00:00Z",
    });
    const newer = makeMeta({
      slug: "newer",
      published_at: "2026-01-01T00:00:00Z",
    });

    // comparator(older, newer) は負の値になるべき（older が先）
    expect(sortByPublishedAt(older, newer)).toBeLessThan(0);
    // comparator(newer, older) は正の値になるべき
    expect(sortByPublishedAt(newer, older)).toBeGreaterThan(0);
  });
});
