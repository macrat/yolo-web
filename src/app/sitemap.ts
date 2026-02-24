import type { MetadataRoute } from "next";
import { allToolMetas } from "@/tools/registry";
import { getAllBlogPosts, ALL_CATEGORIES } from "@/lib/blog";
import { getAllPublicMemos } from "@/lib/memos";
import { BASE_URL } from "@/lib/constants";
import { BLOG_POSTS_PER_PAGE, TOOLS_PER_PAGE } from "@/lib/pagination";
import { getAllKanjiChars, getKanjiCategories } from "@/lib/dictionary/kanji";
import { getAllYojiIds, getYojiCategories } from "@/lib/dictionary/yoji";
import { getAllColorSlugs, getColorCategories } from "@/lib/dictionary/colors";
import { getAllQuizSlugs, getResultIdsForQuiz } from "@/lib/quiz/registry";
import { allGameMetas, getGamePath } from "@/lib/games/registry";

/**
 * Generate sitemap entries for pagination pages (page 2 and above).
 * Page 1 is the canonical URL (e.g., /blog) and is listed separately.
 */
function generatePaginationEntries(
  basePath: string,
  totalItems: number,
  perPage: number,
  priority: number,
): MetadataRoute.Sitemap {
  const totalPages = Math.ceil(totalItems / perPage);
  const entries: MetadataRoute.Sitemap = [];

  for (let page = 2; page <= totalPages; page++) {
    entries.push({
      url: `${BASE_URL}${basePath}/page/${page}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority,
    });
  }

  return entries;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = allToolMetas.map((meta) => ({
    url: `${BASE_URL}/tools/${meta.slug}`,
    lastModified: new Date(meta.publishedAt),
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

  // Pagination pages for blog list (page 2+)
  const blogPaginationPages = generatePaginationEntries(
    "/blog",
    allPosts.length,
    BLOG_POSTS_PER_PAGE,
    0.7,
  );

  // Pagination pages for each blog category (page 2+)
  const blogCategoryPaginationPages = ALL_CATEGORIES.flatMap((category) => {
    const categoryPosts = allPosts.filter((p) => p.category === category);
    return generatePaginationEntries(
      `/blog/category/${category}`,
      categoryPosts.length,
      BLOG_POSTS_PER_PAGE,
      0.6,
    );
  });

  // Pagination pages for tools list (page 2+)
  const toolsPaginationPages = generatePaginationEntries(
    "/tools",
    allToolMetas.length,
    TOOLS_PER_PAGE,
    0.7,
  );

  const memoPages = getAllPublicMemos().map((memo) => ({
    url: `${BASE_URL}/memos/${memo.id}`,
    lastModified: new Date(memo.created_at),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/memos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/games`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...allGameMetas.map((game) => ({
      url: `${BASE_URL}${getGamePath(game.slug)}`,
      lastModified: new Date(),
      changeFrequency: game.sitemap.changeFrequency,
      priority: game.sitemap.priority,
    })),
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Dictionary pages
    {
      url: `${BASE_URL}/dictionary`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/dictionary/kanji`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dictionary/yoji`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...getAllKanjiChars().map((char) => ({
      url: `${BASE_URL}/dictionary/kanji/${encodeURIComponent(char)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getKanjiCategories().map((cat) => ({
      url: `${BASE_URL}/dictionary/kanji/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...getAllYojiIds().map((yoji) => ({
      url: `${BASE_URL}/dictionary/yoji/${encodeURIComponent(yoji)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getYojiCategories().map((cat) => ({
      url: `${BASE_URL}/dictionary/yoji/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${BASE_URL}/colors`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...getAllColorSlugs().map((slug) => ({
      url: `${BASE_URL}/colors/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getColorCategories().map((cat) => ({
      url: `${BASE_URL}/colors/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Quiz pages
    {
      url: `${BASE_URL}/quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...getAllQuizSlugs().map((slug) => ({
      url: `${BASE_URL}/quiz/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...getAllQuizSlugs().flatMap((slug) =>
      getResultIdsForQuiz(slug).map((resultId) => ({
        url: `${BASE_URL}/quiz/${slug}/result/${resultId}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ),
    ...toolPages,
    ...toolsPaginationPages,
    ...blogPosts,
    ...blogPaginationPages,
    ...blogCategoryPaginationPages,
    ...memoPages,
  ];
}
