/**
 * Badge definitions and content ID registry for the achievement system.
 *
 * Content IDs use the "quiz-" prefix for quiz slugs to avoid
 * collisions with game slugs.
 */

import type { AchievementStore, BadgeDefinition } from "./types";

/** localStorage key for the achievement store */
export const STORAGE_KEY = "yolos-achievements";

/** Game content IDs (4 games) */
const GAME_IDS = [
  "irodori",
  "kanji-kanaru",
  "nakamawake",
  "yoji-kimeru",
] as const;

/** Quiz content IDs (8 quizzes, prefixed with "quiz-") */
const QUIZ_IDS = [
  "quiz-traditional-color",
  "quiz-yoji-personality",
  "quiz-yoji-level",
  "quiz-kanji-level",
  "quiz-kotowaza-level",
  "quiz-q43-impossible-advice",
  "quiz-q43-contrarian-fortune",
  "quiz-q43-unexpected-compatibility",
] as const;

/** Fortune content IDs (daily fortune) */
const FORTUNE_IDS = ["fortune-daily"] as const;

/** All content IDs tracked by the achievement system (13 total) */
export const ALL_CONTENT_IDS: readonly string[] = [
  ...GAME_IDS,
  ...QUIZ_IDS,
  ...FORTUNE_IDS,
];

/** Number of quiz content types */
const QUIZ_COUNT = QUIZ_IDS.length;

// ---- Helper functions for badge condition checks ----

/** Count how many distinct content types the user has ever used */
function countUsedContent(store: AchievementStore): number {
  return Object.keys(store.totalStats.perContent).length;
}

/** Check if every content type has been used at least `minCount` times */
function allContentUsedAtLeast(
  store: AchievementStore,
  minCount: number,
): boolean {
  return ALL_CONTENT_IDS.every(
    (id) => (store.totalStats.perContent[id]?.count ?? 0) >= minCount,
  );
}

/** Get total play count across all content */
function getTotalPlayCount(store: AchievementStore): number {
  return Object.values(store.totalStats.perContent).reduce(
    (sum, stat) => sum + stat.count,
    0,
  );
}

/** Count how many quiz types the user has used */
function countQuizzesUsed(store: AchievementStore): number {
  return QUIZ_IDS.filter(
    (id) => (store.totalStats.perContent[id]?.count ?? 0) > 0,
  ).length;
}

/**
 * Check if all content was used on a given day.
 * Returns true if the daily entry has all content IDs set to true.
 */
function allContentPlayedOnDay(entry: Record<string, boolean>): boolean {
  return ALL_CONTENT_IDS.every((id) => entry[id] === true);
}

/**
 * Count consecutive days (ending at the most recent) where all content
 * was used. Requires sorted date keys.
 */
function countConsecutiveAllDays(store: AchievementStore): number {
  const dates = Object.keys(store.dailyProgress).sort();
  if (dates.length === 0) return 0;

  let count = 0;
  // Walk backwards from the most recent date
  for (let i = dates.length - 1; i >= 0; i--) {
    const entry = store.dailyProgress[dates[i]];
    if (!allContentPlayedOnDay(entry)) break;

    // Verify consecutive dates (no gaps)
    if (i < dates.length - 1) {
      const current = new Date(dates[i]);
      const next = new Date(dates[i + 1]);
      const diffMs = next.getTime() - current.getTime();
      const ONE_DAY_MS = 86_400_000;
      if (diffMs !== ONE_DAY_MS) break;
    }
    count++;
  }
  return count;
}

// ---- Badge definitions (14 badges, Phase A) ----

export const BADGE_DEFINITIONS: readonly BadgeDefinition[] = [
  // --- Usage milestone badges ---
  {
    id: "first-use",
    name: "はじめの一歩",
    description: "初めて1コンテンツ利用",
    rank: "bronze",
    check: (store) => countUsedContent(store) >= 1,
  },
  {
    id: "all-once",
    name: "全制覇の序章",
    description: "全コンテンツ1回ずつ利用",
    rank: "silver",
    check: (store) => allContentUsedAtLeast(store, 1),
  },
  {
    id: "all-ten",
    name: "真の探求者",
    description: "全コンテンツ10回ずつ利用",
    rank: "gold",
    check: (store) => allContentUsedAtLeast(store, 10),
  },

  // --- Streak badges ---
  {
    id: "streak-3",
    name: "三日坊主卒業",
    description: "3日連続利用",
    rank: "bronze",
    check: (store) => store.streak.longest >= 3,
  },
  {
    id: "streak-7",
    name: "一週間マスター",
    description: "7日連続利用",
    rank: "silver",
    check: (store) => store.streak.longest >= 7,
  },
  {
    id: "streak-30",
    name: "鉄人",
    description: "30日連続利用",
    rank: "gold",
    check: (store) => store.streak.longest >= 30,
  },

  // --- Daily all-content badges ---
  {
    id: "daily-all-1",
    name: "今日の全制覇",
    description: "1日に全種類利用",
    rank: "bronze",
    check: (store) => countConsecutiveAllDays(store) >= 1,
  },
  {
    id: "daily-all-7",
    name: "一週間全制覇",
    description: "7日間連続で全種類利用",
    rank: "silver",
    check: (store) => countConsecutiveAllDays(store) >= 7,
  },
  {
    id: "daily-all-30",
    name: "完全制覇マスター",
    description: "30日間連続で全種類利用",
    rank: "gold",
    check: (store) => countConsecutiveAllDays(store) >= 30,
  },

  // --- Quiz badges ---
  {
    id: "quiz-first",
    name: "診断デビュー",
    description: "1つの診断を受ける",
    rank: "bronze",
    check: (store) => countQuizzesUsed(store) >= 1,
  },
  {
    id: "quiz-all",
    name: "診断コンプリート",
    description: "全診断を受ける",
    rank: "silver",
    check: (store) => countQuizzesUsed(store) >= QUIZ_COUNT,
  },

  // --- Total usage badges ---
  {
    id: "total-50",
    name: "常連さん",
    description: "累計50回利用",
    rank: "bronze",
    check: (store) => getTotalPlayCount(store) >= 50,
  },
  {
    id: "total-200",
    name: "ヘビーユーザー",
    description: "累計200回利用",
    rank: "silver",
    check: (store) => getTotalPlayCount(store) >= 200,
  },
  {
    id: "total-1000",
    name: "レジェンド",
    description: "累計1000回利用",
    rank: "gold",
    check: (store) => getTotalPlayCount(store) >= 1000,
  },
];
