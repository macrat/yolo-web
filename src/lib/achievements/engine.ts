/**
 * Achievement engine: core logic for recording plays and evaluating badges.
 *
 * The main entry point is `recordPlay()`, which:
 * 1. Updates daily progress for the given content
 * 2. Increments per-content and total usage counts
 * 3. Recalculates streak
 * 4. Evaluates all badge conditions
 * 5. Prunes old daily progress entries
 * 6. Saves to localStorage
 *
 * Design note on count behavior:
 * - dailyProgress is boolean per content per day, so duplicate calls
 *   on the same day for the same content are idempotent.
 * - totalStats.perContent[id].count increments on EVERY call, including
 *   quiz re-takes. This is intentional: "cumulative N uses" in badge
 *   conditions means total invocations including replays.
 */

import type { AchievementStore } from "./types";
import { ALL_CONTENT_IDS, BADGE_DEFINITIONS } from "./badges";
import { loadStore, saveStore, pruneDailyProgress } from "./storage";
import { getTodayJst } from "./date";

/** Result of a recordPlay call */
export interface RecordPlayResult {
  /** Updated store after recording */
  store: AchievementStore;
  /** Badge IDs that were newly unlocked by this play */
  newlyUnlocked: string[];
}

/**
 * Record a content play and evaluate achievements.
 *
 * This function is idempotent for dailyProgress (boolean per day)
 * but additive for perContent.count (every call increments).
 *
 * @param contentId - The content identifier (e.g., "irodori", "quiz-kanji-level")
 * @returns The updated store and any newly unlocked badge IDs, or null in SSR
 */
export function recordPlay(contentId: string): RecordPlayResult | null {
  const store = loadStore();
  if (!store) {
    // SSR environment
    return null;
  }

  const today = getTodayJst();

  // 1. Update daily progress
  if (!store.dailyProgress[today]) {
    store.dailyProgress[today] = {};
  }
  store.dailyProgress[today][contentId] = true;

  // 2. Update per-content stats
  if (!store.totalStats.perContent[contentId]) {
    store.totalStats.perContent[contentId] = {
      count: 0,
      firstPlayedAt: new Date().toISOString(),
    };
  }
  // Increment on every call (including re-takes) - intentional design
  store.totalStats.perContent[contentId].count += 1;

  // 3. Update aggregate stats
  store.totalStats.totalContentUsed = Object.keys(
    store.totalStats.perContent,
  ).length;
  store.totalStats.totalDaysPlayed = Object.keys(store.dailyProgress).length;

  // 4. Recalculate streak
  updateStreak(store, today);

  // 5. Evaluate badges and collect newly unlocked ones
  const newlyUnlocked = evaluateBadges(store);

  // 6. Prune old daily progress entries (90-day limit)
  pruneDailyProgress(store);

  // 7. Persist
  saveStore(store);

  return { store, newlyUnlocked };
}

/**
 * Recalculate the current streak based on today's date and lastPlayDate.
 *
 * Streak rules:
 * - Same day as lastPlayDate: no change (already counted)
 * - Consecutive day (yesterday): increment current streak
 * - Any other case: reset current streak to 1 (new streak starts today)
 * - Update longest if current exceeds it
 */
function updateStreak(store: AchievementStore, today: string): void {
  const lastPlay = store.streak.lastPlayDate;

  if (lastPlay === today) {
    // Already played today, no streak change
    return;
  }

  if (lastPlay === getYesterday(today)) {
    // Consecutive day: extend streak
    store.streak.current += 1;
  } else {
    // Gap or first play: start new streak
    store.streak.current = 1;
  }

  // Update longest streak record
  if (store.streak.current > store.streak.longest) {
    store.streak.longest = store.streak.current;
  }

  store.streak.lastPlayDate = today;
}

/**
 * Get yesterday's date string in "YYYY-MM-DD" format (JST).
 * Subtracts one day from the given JST date string.
 *
 * Uses Intl.DateTimeFormat with Asia/Tokyo timezone to avoid
 * dependence on the runtime's local timezone. Without this,
 * getFullYear/getMonth/getDate return values in the local timezone,
 * which produces wrong results for non-JST users.
 */
function getYesterday(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00+09:00");
  date.setTime(date.getTime() - 86_400_000);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Evaluate all badge conditions against the current store.
 * Returns an array of badge IDs that were newly unlocked.
 */
function evaluateBadges(store: AchievementStore): string[] {
  const newlyUnlocked: string[] = [];
  const now = new Date().toISOString();

  for (const badge of BADGE_DEFINITIONS) {
    // Skip already unlocked badges
    if (store.achievements[badge.id]) {
      continue;
    }

    if (badge.check(store)) {
      store.achievements[badge.id] = { unlockedAt: now };
      newlyUnlocked.push(badge.id);
    }
  }

  return newlyUnlocked;
}

// Re-export ALL_CONTENT_IDS for convenience
export { ALL_CONTENT_IDS };
