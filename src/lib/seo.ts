import type { Metadata } from "next";
import type { ToolMeta } from "@/tools/types";

const SITE_NAME = "Yolo-Web Tools";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yolo-web.example.com";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  console.warn(
    "[seo] NEXT_PUBLIC_BASE_URL is not set. Using fallback: https://yolo-web.example.com",
  );
}

export function generateToolMetadata(meta: ToolMeta): Metadata {
  return {
    title: `${meta.name} - 無料オンラインツール | ${SITE_NAME}`,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: `${meta.name} - 無料オンラインツール`,
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

export { BASE_URL, SITE_NAME };
