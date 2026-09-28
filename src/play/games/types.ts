/** 凡例の1項目。 */
export interface GameLegendEntry {
  /**
   * 盤に出る印（「◯」など）。読み上げでは読ませず、意味の語だけを読ませる。印の字は読み上げで別の語
   * （× を「かける」など）になり、盤のマスの読み上げ（「部首: 一致」）とも食い違うため。
   */
  mark?: string;
  /** 印の意味。盤のマスの読み上げも同じ語で言う。 */
  meaning: string;
}

/** 盤の印の意味を言う凡例。 */
export interface GameLegend {
  /** 何の凡例かを言う名前。読み上げでリストの名前になる。 */
  name: string;
  entries: readonly GameLegendEntry[];
}

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
  /** Difficulty label */
  difficulty: string;
  /** Keywords for search index */
  keywords: string[];
  /** localStorage stats key (e.g. "kanji-kanaru-stats") */
  statsKey: string;
  /** デイリーゲームかどうか。true のゲームが、解き終えた画面の今日の進み（NextGameBanner）に数えられる。 */
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
   * ページの頭で h1 の下に置く要約。今日の問題で何を、どこまでに当てる（作る）かを言う。
   * 320px の画面で2行に収まる長さ（約30字）にする。
   */
  summary: string;

  /** 盤の印の意味を言う凡例。要約の下に置く。印を持たないゲームは持たない。 */
  legend?: GameLegend;

  /**
   * よくある質問。ページの「よくある質問」の節と FAQPage の JSON-LD の元になる。
   * answer はプレーンテキストのみ（HTML・特殊記法不可）。
   */
  faq?: Array<{
    question: string;
    answer: string;
  }>;

  /** 関連ゲームのスラグ配列（関連ゲーム導線に使用） */
  relatedGameSlugs?: string[];
}
