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

  /**
   * ページの頭で h1 の下に置く要約。何を、どこまでに当てる（作る）かを1文で言う。
   * 320px の画面で2行に収まる長さ（約30字）にする。
   */
  summary: string;

  /**
   * 盤の印の意味を言う凡例。要約の下に、この並びのとおりに置く（判定の印の「◯ 一致」、グループに添える
   * 難易度の「難易度1（易しい）〜」「難易度4（とても難しい）」）。画面の幅が足りないときは項目のあいだで折れるので、
   * 括弧の一続きを項目の中に収める。盤の読み上げも同じ語で言う。印を持たないゲームは持たない。
   */
  legend?: readonly string[];

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
