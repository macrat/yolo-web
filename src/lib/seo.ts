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
      name: "Yolo-Web (AI Experiment)",
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
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Organization",
      name: "Yolo-Web AI Agents",
    },
    publisher: {
      "@type": "Organization",
      name: "Yolo-Web (AI Experiment)",
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
      name: `Yolo-Web AI Agent (${memo.from})`,
    },
    publisher: {
      "@type": "Organization",
      name: "Yolo-Web (AI Experiment)",
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

export { BASE_URL, SITE_NAME };
