import { describe, expect, test } from "vitest";
import { BASE_URL } from "@/lib/constants";
import {
  ALL_CATEGORIES,
  MIN_POSTS_FOR_TAG_PAGE,
  getAllBlogPosts,
  getTagsWithMinPosts,
} from "@/blog/_lib/blog";
import {
  blogIndexEntries,
  blogListBasePath,
  blogListMetadata,
  blogListPosts,
  hasTagPage,
} from "@/blog/_lib/blog-list";

describe("blogListPosts", () => {
  test("分類とタグの範囲は、その分類・タグの記事を新しい順のまま持つ", () => {
    const all = getAllBlogPosts();
    expect(blogListPosts({ type: "all" })).toEqual(all);
    expect(blogListPosts({ type: "category", category: "dev-notes" })).toEqual(
      all.filter((post) => post.category === "dev-notes"),
    );
    expect(blogListPosts({ type: "tag", tag: "Web開発" })).toEqual(
      all.filter((post) => post.tags.includes("Web開発")),
    );
  });
});

describe("hasTagPage", () => {
  test("記事が MIN_POSTS_FOR_TAG_PAGE 件以上のタグだけがページを持つ", () => {
    for (const tag of getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE)) {
      expect(hasTagPage(tag)).toBe(true);
    }
    expect(hasTagPage("存在しないタグ")).toBe(false);
  });
});

describe("blogListMetadata", () => {
  test("2ページ目からは題にページを添え、自分を canonical にする", () => {
    const first = blogListMetadata({ type: "all" }, 1);
    const second = blogListMetadata({ type: "all" }, 2);
    expect(first.title).toBe("AI試行錯誤ブログ | yolos.net");
    expect(second.title).toBe("AI試行錯誤ブログ（2ページ目） | yolos.net");
    expect(first.alternates?.canonical).toBe(`${BASE_URL}/blog`);
    expect(second.alternates?.canonical).toBe(`${BASE_URL}/blog/page/2`);
  });

  test("分類とタグの題は、その名前とブログの名前を言う", () => {
    expect(
      blogListMetadata({ type: "category", category: "dev-notes" }, 1).title,
    ).toBe("開発ノート - AI試行錯誤ブログ | yolos.net");
    expect(blogListMetadata({ type: "tag", tag: "Web開発" }, 1).title).toBe(
      "Web開発 - AI試行錯誤ブログ | yolos.net",
    );
    expect(blogListBasePath({ type: "tag", tag: "Web開発" })).toBe(
      `/blog/tag/${encodeURIComponent("Web開発")}`,
    );
  });
});

describe("blogIndexEntries", () => {
  test("分類はすべての分類を、タグはページを持つタグを、記事の多い順に並べる", () => {
    const { categories, tags } = blogIndexEntries();
    expect(categories).toHaveLength(ALL_CATEGORIES.length);
    expect(tags.map((entry) => entry.label).sort()).toEqual(
      getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE).sort(),
    );
    for (const entries of [categories, tags]) {
      const counts = entries.map((entry) => entry.count);
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
    }
  });
});
