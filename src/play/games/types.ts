import type { TrustLevel } from "@/lib/trust-levels";

/**
 * Game metadata interface.
 * Single source of truth for all game-related metadata.
 *
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
  /**
   * デイリーゲームかどうか。
   * trueのゲームはNextGameBannerの「今日のパズル」進捗に含まれる。
   * falseまたは未設定のゲームはランダム出題型など、デイリー以外のゲーム。
   * デフォルト: false（後方互換性のため、既存ゲームはregistryで明示的にtrueを設定）
   */
  isDaily?: boolean;
  /** OGP image subtitle */
  ogpSubtitle: string;
  /** ISO 8601 date-time with timezone (e.g. '2026-02-19T09:25:57+09:00') */
  publishedAt: string;
  /** ISO 8601 date-time with timezone. Set when main content is updated. */
  updatedAt?: string;
  /** Sitemap configuration */
  sitemap: {
    changeFrequency: "daily" | "weekly" | "monthly";
    priority: number;
  };
  /** Content trust level */
  trustLevel: TrustLevel;
  /** Optional supplementary note about trust level details */
  trustNote?: string;

  /** SEO metadata for game detail page */
  seo: {
    /** page metadata title (without site suffix) */
    title: string;
    /** page meta description / JSON-LD description */
    description: string;
    /** meta keywords */
    keywords: string[];
    /** Open Graph / Twitter title */
    ogTitle: string;
    /** Open Graph / Twitter description */
    ogDescription: string;
  };

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
   * B-024で実装済みのFAQPage JSON-LDのデータソースである。
   * answerはプレーンテキストのみ（HTML・特殊記法不可）。
   */
  faq?: Array<{
    question: string;
    answer: string;
  }>;

  /** 関連ゲームのスラグ配列（関連ゲーム導線に使用） */
  relatedGameSlugs?: string[];
}
