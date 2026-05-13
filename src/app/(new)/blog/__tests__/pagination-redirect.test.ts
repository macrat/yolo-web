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

const allPosts = getAllBlogPosts();
const { totalPages: blogTotalPages } = paginate(
  allPosts,
  1,
  BLOG_POSTS_PER_PAGE,
);

describe("/blog/page/[page]", () => {
  test("dynamicParams=false と generateStaticParams が整合している", () => {
    expect(blogDynamicParams).toBe(false);

    const pages = generateBlogStaticParams().map(({ page }) => Number(page));
    const expectedPages = Array.from(
      { length: Math.max(blogTotalPages - 1, 0) },
      (_, i) => i + 2,
    );

    expect(pages).toEqual(expectedPages);
  });

  test("generateStaticParams が p2〜p5 の 4 個を返す（60 記事 / 12 件 = 5 ページ）", () => {
    const params = generateBlogStaticParams();
    // page 1 は除外され、page 2〜5 の 4 個が返る
    expect(params).toHaveLength(4);
    const pages = params.map(({ page }) => Number(page));
    expect(pages).toContain(2);
    expect(pages).toContain(3);
    expect(pages).toContain(4);
    expect(pages).toContain(5);
    expect(pages).not.toContain(6);
    expect(pages).not.toContain(1);
  }, 15000);
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

  test("generateStaticParams が 2 カテゴリ × 1 ページ = 2 個を返す（dev-notes と ai-workflow のみ p2 が生成）", () => {
    const params = generateCategoryStaticParams();
    // dev-notes（23件）と ai-workflow（16件）だけが 12件超 → p2 生成
    expect(params).toHaveLength(2);
    const categories = params.map((p) => p.category);
    expect(categories).toContain("dev-notes");
    expect(categories).toContain("ai-workflow");
  }, 15000);
});

describe("/blog/tag/[tag]/page/[page]", () => {
  test("dynamicParams=false と generateStaticParams が整合している", () => {
    expect(tagDynamicParams).toBe(false);
  });

  test("generateStaticParams が実体の p2 タグ数（3 タグ）を返す", () => {
    const params = generateTagStaticParams();
    // 実体確認（2026-05-08 時点）: 12件超のタグは設計パターン(21)/Web開発(17)/Next.js(15) の 3 タグ
    // AIエージェント(8)/失敗と学び(8)/ワークフロー(7) は 12 件未満のため p2 非生成
    // Note: 計画書 §完了基準 では「6 タグ」とあるが、researcher レポート 3 の数値が
    //       実際のコンテンツ件数と一致しない。AP-WF12 に従い実体（3 タグ）を採用。
    expect(params).toHaveLength(3);
  }, 15000);

  test("generateStaticParams に 12 件超の 3 タグが含まれる（設計パターン/Web開発/Next.js）", () => {
    const params = generateTagStaticParams();
    const tags = params.map((p) => p.tag);
    expect(tags).toContain("設計パターン");
    expect(tags).toContain("Web開発");
    expect(tags).toContain("Next.js");
  }, 15000);

  test("generateStaticParams の各タグ p2 ページが 12 件超の記事を持つ", () => {
    const params = generateTagStaticParams();
    for (const { tag } of params) {
      const posts = getPostsByTag(tag);
      expect(
        posts.length,
        `タグ「${tag}」の記事数が 12 件未満（p2 生成の条件を満たさない）`,
      ).toBeGreaterThanOrEqual(13); // 12件超（p2 以上が存在する）
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
