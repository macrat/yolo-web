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
}
