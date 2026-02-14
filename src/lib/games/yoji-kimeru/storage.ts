import type { YojiGameStats, YojiGameHistory } from "./types";

const STATS_KEY = "yoji-kimeru-stats";
const HISTORY_KEY = "yoji-kimeru-history";

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
 * Load game statistics from localStorage.
 * Returns default stats if no data is stored or localStorage is unavailable.
 */
export function loadStats(): YojiGameStats {
  if (!isStorageAvailable()) return defaultStats();
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as YojiGameStats;
  } catch {
    return defaultStats();
  }
}

/**
 * Save game statistics to localStorage.
 */
export function saveStats(stats: YojiGameStats): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

/**
 * Load game history from localStorage.
 * Returns empty object if no data is stored.
 */
export function loadHistory(): YojiGameHistory {
  if (!isStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as YojiGameHistory;
  } catch {
    return {};
  }
}

/**
 * Save game history to localStorage.
 */
export function saveHistory(history: YojiGameHistory): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

/**
 * Load today's game record from history.
 * Returns null if no game was played today.
 */
export function loadTodayGame(date: string): YojiGameHistory[string] | null {
  const history = loadHistory();
  return history[date] ?? null;
}

/**
 * Save today's game record into history.
 */
export function saveTodayGame(
  date: string,
  game: YojiGameHistory[string],
): void {
  const history = loadHistory();
  history[date] = game;
  saveHistory(history);
}
