import type { TrustLevel } from "@/lib/trust-levels";

export type CheatsheetCategory = "developer" | "writing" | "devops";

export interface CheatsheetSection {
  id: string;
  title: string;
}

export interface CheatsheetMeta {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  category: CheatsheetCategory;
  relatedToolSlugs: string[];
  relatedCheatsheetSlugs: string[];
  sections: CheatsheetSection[];
  publishedAt: string;
  /** Content trust level */
  trustLevel: TrustLevel;

  /** 一行価値テキスト: 「誰が・何を・どう解決するか」（40字以内推奨） */
  valueProposition?: string;

  /**
   * 具体例: 入力→出力のサンプル
   * チートシートの場合:
   * - input: 対象ユーザーやシーン（例: 「Git初心者がブランチ操作に困った時」）
   * - output: 得られる情報（例: 「用途別に整理されたコマンド一覧をすぐに参照できる」）
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

export interface CheatsheetDefinition {
  meta: CheatsheetMeta;
  componentImport: () => Promise<{ default: React.ComponentType }>;
}
