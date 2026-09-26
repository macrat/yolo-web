import { describe, expect, test } from "vitest";
import {
  ALL_CATEGORIES,
  MIN_POSTS_FOR_TAG_PAGE,
  getTagsWithMinPosts,
} from "@/blog/_lib/blog";
import {
  BLOG_LIST_PER_PAGE,
  blogListPosts,
  type BlogListScope,
} from "@/blog/_lib/blog-list";
import { listPageCount } from "@/lib/list-pages";
import {
  dynamicParams as blogDynamicParams,
  generateStaticParams as generateBlogStaticParams,
} from "@/app/blog/page/[page]/page";
import {
  dynamicParams as categoryDynamicParams,
  generateStaticParams as generateCategoryStaticParams,
} from "@/app/blog/category/[category]/page/[page]/page";
import {
  dynamicParams as tagDynamicParams,
  generateStaticParams as generateTagStaticParams,
} from "@/app/blog/tag/[tag]/page/[page]/page";

// 件数に依存する固定の値は書かない。記事が増えても、範囲の件数から数えたページと一致することを見る。

/** 範囲の2ページ目から最後のページまでの番号。 */
function expectedPages(scope: BlogListScope): number[] {
  const count = listPageCount(blogListPosts(scope).length, BLOG_LIST_PER_PAGE);
  return Array.from({ length: count - 1 }, (_, index) => index + 2);
}

describe("ブログの一覧の2ページ目からの経路", () => {
  test("/blog/page/[page] は範囲の外の番号を 404 にし、2ページ目から最後のページまでを生成する", () => {
    expect(blogDynamicParams).toBe(false);
    expect(generateBlogStaticParams().map(({ page }) => Number(page))).toEqual(
      expectedPages({ type: "all" }),
    );
  });

  test("/blog/category/[category]/page/[page] は分類ごとに2ページ目から最後のページまでを生成する", () => {
    expect(categoryDynamicParams).toBe(false);
    const params = generateCategoryStaticParams();
    for (const category of ALL_CATEGORIES) {
      expect(
        params
          .filter((param) => param.category === category)
          .map(({ page }) => Number(page)),
      ).toEqual(expectedPages({ type: "category", category }));
    }
  });

  test("/blog/tag/[tag]/page/[page] はタグごとに2ページ目から最後のページまでを生成する", () => {
    expect(tagDynamicParams).toBe(false);
    const params = generateTagStaticParams();
    for (const tag of getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE)) {
      expect(
        params
          .filter((param) => param.tag === tag)
          .map(({ page }) => Number(page)),
      ).toEqual(expectedPages({ type: "tag", tag }));
    }
  }, 15000);
});
