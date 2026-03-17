/**
 * Type definitions for the daily fortune feature.
 */

/** A single daily fortune entry */
export interface DailyFortuneEntry {
  /** Unique identifier */
  id: string;
  /** Fortune title (quirky, unexpected angle) */
  title: string;
  /** Fortune description (humorous, max 3 sentences) */
  description: string;
  /** Lucky item (unexpected, thematically linked) */
  luckyItem: string;
  /** Today's action (absurdly difficult or specific) */
  luckyAction: string;
  /** Fortune rating on a 1-5 scale (non-round numbers allowed) */
  rating: number;
}
