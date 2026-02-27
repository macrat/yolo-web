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
  description: string; // Japanese, 120-160 chars for meta description
  shortDescription: string; // Japanese, ~50 chars for cards
  keywords: string[]; // Japanese SEO keywords
  category: ToolCategory;
  relatedSlugs: string[]; // slugs of related tools
  publishedAt: string; // ISO date
  structuredDataType?: string; // JSON-LD @type (e.g., "WebApplication")
  trustLevel: TrustLevel;

  /** 一行価値テキスト: 「誰が・何を・どう解決するか」（40字以内推奨） */
  valueProposition?: string;

  /**
   * 具体例: 入力→出力のサンプル
   * - input: ツールへの入力テキスト
   * - output: ツールからの出力テキスト
   * - description: 補足説明テキスト
   */
  usageExample?: {
    input: string;
    output: string;
    description?: string;
  };

  /**
   * FAQ: Q&A形式の配列
   * 将来B-024でJSON-LD（FAQPage schema）化を前提とした構造。
   * answerはプレーンテキストのみ（HTML・特殊記法不可）。
   */
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ToolDefinition {
  meta: ToolMeta;
  componentImport: () => Promise<{ default: React.ComponentType }>;
}
