import type { TrustLevel } from "@/lib/trust-levels";

export type ToolCategory =
  | "text"
  | "encoding"
  | "developer"
  | "security"
  | "generator";

export interface ToolMeta {
  slug: string;
  name: string; // Japanese display name
  nameEn: string; // English name (for potential i18n)
  /** SEO専用。meta descriptionとJSON-LD用。ページ上に表示しない */
  description: string; // Japanese, 120-160 chars for meta description
  shortDescription: string; // Japanese, ~50 chars for cards
  keywords: string[]; // Japanese SEO keywords
  category: ToolCategory;
  relatedSlugs: string[]; // slugs of related tools
  /** ISO 8601 date-time with timezone (e.g. '2026-02-19T09:25:57+09:00') */
  publishedAt: string;
  /** ISO 8601 date-time with timezone. Set when main content is updated. */
  updatedAt?: string;
  structuredDataType?: string; // JSON-LD @type (e.g., "WebApplication")
  /**
   * 信頼レベル。cycle-180 で TrustLevelBadge UI を全廃する決定（design-migration-plan.md L298 標準手順 6）に伴い、
   * Phase 4-8 で (new) 化されたツールの meta では本フィールドを **削除** する運用。
   * Phase 10.2 (B-337) で型自体を削除予定のため、過渡期は optional として並存。
   */
  trustLevel?: TrustLevel;

  /** 処理内容の説明テキスト。ゾーン3「このツールについて」セクションに表示する */
  howItWorks: string;

  /**
   * FAQ: Q&A形式の配列
   * B-024で実装済みのFAQPage JSON-LDのデータソースである。
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
