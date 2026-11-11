import type { Metadata } from "next";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import { generateGameJsonLd } from "@/lib/seo";
// 画像の描き方は server-only なので、型だけを読む。
import type { ShareOpenGraphImage } from "@/lib/share-image";
import type { PlayContentMeta } from "./types";

/**
 * contentType と category の組み合わせから表示用カテゴリ名を導出する。
 *
 * - game                      → 「パズル」
 * - quiz + knowledge          → 「クイズ」
 * - quiz + personality        → 「診断」
 * - fortune (contentType)     → 「運勢」
 */
export function resolveDisplayCategory(meta: PlayContentMeta): string {
  if (meta.contentType === "fortune") return "運勢";
  if (meta.contentType === "quiz") {
    if (meta.category === "knowledge") return "クイズ";
    if (meta.category === "personality") return "診断";
  }
  return "パズル";
}

/**
 * 遊びのページのメタデータ。
 *
 * title タグと OG の題は、seoTitle があれば「${seoTitle} | ${SITE_NAME}」、無ければ
 * 「${title} - ${表示カテゴリ} | ${SITE_NAME}」。
 *
 * shareImage はページの画像（`shareOpenGraphImage` が作る値）で、渡されたときだけ `openGraph.images` に入れる。
 * Next.js は `twitter:image` をこれから補う。渡さないページ（占い）は、自分のディレクトリの画像のファイルを使う。
 */
export function generatePlayMetadata(
  meta: PlayContentMeta,
  shareImage?: ShareOpenGraphImage,
): Metadata {
  const displayCategory = resolveDisplayCategory(meta);
  const canonicalUrl = `${BASE_URL}/play/${meta.slug}`;

  const titleTag = meta.seoTitle
    ? `${meta.seoTitle} | ${SITE_NAME}`
    : `${meta.title} - ${displayCategory} | ${SITE_NAME}`;
  const ogTitle = meta.seoTitle
    ? meta.seoTitle
    : `${meta.title} - ${displayCategory}`;

  return {
    title: titleTag,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: ogTitle,
      description: meta.description,
      type: "website",
      url: canonicalUrl,
      siteName: SITE_NAME,
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: meta.description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

/**
 * PlayContentMeta から Schema.org の JSON-LD オブジェクトを生成する。
 *
 * contentType に応じて Schema.org type を出し分ける。
 * - game    → VideoGame（generateGameJsonLd を再利用）
 * - quiz    → Quiz
 * - fortune → WebApplication
 */
export function generatePlayJsonLd(meta: PlayContentMeta): object {
  if (meta.contentType === "game") {
    return generateGameJsonLd({
      name: meta.title,
      description: meta.description,
      // generateGameJsonLd は内部で `${BASE_URL}${url}` として完全 URL を組み立てるため、
      // ルート相対パス（"/" 始まり）を渡す必要がある。絶対 URL を渡すと二重になる。
      url: `/play/${meta.slug}`,
      genre: "Puzzle",
      inLanguage: "ja",
      numberOfPlayers: "1",
      publishedAt: meta.publishedAt,
      updatedAt: meta.updatedAt,
    });
  }

  if (meta.contentType === "quiz") {
    return {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: meta.title,
      description: meta.description,
      url: `${BASE_URL}/play/${meta.slug}`,
      educationalLevel: "general",
      inLanguage: "ja",
      datePublished: meta.publishedAt,
      dateModified: meta.updatedAt ?? meta.publishedAt,
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

  // fortune および未知の contentType はシンプルな WebApplication として扱う
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: meta.title,
    description: meta.description,
    url: `${BASE_URL}/play/${meta.slug}`,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "All",
    inLanguage: "ja",
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt ?? meta.publishedAt,
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
