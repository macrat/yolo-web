import type { Difficulty, YojiGameStats, YojiGameHistory } from "./types";
import { MAX_GUESSES } from "./types";

/** Legacy keys (pre-difficulty era). */
const LEGACY_STATS_KEY = "yoji-kimeru-stats";
const LEGACY_HISTORY_KEY = "yoji-kimeru-history";
const MIGRATION_FLAG = "yoji-kimeru-migrated-v2";

/**
 * Cross-game tracking key.
 * The cross-game progress system reads this key to check if the user played today.
 * We write a minimal stats summary here whenever any difficulty's stats are saved.
 */
const CROSS_GAME_STATS_KEY = "yoji-kimeru-stats";

/**
 * Get the localStorage key for stats of a given difficulty.
 */
function statsKey(difficulty: Difficulty): string {
  return `yoji-kimeru-stats-${difficulty}`;
}

/**
 * Get the localStorage key for history of a given difficulty.
 */
function historyKey(difficulty: Difficulty): string {
  return `yoji-kimeru-history-${difficulty}`;
}

/**
 * Default stats for a new player.
 */
function defaultStats(): YojiGameStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
    lastPlayedDate: null,
  };
}

/**
 * Safely check if localStorage is available.
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Update the cross-game tracking key with the latest lastPlayedDate.
 * This allows the cross-game progress system to detect yoji-kimeru play
 * regardless of which difficulty was used.
 */
function syncCrossGameStats(stats: YojiGameStats): void {
  if (!isStorageAvailable()) return;
  try {
    const crossGameData = JSON.stringify({
      lastPlayedDate: stats.lastPlayedDate,
    });
    window.localStorage.setItem(CROSS_GAME_STATS_KEY, crossGameData);
  } catch {
    // Silently fail
  }
}

/**
 * Migrate legacy (pre-difficulty) data to intermediate difficulty.
 * Existing players' data is attributed to "intermediate" as the closest
 * match to the old all-difficulty-mixed pool.
 * Only runs once, guarded by the MIGRATION_FLAG.
 */
export function migrateToV2(): void {
  if (!isStorageAvailable()) return;
  try {
    if (window.localStorage.getItem(MIGRATION_FLAG)) return;

    const legacyStats = window.localStorage.getItem(LEGACY_STATS_KEY);
    if (legacyStats) {
      window.localStorage.setItem(statsKey("intermediate"), legacyStats);
      // Do NOT remove legacy key -- it's now used as the cross-game tracking key
    }

    const legacyHistory = window.localStorage.getItem(LEGACY_HISTORY_KEY);
    if (legacyHistory) {
      window.localStorage.setItem(historyKey("intermediate"), legacyHistory);
      window.localStorage.removeItem(LEGACY_HISTORY_KEY);
    }

    window.localStorage.setItem(MIGRATION_FLAG, "1");
  } catch {
    // Silently fail if storage is unavailable
  }
}

/**
 * Load game statistics from localStorage for a given difficulty.
 * Returns default stats if no data is stored or localStorage is unavailable.
 */
export function loadStats(difficulty: Difficulty): YojiGameStats {
  if (!isStorageAvailable()) return defaultStats();
  try {
    const raw = window.localStorage.getItem(statsKey(difficulty));
    if (!raw) return defaultStats();
    return JSON.parse(raw) as YojiGameStats;
  } catch {
    return defaultStats();
  }
}

/**
 * Save game statistics to localStorage for a given difficulty.
 * Also syncs lastPlayedDate to the cross-game tracking key.
 */
export function saveStats(stats: YojiGameStats, difficulty: Difficulty): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(statsKey(difficulty), JSON.stringify(stats));
    syncCrossGameStats(stats);
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

/**
 * Load game history from localStorage for a given difficulty.
 * Returns empty object if no data is stored.
 */
export function loadHistory(difficulty: Difficulty): YojiGameHistory {
  if (!isStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(historyKey(difficulty));
    if (!raw) return {};
    return JSON.parse(raw) as YojiGameHistory;
  } catch {
    return {};
  }
}

/**
 * Save game history to localStorage for a given difficulty.
 */
export function saveHistory(
  history: YojiGameHistory,
  difficulty: Difficulty,
): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(
      historyKey(difficulty),
      JSON.stringify(history),
    );
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

/**
 * Load today's game record from history for a given difficulty.
 * Returns null if no game was played today.
 *
 * Includes migration for old data: if status is "lost" but guessCount < MAX_GUESSES,
 * the game was actually in progress (old code saved "lost" as a placeholder).
 * In that case, status is corrected to "playing".
 */
export function loadTodayGame(
  date: string,
  difficulty: Difficulty,
): YojiGameHistory[string] | null {
  const history = loadHistory(difficulty);
  const entry = history[date] ?? null;
  if (!entry) return null;

  // Migrate old data: "lost" with fewer guesses than MAX_GUESSES was a placeholder
  if (entry.status === "lost" && entry.guessCount < MAX_GUESSES) {
    return { ...entry, status: "playing" };
  }

  return entry;
}

/**
 * Save today's game record into history for a given difficulty.
 */
export function saveTodayGame(
  date: string,
  game: YojiGameHistory[string],
  difficulty: Difficulty,
): void {
  const history = loadHistory(difficulty);
  history[date] = game;
  saveHistory(history, difficulty);
}
