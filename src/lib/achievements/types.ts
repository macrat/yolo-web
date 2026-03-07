/**
 * Achievement system type definitions.
 *
 * All types for the achievement store persisted in localStorage
 * under the key "yolos-achievements".
 */

/** Per-content usage statistics */
export interface ContentStat {
  count: number;
  firstPlayedAt: string; // ISO 8601
  /**
   * Best time in seconds for game content.
   * Phase A: type definition only, not implemented yet.
   */
  bestTime?: number;
}

/** A single unlocked achievement */
export interface Achievement {
  unlockedAt: string; // ISO 8601
}

/** Daily content usage entry. Keys are content IDs, values indicate usage. */
export interface DailyEntry {
  [contentId: string]: boolean;
}

/** Badge rank for display styling */
export type BadgeRank = "bronze" | "silver" | "gold";

/** Badge definition describing unlock conditions */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  rank: BadgeRank;
  /**
   * Evaluate whether this badge should be unlocked.
   * Returns true if the condition is met.
   */
  check: (store: AchievementStore) => boolean;
}

/** Root store shape persisted in localStorage */
export interface AchievementStore {
  schemaVersion: number; // Initial value: 1, for migration management
  streak: {
    current: number;
    longest: number;
    lastPlayDate: string; // "YYYY-MM-DD" in JST
  };
  totalStats: {
    totalDaysPlayed: number;
    totalContentUsed: number;
    perContent: Record<string, ContentStat>;
  };
  achievements: Record<string, Achievement>; // Key is badge ID
  dailyProgress: Record<string, DailyEntry>; // Key is "YYYY-MM-DD", 90-day limit
}
