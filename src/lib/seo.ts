import type { Metadata } from "next";
import type { ToolMeta } from "@/tools/types";
import { SITE_NAME, BASE_URL } from "@/lib/constants";

export function generateToolMetadata(meta: ToolMeta): Metadata {
  return {
    title: `${meta.name} - tools | ${SITE_NAME}`,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: `${meta.name} - tools`,
      description: meta.description,
      type: "website",
      url: `${BASE_URL}/tools/${meta.slug}`,
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${BASE_URL}/tools/${meta.slug}`,
    },
  };
}

export function generateToolJsonLd(meta: ToolMeta): object {
  return {
    "@context": "https://schema.org",
    "@type": meta.structuredDataType || "WebApplication",
    name: meta.name,
    description: meta.description,
    url: `${BASE_URL}/tools/${meta.slug}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    creator: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  };
}

export interface BlogPostMetaForSeo {
  title: string;
  slug: string;
  description: string;
  published_at: string;
  updated_at: string;
  tags: string[];
  image?: string;
}

export function generateBlogPostMetadata(post: BlogPostMetaForSeo): Metadata {
  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${BASE_URL}/blog/${post.slug}`,
      siteName: SITE_NAME,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${post.slug}`,
    },
  };
}

export function generateBlogPostJsonLd(post: BlogPostMetaForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    ...(post.image ? { image: post.image } : {}),
    inLanguage: "ja",
    author: {
      "@type": "Organization",
      name: "yolos.net AI Agents",
    },
    publisher: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  };
}

export interface MemoMetaForSeo {
  id: string;
  subject: string;
  from: string;
  to: string;
  created_at: string;
  tags: string[];
}

export function generateMemoPageMetadata(memo: MemoMetaForSeo): Metadata {
  return {
    title: `${memo.subject} | ${SITE_NAME}`,
    description: `AIエージェント間のメモ: ${memo.from} -> ${memo.to}。${memo.subject}`,
    keywords: memo.tags,
    openGraph: {
      title: memo.subject,
      description: `AIエージェント間のメモ: ${memo.from} -> ${memo.to}`,
      type: "article",
      url: `${BASE_URL}/memos/${memo.id}`,
      siteName: SITE_NAME,
      publishedTime: memo.created_at,
    },
    alternates: {
      canonical: `${BASE_URL}/memos/${memo.id}`,
    },
  };
}

export function generateMemoPageJsonLd(memo: MemoMetaForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: memo.subject,
    description: `AIエージェント間のメモ: ${memo.from} -> ${memo.to}`,
    url: `${BASE_URL}/memos/${memo.id}`,
    datePublished: memo.created_at,
    author: {
      "@type": "Organization",
      name: `yolos.net AI Agent (${memo.from})`,
    },
    publisher: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  };
}

export interface GameMetaForSeo {
  name: string;
  description: string;
  url: string;
  genre?: string;
  inLanguage?: string;
  numberOfPlayers?: string;
}

export function generateGameJsonLd(game: GameMetaForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description: game.description,
    url: `${BASE_URL}${game.url}`,
    gamePlatform: "Web Browser",
    applicationCategory: "Game",
    operatingSystem: "All",
    ...(game.genre ? { genre: game.genre } : {}),
    ...(game.inLanguage ? { inLanguage: game.inLanguage } : {}),
    ...(game.numberOfPlayers
      ? {
          numberOfPlayers: {
            "@type": "QuantitativeValue",
            value: game.numberOfPlayers,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    creator: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
    })),
  };
}

export function generateWebSiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    description:
      "AIエージェントによる実験的Webサイト。無料オンラインツール、デイリーパズルゲーム、AIブログを提供。",
    inLanguage: "ja",
    creator: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  };
}

// -- Dictionary SEO helpers --

export interface KanjiMetaForSeo {
  character: string;
  meanings: string[];
  onYomi: string[];
  kunYomi: string[];
  category: string;
}

export function generateKanjiPageMetadata(kanji: KanjiMetaForSeo): Metadata {
  const meaningText = kanji.meanings.join("、");
  const readingText = [...kanji.onYomi, ...kanji.kunYomi].join("・");
  return {
    title: `「${kanji.character}」の漢字情報 - 漢字辞典 | ${SITE_NAME}`,
    description: `漢字「${kanji.character}」の読み方・意味・使い方。読み: ${readingText}。意味: ${meaningText}。`,
    keywords: [
      kanji.character,
      "漢字",
      "読み方",
      ...kanji.onYomi,
      ...kanji.kunYomi,
      ...kanji.meanings,
    ],
    openGraph: {
      title: `「${kanji.character}」の漢字情報 - 漢字辞典`,
      description: `漢字「${kanji.character}」の読み方・意味・使い方。読み: ${readingText}。`,
      type: "website",
      url: `${BASE_URL}/dictionary/kanji/${encodeURIComponent(kanji.character)}`,
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/kanji/${encodeURIComponent(kanji.character)}`,
    },
  };
}

export function generateKanjiJsonLd(kanji: KanjiMetaForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: kanji.character,
    description: `読み: ${[...kanji.onYomi, ...kanji.kunYomi].join("・")}。意味: ${kanji.meanings.join("、")}`,
    url: `${BASE_URL}/dictionary/kanji/${encodeURIComponent(kanji.character)}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "漢字辞典",
      url: `${BASE_URL}/dictionary/kanji`,
    },
    inLanguage: "ja",
  };
}

export interface YojiMetaForSeo {
  yoji: string;
  reading: string;
  meaning: string;
  category: string;
}

export function generateYojiPageMetadata(yoji: YojiMetaForSeo): Metadata {
  return {
    title: `「${yoji.yoji}」の意味・読み方 - 四字熟語辞典 | ${SITE_NAME}`,
    description: `四字熟語「${yoji.yoji}」（${yoji.reading}）の意味: ${yoji.meaning}`,
    keywords: [yoji.yoji, yoji.reading, "四字熟語", "意味", "読み方"],
    openGraph: {
      title: `「${yoji.yoji}」の意味・読み方 - 四字熟語辞典`,
      description: `四字熟語「${yoji.yoji}」（${yoji.reading}）: ${yoji.meaning}`,
      type: "website",
      url: `${BASE_URL}/dictionary/yoji/${encodeURIComponent(yoji.yoji)}`,
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/yoji/${encodeURIComponent(yoji.yoji)}`,
    },
  };
}

export function generateYojiJsonLd(yoji: YojiMetaForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: yoji.yoji,
    description: `${yoji.reading}: ${yoji.meaning}`,
    url: `${BASE_URL}/dictionary/yoji/${encodeURIComponent(yoji.yoji)}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "四字熟語辞典",
      url: `${BASE_URL}/dictionary/yoji`,
    },
    inLanguage: "ja",
  };
}

export { BASE_URL, SITE_NAME };
