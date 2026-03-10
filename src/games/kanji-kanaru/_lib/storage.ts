import type { GameStats, GameHistory, Difficulty } from "./types";
import { MAX_GUESSES } from "./types";

/** Legacy keys (pre-difficulty era). */
const LEGACY_STATS_KEY = "kanji-kanaru-stats";
const LEGACY_HISTORY_KEY = "kanji-kanaru-history";
const MIGRATION_FLAG = "kanji-kanaru-migrated-v2";

/**
 * Cross-game tracking key.
 * The cross-game progress system reads this key to check if the user played today.
 * We write a minimal stats summary here whenever any difficulty's stats are saved.
 */
const CROSS_GAME_STATS_KEY = "kanji-kanaru-stats";

/**
 * Get the localStorage key for stats of a given difficulty.
 */
function statsKey(difficulty: Difficulty): string {
  return `kanji-kanaru-stats-${difficulty}`;
}

/**
 * Get the localStorage key for history of a given difficulty.
 */
function historyKey(difficulty: Difficulty): string {
  return `kanji-kanaru-history-${difficulty}`;
}

/**
 * Default stats for a new player.
 */
function defaultStats(): GameStats {
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
 * This allows the cross-game progress system to detect kanji-kanaru play
 * regardless of which difficulty was used.
 */
function syncCrossGameStats(stats: GameStats): void {
  if (!isStorageAvailable()) return;
  try {
    // Only store the minimum needed for cross-game tracking
    const crossGameData = JSON.stringify({
      lastPlayedDate: stats.lastPlayedDate,
    });
    window.localStorage.setItem(CROSS_GAME_STATS_KEY, crossGameData);
  } catch {
    // Silently fail
  }
}

/**
 * Migrate legacy (pre-difficulty) data to beginner difficulty.
 * Only runs once, guarded by the MIGRATION_FLAG.
 *
 * Legacy data used pool size of 80 kanji. After migration, the beginner
 * pool expands to 240 kanji, but existing stats/history are preserved as-is.
 */
export function migrateToV2(): void {
  if (!isStorageAvailable()) return;
  try {
    if (window.localStorage.getItem(MIGRATION_FLAG)) return;

    const legacyStats = window.localStorage.getItem(LEGACY_STATS_KEY);
    if (legacyStats) {
      window.localStorage.setItem(statsKey("beginner"), legacyStats);
      // Do NOT remove legacy key -- it's now used as the cross-game tracking key
    }

    const legacyHistory = window.localStorage.getItem(LEGACY_HISTORY_KEY);
    if (legacyHistory) {
      window.localStorage.setItem(historyKey("beginner"), legacyHistory);
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
export function loadStats(difficulty: Difficulty): GameStats {
  if (!isStorageAvailable()) return defaultStats();
  try {
    const raw = window.localStorage.getItem(statsKey(difficulty));
    if (!raw) return defaultStats();
    return JSON.parse(raw) as GameStats;
  } catch {
    return defaultStats();
  }
}

/**
 * Save game statistics to localStorage for a given difficulty.
 * Also syncs lastPlayedDate to the cross-game tracking key.
 */
export function saveStats(stats: GameStats, difficulty: Difficulty): void {
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
export function loadHistory(difficulty: Difficulty): GameHistory {
  if (!isStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(historyKey(difficulty));
    if (!raw) return {};
    return JSON.parse(raw) as GameHistory;
  } catch {
    return {};
  }
}

/**
 * Save game history to localStorage for a given difficulty.
 */
export function saveHistory(
  history: GameHistory,
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
 * Applies migration for old data: if status is "lost" but guessCount < MAX_GUESSES,
 * the game was actually in progress (old code used "lost" as a placeholder for
 * in-progress saves). In that case, status is corrected to "playing".
 */
export function loadTodayGame(
  date: string,
  difficulty: Difficulty,
): GameHistory[string] | null {
  const history = loadHistory(difficulty);
  const entry = history[date];
  if (!entry) return null;

  // Migrate old data: "lost" with fewer guesses than max was actually in progress
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
  game: GameHistory[string],
  difficulty: Difficulty,
): void {
  const history = loadHistory(difficulty);
  history[date] = game;
  saveHistory(history, difficulty);
}
