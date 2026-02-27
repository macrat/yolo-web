import type { TrustLevel } from "@/lib/trust-levels";

/**
 * Game metadata interface.
 * Single source of truth for all game-related metadata.
 *
 * Note: longDescription (page.tsx meta description) and seoKeywords
 * are kept in each game's page.tsx to align with Next.js metadata pattern.
 * They may be integrated here in the future if needed.
 */
export interface GameMeta {
  /** URL slug (e.g. "kanji-kanaru") */
  slug: string;
  /** Japanese title (e.g. "漢字カナール") */
  title: string;
  /** Short description for cards (~30 chars, used on top page) */
  shortDescription: string;
  /** Longer description (~60 chars, used on game list page and search index) */
  description: string;
  /** Icon emoji */
  icon: string;
  /** Theme color (CSS hex) */
  accentColor: string;
  /** Difficulty label */
  difficulty: string;
  /** Keywords for search index */
  keywords: string[];
  /** localStorage stats key (e.g. "kanji-kanaru-stats") */
  statsKey: string;
  /** OGP image subtitle */
  ogpSubtitle: string;
  /** Sitemap configuration */
  sitemap: {
    changeFrequency: "daily" | "weekly" | "monthly";
    priority: number;
  };
  /** Content trust level */
  trustLevel: TrustLevel;
  /** Optional supplementary note about trust level details */
  trustNote?: string;

  /** 一行価値テキスト: 「誰が・何を・どう解決するか」（40字以内推奨） */
  valueProposition?: string;

  /**
   * 具体例: 入力→出力のサンプル
   * ゲームの場合:
   * - input: ゲームの遊び方や挑戦シーン（例: 「漢字1文字を6回以内に推理」）
   * - output: 得られる体験（例: 「部首・画数・読みのヒントで正解にたどり着く快感」）
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

  /** 関連ゲームのスラグ配列（関連ゲーム導線に使用） */
  relatedGameSlugs?: string[];
}
