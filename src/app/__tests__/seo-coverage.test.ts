/**
 * SEO Coverage Test - Layer 2
 *
 * 全公開ルートのmetadataを横断的に検証する統合テスト。
 * 各ページのmetadataにcanonical URL、og:url、og:title、og:description、
 * og:siteNameが正しく設定されていることを確認する。
 */
import { describe, test, expect } from "vitest";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { allGameMetas, getGamePath } from "@/games/registry";

/**
 * 共通SEOメタデータアサーション関数。
 * canonical URL、og:url、og:title、og:description、og:siteNameの
 * 存在と一貫性を検証する。
 */

const gameSeoExpectations: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
  }
> = Object.fromEntries(
  allGameMetas.map((gameMeta) => [getGamePath(gameMeta.slug), gameMeta.seo]),
);

function assertSeoMetadata(
  meta: Metadata,
  expectedPath: string,
  label: string,
): void {
  // canonical URLの存在チェック
  const canonical = meta.alternates?.canonical;
  expect(canonical, `${label}: canonical URLが存在すること`).toBeDefined();
  const canonicalStr = String(canonical);
  expect(
    canonicalStr,
    `${label}: canonical URLがexpectedPathを含むこと`,
  ).toContain(expectedPath);

  // og:urlの存在チェック
  const og = meta.openGraph as Record<string, unknown> | undefined;
  expect(og?.url, `${label}: og:urlが存在すること`).toBeDefined();

  // canonical と og:url の一致チェック
  expect(og?.url, `${label}: og:urlがcanonicalと一致すること`).toBe(
    canonicalStr,
  );

  // og:title の存在チェック
  expect(og?.title, `${label}: og:titleが存在すること`).toBeDefined();

  // og:description の存在チェック
  expect(
    og?.description,
    `${label}: og:descriptionが存在すること`,
  ).toBeDefined();

  // og:siteName === SITE_NAME のチェック
  expect(og?.siteName, `${label}: og:siteNameが${SITE_NAME}であること`).toBe(
    SITE_NAME,
  );
}

function assertGameSeoMetadata(meta: Metadata, path: string): void {
  const expectedSeo = gameSeoExpectations[path];
  if (!expectedSeo) return;

  expect(meta.title, `${path}: titleがregistry由来であること`).toBe(
    `${expectedSeo.title} | ${SITE_NAME}`,
  );
  expect(meta.description, `${path}: descriptionがregistry由来であること`).toBe(
    expectedSeo.description,
  );
  expect(meta.keywords, `${path}: keywordsがregistry由来であること`).toEqual(
    expectedSeo.keywords,
  );

  const og = meta.openGraph as Record<string, unknown> | undefined;
  expect(og?.title, `${path}: og:titleがregistry由来であること`).toBe(
    expectedSeo.ogTitle,
  );
  expect(
    og?.description,
    `${path}: og:descriptionがregistry由来であること`,
  ).toBe(expectedSeo.ogDescription);
}

// -- 静的metadataページのテスト --

const staticPages: Array<{
  path: string;
  importMeta: () => Promise<Metadata>;
}> = [
  {
    path: "/",
    importMeta: () => import("@/app/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/about",
    importMeta: () =>
      import("@/app/about/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/games",
    importMeta: () =>
      import("@/app/games/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/games/kanji-kanaru",
    importMeta: () =>
      import("@/app/games/kanji-kanaru/page").then(
        (m) => m.metadata as Metadata,
      ),
  },
  {
    path: "/games/irodori",
    importMeta: () =>
      import("@/app/games/irodori/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/games/nakamawake",
    importMeta: () =>
      import("@/app/games/nakamawake/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/games/yoji-kimeru",
    importMeta: () =>
      import("@/app/games/yoji-kimeru/page").then(
        (m) => m.metadata as Metadata,
      ),
  },
  {
    path: "/tools",
    importMeta: () =>
      import("@/app/tools/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/blog",
    importMeta: () =>
      import("@/app/blog/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/memos",
    importMeta: () =>
      import("@/app/memos/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/quiz",
    importMeta: () =>
      import("@/app/quiz/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/cheatsheets",
    importMeta: () =>
      import("@/app/cheatsheets/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/dictionary",
    importMeta: () =>
      import("@/app/dictionary/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/dictionary/kanji",
    importMeta: () =>
      import("@/app/dictionary/kanji/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/dictionary/yoji",
    importMeta: () =>
      import("@/app/dictionary/yoji/page").then((m) => m.metadata as Metadata),
  },
  {
    path: "/dictionary/colors",
    importMeta: () =>
      import("@/app/dictionary/colors/page").then(
        (m) => m.metadata as Metadata,
      ),
  },
];

describe("静的metadataページのSEO検証", () => {
  test.each(staticPages)(
    "$path: SEO必須項目が存在する",
    async ({ path, importMeta }) => {
      const meta = await importMeta();
      expect(meta, `${path}: metadataがexportされていること`).toBeDefined();
      assertSeoMetadata(meta, path === "/" ? "/" : path, path);
      assertGameSeoMetadata(meta, path);
    },
  );
});

// -- 動的generateMetadataページのテスト --

describe("動的metadataページのSEO検証", () => {
  test("/memos/thread/[id]: SEO必須項目が存在する", async () => {
    const { getAllThreadRootIds } = await import("@/memos/_lib/memos");
    const { generateMetadata } = await import("@/app/memos/thread/[id]/page");
    const threadIds = getAllThreadRootIds();
    if (threadIds.length === 0) return; // データがなければスキップ
    const id = threadIds[0];
    const meta = await generateMetadata({
      params: Promise.resolve({ id }),
    });
    assertSeoMetadata(meta, `/memos/thread/${id}`, "/memos/thread/[id]");
  });

  test("/blog/page/[page]: SEO必須項目が存在する", async () => {
    const { getAllBlogPosts } = await import("@/blog/_lib/blog");
    const { paginate, BLOG_POSTS_PER_PAGE } = await import("@/lib/pagination");
    const allPosts = getAllBlogPosts();
    const { totalPages } = paginate(allPosts, 1, BLOG_POSTS_PER_PAGE);
    if (totalPages < 2) return; // 2ページ目がなければスキップ

    const { generateMetadata } = await import("@/app/blog/page/[page]/page");
    const meta = await generateMetadata({
      params: Promise.resolve({ page: "2" }),
    });
    assertSeoMetadata(meta, "/blog/page/2", "/blog/page/[page]");
  });

  test("/blog/category/[category]: SEO必須項目が存在する", async () => {
    const { ALL_CATEGORIES } = await import("@/blog/_lib/blog");
    if (ALL_CATEGORIES.length === 0) return;
    const category = ALL_CATEGORIES[0];

    const { generateMetadata } =
      await import("@/app/blog/category/[category]/page");
    const meta = await generateMetadata({
      params: Promise.resolve({ category }),
    });
    assertSeoMetadata(
      meta,
      `/blog/category/${category}`,
      "/blog/category/[category]",
    );
  });

  test("/blog/category/[category]/page/[page]: SEO必須項目が存在する", async () => {
    const { getAllBlogPosts, ALL_CATEGORIES } =
      await import("@/blog/_lib/blog");
    const { paginate, BLOG_POSTS_PER_PAGE } = await import("@/lib/pagination");

    // 2ページ以上あるカテゴリを探す
    let targetCategory: string | null = null;
    for (const category of ALL_CATEGORIES) {
      const allPosts = getAllBlogPosts();
      const categoryPosts = allPosts.filter((p) => p.category === category);
      const { totalPages } = paginate(categoryPosts, 1, BLOG_POSTS_PER_PAGE);
      if (totalPages >= 2) {
        targetCategory = category;
        break;
      }
    }
    if (!targetCategory) return; // 2ページ以上のカテゴリがなければスキップ

    const { generateMetadata } =
      await import("@/app/blog/category/[category]/page/[page]/page");
    const meta = await generateMetadata({
      params: Promise.resolve({ category: targetCategory, page: "2" }),
    });
    assertSeoMetadata(
      meta,
      `/blog/category/${targetCategory}/page/2`,
      "/blog/category/[category]/page/[page]",
    );
  });

  test("/tools/page/[page]: SEO必須項目が存在する", async () => {
    const { allToolMetas } = await import("@/tools/registry");
    const { TOOLS_PER_PAGE } = await import("@/lib/pagination");
    const totalPages = Math.ceil(allToolMetas.length / TOOLS_PER_PAGE);
    if (totalPages < 2) return; // 2ページ目がなければスキップ

    const { generateMetadata } = await import("@/app/tools/page/[page]/page");
    const meta = await generateMetadata({
      params: Promise.resolve({ page: "2" }),
    });
    assertSeoMetadata(meta, "/tools/page/2", "/tools/page/[page]");
  });

  test("/dictionary/kanji/category/[category]: SEO必須項目が存在する", async () => {
    const { getKanjiCategories } = await import("@/dictionary/_lib/kanji");
    const categories = getKanjiCategories();
    if (categories.length === 0) return;
    const category = categories[0];

    const { generateMetadata } =
      await import("@/app/dictionary/kanji/category/[category]/page");
    const meta = await generateMetadata({
      params: Promise.resolve({ category }),
    });
    assertSeoMetadata(
      meta,
      `/dictionary/kanji/category/${category}`,
      "/dictionary/kanji/category/[category]",
    );
  });

  test("/dictionary/yoji/category/[category]: SEO必須項目が存在する", async () => {
    const { getYojiCategories } = await import("@/dictionary/_lib/yoji");
    const categories = getYojiCategories();
    if (categories.length === 0) return;
    const category = categories[0];

    const { generateMetadata } =
      await import("@/app/dictionary/yoji/category/[category]/page");
    const meta = await generateMetadata({
      params: Promise.resolve({ category }),
    });
    assertSeoMetadata(
      meta,
      `/dictionary/yoji/category/${category}`,
      "/dictionary/yoji/category/[category]",
    );
  });

  test("/quiz/[slug]/result/[resultId]: SEO必須項目が存在する", async () => {
    const { getAllQuizSlugs, getResultIdsForQuiz } =
      await import("@/quiz/registry");
    const slugs = getAllQuizSlugs();
    if (slugs.length === 0) return;

    const slug = slugs[0];
    const resultIds = getResultIdsForQuiz(slug);
    if (resultIds.length === 0) return;
    const resultId = resultIds[0];

    const { generateMetadata } =
      await import("@/app/quiz/[slug]/result/[resultId]/page");
    const meta = await generateMetadata({
      params: Promise.resolve({ slug, resultId }),
    });
    assertSeoMetadata(
      meta,
      `/quiz/${slug}/result/${resultId}`,
      "/quiz/[slug]/result/[resultId]",
    );
  });
});
