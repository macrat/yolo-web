import type { MetadataRoute } from "next";
import { allToolMetas } from "@/tools/registry";
import {
  getAllBlogPosts,
  ALL_CATEGORIES,
  getTagsWithMinPosts,
  getPostsByTag,
  MIN_POSTS_FOR_TAG_INDEX,
} from "@/blog/_lib/blog";
import { BASE_URL } from "@/lib/constants";
import { getAllColorSlugs, getColorCategories } from "@/dictionary/_lib/colors";
import {
  KANJI_DICTIONARY_META,
  YOJI_DICTIONARY_META,
  COLOR_DICTIONARY_META,
} from "@/dictionary/_lib/dictionary-meta";
import { getAllSlugs as getAllHumorSlugs } from "@/humor-dict/data";
import { humorDictMeta } from "@/humor-dict/meta";
import { allQuizMetas } from "@/play/quiz/registry";
import { allGameMetas, getGamePath } from "@/play/games/registry";
import { allCheatsheetMetas } from "@/cheatsheets/registry";
// (legacy) Route Group 配下に移動したページのメタ情報は @/ エイリアスで参照する
import { ABOUT_LAST_MODIFIED } from "@/app/(legacy)/about/meta";
import { ACHIEVEMENTS_LAST_MODIFIED } from "@/app/(legacy)/achievements/meta";
import { PRIVACY_LAST_MODIFIED } from "@/app/(legacy)/privacy/meta";
import { DAILY_FORTUNE_LAST_MODIFIED } from "@/app/(legacy)/play/daily/meta";

type ContentMeta = {
  publishedAt: string;
  updatedAt?: string;
};

function parseRequiredDate(value: string, context: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`[sitemap] Invalid date in ${context}: ${value}`);
  }
  return date;
}

function getLastModifiedDate(meta: ContentMeta, context: string): Date {
  const dateValue = meta.updatedAt || meta.publishedAt;
  if (!dateValue) {
    throw new Error(`[sitemap] Missing updatedAt/publishedAt in ${context}`);
  }
  return parseRequiredDate(dateValue, context);
}

function getLatestDate<T>(
  items: T[],
  getDate: (item: T, index: number) => Date,
  context: string,
): Date {
  if (items.length === 0) {
    throw new Error(`[sitemap] No items found for ${context}`);
  }

  return new Date(
    Math.max(...items.map((item, index) => getDate(item, index).getTime())),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const allPosts = getAllBlogPosts();

  const latestBlogDate = getLatestDate(
    allPosts,
    (post, index) =>
      parseRequiredDate(
        post.updated_at || post.published_at,
        `blog posts[${index}] (${post.slug})`,
      ),
    "blog posts",
  );
  const latestToolDate = getLatestDate(
    allToolMetas,
    (meta, index) =>
      getLastModifiedDate(meta, `tools[${index}] (${meta.slug})`),
    "tool metas",
  );
  const latestGameDate = getLatestDate(
    allGameMetas,
    (meta, index) =>
      getLastModifiedDate(meta, `games[${index}] (${meta.slug})`),
    "game metas",
  );
  const latestQuizDate = getLatestDate(
    allQuizMetas,
    (meta, index) => getLastModifiedDate(meta, `quiz[${index}] (${meta.slug})`),
    "quiz metas",
  );
  const fortuneDate = parseRequiredDate(
    DAILY_FORTUNE_LAST_MODIFIED,
    "play/daily/meta.ts",
  );
  // /play 一覧ページはゲーム・クイズ・Fortuneの全コンテンツの最新日時を使用する
  const latestPlayDate = getLatestDate(
    [latestGameDate, latestQuizDate, fortuneDate],
    (date) => date,
    "play content dates",
  );
  const latestCheatsheetDate = getLatestDate(
    allCheatsheetMetas,
    (meta, index) =>
      getLastModifiedDate(meta, `cheatsheets[${index}] (${meta.slug})`),
    "cheatsheet metas",
  );

  const latestDictionaryDate = getLatestDate(
    [
      KANJI_DICTIONARY_META,
      YOJI_DICTIONARY_META,
      COLOR_DICTIONARY_META,
      humorDictMeta,
    ],
    (meta, index) => getLastModifiedDate(meta, `dictionary metas[${index}]`),
    "dictionary metas",
  );

  const aboutLastModified = parseRequiredDate(
    ABOUT_LAST_MODIFIED,
    "about/meta.ts",
  );

  const privacyLastModified = parseRequiredDate(
    PRIVACY_LAST_MODIFIED,
    "privacy/meta.ts",
  );

  const achievementsLastModified = parseRequiredDate(
    ACHIEVEMENTS_LAST_MODIFIED,
    "achievements/meta.ts",
  );

  const homepageDate = getLatestDate(
    [
      latestBlogDate,
      latestToolDate,
      latestGameDate,
      latestQuizDate,
      fortuneDate,
      latestCheatsheetDate,
      latestDictionaryDate,
      aboutLastModified,
      achievementsLastModified,
      privacyLastModified,
    ],
    (date) => date,
    "homepage source dates",
  );

  // タグページ（5件以上の記事を持つタグのみ indexable としてサイトマップに追加）
  const indexableTags = getTagsWithMinPosts(MIN_POSTS_FOR_TAG_INDEX);
  const tagSitemapEntries = indexableTags.flatMap((tag) => {
    const tagPosts = getPostsByTag(tag);
    if (tagPosts.length === 0) return [];

    const lastModified = getLatestDate(
      tagPosts,
      (post, index) =>
        parseRequiredDate(
          post.updated_at || post.published_at,
          `blog tag ${tag}[${index}] (${post.slug})`,
        ),
      `blog tag ${tag}`,
    );

    return [
      {
        url: `${BASE_URL}/blog/tag/${encodeURIComponent(tag)}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
    ];
  });

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
      url: `${BASE_URL}/play`,
      lastModified: latestPlayDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...allGameMetas.map((game, index) => ({
      url: `${BASE_URL}${getGamePath(game.slug)}`,
      lastModified: getLastModifiedDate(game, `games[${index}] (${game.slug})`),
      changeFrequency: game.sitemap.changeFrequency,
      priority: game.sitemap.priority,
    })),
    {
      url: `${BASE_URL}/about`,
      lastModified: aboutLastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/achievements`,
      lastModified: achievementsLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: privacyLastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/dictionary`,
      lastModified: latestDictionaryDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // 漢字辞典と四字熟語辞典の詳細ページは独自性が低いのでSEO上の効果はあまり期待できない。
    // クロールバジェットを他のページに集中させるためにsitemap.xmlには掲載しない。
    {
      url: `${BASE_URL}/dictionary/kanji`,
      lastModified: getLastModifiedDate(
        KANJI_DICTIONARY_META,
        "dictionary meta (kanji)",
      ),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dictionary/yoji`,
      lastModified: getLastModifiedDate(
        YOJI_DICTIONARY_META,
        "dictionary meta (yoji)",
      ),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dictionary/colors`,
      lastModified: getLastModifiedDate(
        COLOR_DICTIONARY_META,
        "dictionary meta (colors)",
      ),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...getAllColorSlugs().map((slug) => ({
      url: `${BASE_URL}/dictionary/colors/${slug}`,
      lastModified: getLastModifiedDate(
        COLOR_DICTIONARY_META,
        "dictionary meta (colors)",
      ),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getColorCategories().map((cat) => ({
      url: `${BASE_URL}/dictionary/colors/category/${cat}`,
      lastModified: getLastModifiedDate(
        COLOR_DICTIONARY_META,
        "dictionary meta (colors)",
      ),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${BASE_URL}/dictionary/humor`,
      lastModified: getLastModifiedDate(
        humorDictMeta,
        "dictionary meta (humor)",
      ),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    ...getAllHumorSlugs().map((slug) => ({
      url: `${BASE_URL}/dictionary/humor/${slug}`,
      lastModified: getLastModifiedDate(
        humorDictMeta,
        "dictionary meta (humor)",
      ),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // /quiz エントリは /play に統合済み。/play/:slug としてサイトマップに掲載する。
    ...allQuizMetas.map((meta, index) => ({
      url: `${BASE_URL}/play/${meta.slug}`,
      lastModified: getLastModifiedDate(meta, `quiz[${index}] (${meta.slug})`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/play/daily`,
      lastModified: fortuneDate,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/cheatsheets`,
      lastModified: latestCheatsheetDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...allCheatsheetMetas.map((meta, index) => ({
      url: `${BASE_URL}/cheatsheets/${meta.slug}`,
      lastModified: getLastModifiedDate(
        meta,
        `cheatsheets[${index}] (${meta.slug})`,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...ALL_CATEGORIES.flatMap((category) => {
      const categoryPosts = allPosts.filter(
        (post) => post.category === category,
      );
      // Skip categories with no posts yet (e.g. during category reorganization
      // before all article frontmatters have been migrated to the new category IDs).
      if (categoryPosts.length === 0) return [];

      const lastModified = getLatestDate(
        categoryPosts,
        (post, index) =>
          parseRequiredDate(
            post.updated_at || post.published_at,
            `blog category ${category}[${index}] (${post.slug})`,
          ),
        `blog category ${category}`,
      );

      return [
        {
          url: `${BASE_URL}/blog/category/${category}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        },
      ];
    }),
    // indexable tag pages (5+ posts)
    ...tagSitemapEntries,
    ...allToolMetas.map((meta, index) => ({
      url: `${BASE_URL}/tools/${meta.slug}`,
      lastModified: getLastModifiedDate(meta, `tools[${index}] (${meta.slug})`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...allPosts.map((post, index) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: parseRequiredDate(
        post.updated_at || post.published_at,
        `blog posts[${index}] (${post.slug})`,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
