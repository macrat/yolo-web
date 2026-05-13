import { describe, expect, test } from "vitest";
import {
  ALL_CATEGORIES,
  getAllBlogPosts,
  getPostsByTag,
  type BlogCategory,
} from "@/blog/_lib/blog";
import { BLOG_POSTS_PER_PAGE, paginate } from "@/lib/pagination";
import {
  dynamicParams as blogDynamicParams,
  generateStaticParams as generateBlogStaticParams,
} from "@/app/(new)/blog/page/[page]/page";
import {
  dynamicParams as categoryDynamicParams,
  generateStaticParams as generateCategoryStaticParams,
} from "@/app/(new)/blog/category/[category]/page/[page]/page";
import {
  dynamicParams as tagDynamicParams,
  generateStaticParams as generateTagStaticParams,
} from "@/app/(new)/blog/tag/[tag]/page/[page]/page";
import nextConfig from "../../../../../next.config";

// 件数依存の固定 assertion はここに置かない。
// 記事数ごとのページ数計算ロジックは src/lib/__tests__/pagination.test.ts に集約済み。

const allPosts = getAllBlogPosts();
const { totalPages: blogTotalPages } = paginate(
  allPosts,
  1,
  BLOG_POSTS_PER_PAGE,
);

describe("/blog/page/[page]", () => {
  // dynamicParams=false なので、generateStaticParams が返すページ外の URL は 404 になる。
  // その前提で、生成されるパラメータが実際のページ数と一致することを動的に検証する。
  test("dynamicParams=false と generateStaticParams が整合している", () => {
    expect(blogDynamicParams).toBe(false);

    const pages = generateBlogStaticParams().map(({ page }) => Number(page));
    const expectedPages = Array.from(
      { length: Math.max(blogTotalPages - 1, 0) },
      (_, i) => i + 2,
    );

    expect(pages).toEqual(expectedPages);
  });
});

describe("/blog/category/[category]/page/[page]", () => {
  const category = ALL_CATEGORIES[0] as BlogCategory;
  const categoryPosts = allPosts.filter((p) => p.category === category);
  const { totalPages: categoryTotalPages } = paginate(
    categoryPosts,
    1,
    BLOG_POSTS_PER_PAGE,
  );

  test("dynamicParams=false と generateStaticParams が整合している", () => {
    expect(categoryDynamicParams).toBe(false);

    const categoryPages = generateCategoryStaticParams()
      .filter((param) => param.category === category)
      .map((param) => Number(param.page));
    const expectedPages = Array.from(
      { length: Math.max(categoryTotalPages - 1, 0) },
      (_, i) => i + 2,
    );

    expect(categoryPages).toEqual(expectedPages);
  });
});

describe("/blog/tag/[tag]/page/[page]", () => {
  test("dynamicParams=false であること", () => {
    expect(tagDynamicParams).toBe(false);
  });

  // generateStaticParams が返す各タグが、実際に p2 生成条件（12件超）を満たすことを動的に検証する。
  // 特定タグ名や件数のハードコードは行わない。
  test("generateStaticParams の各タグが p2 生成条件（12件超）を満たす", () => {
    const params = generateTagStaticParams();
    for (const { tag } of params) {
      const posts = getPostsByTag(tag);
      expect(
        posts.length,
        `タグ「${tag}」の記事数が 12 件未満（p2 生成の条件を満たさない）`,
      ).toBeGreaterThanOrEqual(13);
    }
  }, 15000);
});

describe("next.config.ts: paginationRedirects", () => {
  test("/blog/tag/:tag/page/1 → /blog/tag/:tag の 308 永続リダイレクトが定義されている（B-334-3-7）", async () => {
    const redirects = await nextConfig.redirects!();
    const tagPageRedirect = redirects.find(
      (r) =>
        r.source === "/blog/tag/:tag/page/1" &&
        r.destination === "/blog/tag/:tag",
    );
    expect(
      tagPageRedirect,
      "/blog/tag/:tag/page/1 → /blog/tag/:tag のリダイレクトが定義されていない",
    ).toBeDefined();
    expect(tagPageRedirect!.permanent).toBe(true);
  });

  test("既存の /blog/page/1 → /blog リダイレクトが維持されている", async () => {
    const redirects = await nextConfig.redirects!();
    const blogPageRedirect = redirects.find(
      (r) => r.source === "/blog/page/1" && r.destination === "/blog",
    );
    expect(blogPageRedirect).toBeDefined();
    expect(blogPageRedirect!.permanent).toBe(true);
  });

  test("既存の /blog/category/:category/page/1 → /blog/category/:category リダイレクトが維持されている", async () => {
    const redirects = await nextConfig.redirects!();
    const categoryPageRedirect = redirects.find(
      (r) =>
        r.source === "/blog/category/:category/page/1" &&
        r.destination === "/blog/category/:category",
    );
    expect(categoryPageRedirect).toBeDefined();
    expect(categoryPageRedirect!.permanent).toBe(true);
  });
});
