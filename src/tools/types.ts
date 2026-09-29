import type { ToolCategory } from "./categories";

export interface ToolMeta {
  slug: string;
  name: string; // Japanese display name
  nameEn: string; // English name (for potential i18n)
  /** SEO専用。meta descriptionとJSON-LD用。ページ上に表示しない */
  description: string; // Japanese, 120-160 chars for meta description
  /**
   * 道具が何をするかを一言で言う短い説明。道具の一覧と関連ツールの行の説明、道具のページの画像の副題、
   * 道具のページの「このツールについて」の最初の段落に出る。
   */
  shortDescription: string;
  keywords: string[]; // Japanese SEO keywords
  category: ToolCategory;
  relatedSlugs: string[]; // slugs of related tools
  /** ISO 8601 date-time with timezone (e.g. '2026-02-19T09:25:57+09:00') */
  publishedAt: string;
  /** ISO 8601 date-time with timezone. Set when main content is updated. */
  updatedAt?: string;
  structuredDataType?: string; // JSON-LD @type (e.g., "WebApplication")

  /** 処理内容の説明テキスト。道具のページの「このツールについて」で、短い説明に続く段落に出る */
  howItWorks: string;

  /**
   * FAQ: Q&A形式の配列
   * FAQPage JSON-LD のデータソースである。
   * answerはプレーンテキストのみ（HTML・特殊記法不可）。
   */
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ToolDefinition {
  meta: ToolMeta;
}
