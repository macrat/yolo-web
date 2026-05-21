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
   * @deprecated Phase 8.1 全 34 ツール完了時に型・テスト・実装ごと削除予定（backlog B-xxx Priority P2）。
   * cycle-200 T-2 で char-count の meta.ts から物理削除済み。他 33 ツールも順次削除。
   * optional 化は根本解決ではないが、型削除は Phase 8.1 全件完了後の一括処理のため暫定措置として optional にする。
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
