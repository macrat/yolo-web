import type { MetadataRoute } from "next";
import { allToolMetas } from "@/tools/registry";
import { getAllBlogPosts, ALL_CATEGORIES } from "@/blog/_lib/blog";
import { getAllPublicMemos } from "@/memos/_lib/memos";
import { BASE_URL } from "@/lib/constants";
import { BLOG_POSTS_PER_PAGE, TOOLS_PER_PAGE } from "@/lib/pagination";
import { getAllKanjiChars, getKanjiCategories } from "@/dictionary/_lib/kanji";
import { getAllYojiIds, getYojiCategories } from "@/dictionary/_lib/yoji";
import { getAllColorSlugs, getColorCategories } from "@/dictionary/_lib/colors";
import {
  KANJI_DICTIONARY_META,
  YOJI_DICTIONARY_META,
  COLOR_DICTIONARY_META,
} from "@/dictionary/_lib/dictionary-meta";
import { allQuizMetas, getResultIdsForQuiz } from "@/quiz/registry";
import { allGameMetas, getGamePath } from "@/games/registry";
import { allCheatsheetMetas } from "@/cheatsheets/registry";

/**
 * Generate sitemap entries for pagination pages (page 2 and above).
 * Page 1 is the canonical URL (e.g., /blog) and is listed separately.
 */
function generatePaginationEntries(
  basePath: string,
  totalItems: number,
  perPage: number,
  priority: number,
  lastModified: Date,
): MetadataRoute.Sitemap {
  const totalPages = Math.ceil(totalItems / perPage);
  const entries: MetadataRoute.Sitemap = [];

  for (let page = 2; page <= totalPages; page++) {
    entries.push({
      url: `${BASE_URL}${basePath}/page/${page}`,
      lastModified,
      changeFrequency: "weekly",
      priority,
    });
  }

  return entries;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = allToolMetas.map((meta) => ({
    url: `${BASE_URL}/tools/${meta.slug}`,
    lastModified: new Date(meta.updatedAt || meta.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const allPosts = getAllBlogPosts();

  const blogPosts = allPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Static page fixed date
  const ABOUT_LAST_UPDATED = new Date("2026-02-28T00:00:00+09:00");

  // Latest blog date
  const latestBlogDate =
    allPosts.length > 0
      ? new Date(allPosts[0].updated_at || allPosts[0].published_at)
      : new Date("2026-02-13T00:00:00+09:00");

  // Latest tool date
  const latestToolDate =
    allToolMetas.length > 0
      ? new Date(
          Math.max(
            ...allToolMetas.map((m) =>
              new Date(m.updatedAt || m.publishedAt).getTime(),
            ),
          ),
        )
      : new Date("2026-02-13T00:00:00+09:00");

  // Latest game date
  const latestGameDate =
    allGameMetas.length > 0
      ? new Date(
          Math.max(
            ...allGameMetas.map((g) =>
              new Date(g.updatedAt || g.publishedAt).getTime(),
            ),
          ),
        )
      : new Date("2026-02-13T00:00:00+09:00");

  // Latest memo date
  const allMemos = getAllPublicMemos();
  const latestMemoDate =
    allMemos.length > 0
      ? new Date(
          Math.max(...allMemos.map((m) => new Date(m.created_at).getTime())),
        )
      : new Date("2026-02-13T00:00:00+09:00");

  // Latest quiz date
  const latestQuizDate =
    allQuizMetas.length > 0
      ? new Date(
          Math.max(
            ...allQuizMetas.map((q) =>
              new Date(q.updatedAt || q.publishedAt).getTime(),
            ),
          ),
        )
      : new Date("2026-02-13T00:00:00+09:00");

  // Latest cheatsheet date
  const latestCheatsheetDate =
    allCheatsheetMetas.length > 0
      ? new Date(
          Math.max(
            ...allCheatsheetMetas.map((c) =>
              new Date(c.updatedAt || c.publishedAt).getTime(),
            ),
          ),
        )
      : new Date("2026-02-13T00:00:00+09:00");

  // Latest dictionary date (most recent among 3 dictionaries)
  const latestDictionaryDate = new Date(
    Math.max(
      new Date(
        KANJI_DICTIONARY_META.updatedAt || KANJI_DICTIONARY_META.publishedAt,
      ).getTime(),
      new Date(
        YOJI_DICTIONARY_META.updatedAt || YOJI_DICTIONARY_META.publishedAt,
      ).getTime(),
      new Date(
        COLOR_DICTIONARY_META.updatedAt || COLOR_DICTIONARY_META.publishedAt,
      ).getTime(),
    ),
  );

  // Homepage uses the most recent date across all content
  const homepageDate = new Date(
    Math.max(
      latestBlogDate.getTime(),
      latestToolDate.getTime(),
      latestGameDate.getTime(),
      latestMemoDate.getTime(),
      latestQuizDate.getTime(),
      latestCheatsheetDate.getTime(),
      latestDictionaryDate.getTime(),
    ),
  );

  // Pagination pages for blog list (page 2+)
  const blogPaginationPages = generatePaginationEntries(
    "/blog",
    allPosts.length,
    BLOG_POSTS_PER_PAGE,
    0.7,
    latestBlogDate,
  );

  // Pagination pages for each blog category (page 2+)
  const blogCategoryPaginationPages = ALL_CATEGORIES.flatMap((category) => {
    const categoryPosts = allPosts.filter((p) => p.category === category);
    const categoryLastMod =
      categoryPosts.length > 0
        ? new Date(categoryPosts[0].updated_at || categoryPosts[0].published_at)
        : latestBlogDate;
    return generatePaginationEntries(
      `/blog/category/${category}`,
      categoryPosts.length,
      BLOG_POSTS_PER_PAGE,
      0.6,
      categoryLastMod,
    );
  });

  // Pagination pages for tools list (page 2+)
  const toolsPaginationPages = generatePaginationEntries(
    "/tools",
    allToolMetas.length,
    TOOLS_PER_PAGE,
    0.7,
    latestToolDate,
  );

  const memoPages = allMemos.map((memo) => ({
    url: `${BASE_URL}/memos/${memo.id}`,
    lastModified: new Date(memo.created_at),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: homepageDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: latestToolDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: latestBlogDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/memos`,
      lastModified: latestMemoDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/games`,
      lastModified: latestGameDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...allGameMetas.map((game) => ({
      url: `${BASE_URL}${getGamePath(game.slug)}`,
      lastModified: new Date(game.updatedAt || game.publishedAt),
      changeFrequency: game.sitemap.changeFrequency,
      priority: game.sitemap.priority,
    })),
    {
      url: `${BASE_URL}/about`,
      lastModified: ABOUT_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Dictionary pages
    {
      url: `${BASE_URL}/dictionary`,
      lastModified: latestDictionaryDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/dictionary/kanji`,
      lastModified: new Date(
        KANJI_DICTIONARY_META.updatedAt || KANJI_DICTIONARY_META.publishedAt,
      ),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dictionary/yoji`,
      lastModified: new Date(
        YOJI_DICTIONARY_META.updatedAt || YOJI_DICTIONARY_META.publishedAt,
      ),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...getAllKanjiChars().map((char) => ({
      url: `${BASE_URL}/dictionary/kanji/${encodeURIComponent(char)}`,
      lastModified: new Date(
        KANJI_DICTIONARY_META.updatedAt || KANJI_DICTIONARY_META.publishedAt,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getKanjiCategories().map((cat) => ({
      url: `${BASE_URL}/dictionary/kanji/category/${cat}`,
      lastModified: new Date(
        KANJI_DICTIONARY_META.updatedAt || KANJI_DICTIONARY_META.publishedAt,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...getAllYojiIds().map((yoji) => ({
      url: `${BASE_URL}/dictionary/yoji/${encodeURIComponent(yoji)}`,
      lastModified: new Date(
        YOJI_DICTIONARY_META.updatedAt || YOJI_DICTIONARY_META.publishedAt,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getYojiCategories().map((cat) => ({
      url: `${BASE_URL}/dictionary/yoji/category/${cat}`,
      lastModified: new Date(
        YOJI_DICTIONARY_META.updatedAt || YOJI_DICTIONARY_META.publishedAt,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${BASE_URL}/dictionary/colors`,
      lastModified: new Date(
        COLOR_DICTIONARY_META.updatedAt || COLOR_DICTIONARY_META.publishedAt,
      ),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...getAllColorSlugs().map((slug) => ({
      url: `${BASE_URL}/dictionary/colors/${slug}`,
      lastModified: new Date(
        COLOR_DICTIONARY_META.updatedAt || COLOR_DICTIONARY_META.publishedAt,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getColorCategories().map((cat) => ({
      url: `${BASE_URL}/dictionary/colors/category/${cat}`,
      lastModified: new Date(
        COLOR_DICTIONARY_META.updatedAt || COLOR_DICTIONARY_META.publishedAt,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Quiz pages
    {
      url: `${BASE_URL}/quiz`,
      lastModified: latestQuizDate,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    ...allQuizMetas.map((meta) => ({
      url: `${BASE_URL}/quiz/${meta.slug}`,
      lastModified: new Date(meta.updatedAt || meta.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...allQuizMetas.flatMap((meta) =>
      getResultIdsForQuiz(meta.slug).map((resultId) => ({
        url: `${BASE_URL}/quiz/${meta.slug}/result/${resultId}`,
        lastModified: new Date(meta.updatedAt || meta.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ),
    // Cheatsheet pages
    {
      url: `${BASE_URL}/cheatsheets`,
      lastModified: latestCheatsheetDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...allCheatsheetMetas.map((meta) => ({
      url: `${BASE_URL}/cheatsheets/${meta.slug}`,
      lastModified: new Date(meta.updatedAt || meta.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Blog category pages (page 1)
    ...ALL_CATEGORIES.map((category) => {
      const categoryPosts = allPosts.filter((p) => p.category === category);
      const lastMod =
        categoryPosts.length > 0
          ? new Date(
              categoryPosts[0].updated_at || categoryPosts[0].published_at,
            )
          : latestBlogDate;
      return {
        url: `${BASE_URL}/blog/category/${category}`,
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      };
    }),
    ...toolPages,
    ...toolsPaginationPages,
    ...blogPosts,
    ...blogPaginationPages,
    ...blogCategoryPaginationPages,
    ...memoPages,
  ];
}
