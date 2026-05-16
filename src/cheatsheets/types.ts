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
  /** ISO 8601 date-time with timezone (e.g. '2026-02-19T09:25:57+09:00') */
  publishedAt: string;
  /** ISO 8601 date-time with timezone. Set when main content is updated. */
  updatedAt?: string;

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
   * B-024で実装済みのFAQPage JSON-LDのデータソースである。
   * answerはプレーンテキストのみ（HTML・特殊記法不可）。
   */
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface CheatsheetDefinition {
  meta: CheatsheetMeta;
}
