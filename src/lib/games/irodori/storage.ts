import type { IrodoriGameStats, IrodoriGameHistory } from "./types";

const STATS_KEY = "irodori-stats";
const HISTORY_KEY = "irodori-history";

/**
 * Default stats for a new player.
 */
function defaultStats(): IrodoriGameStats {
  return {
    gamesPlayed: 0,
    averageScore: 0,
    bestScore: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null,
    scoreDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
 */
export function loadStats(): IrodoriGameStats {
  if (!isStorageAvailable()) return defaultStats();
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as IrodoriGameStats;
  } catch {
    return defaultStats();
  }
}

/**
 * Save game statistics to localStorage.
 */
export function saveStats(stats: IrodoriGameStats): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

/**
 * Load game history from localStorage.
 */
export function loadHistory(): IrodoriGameHistory {
  if (!isStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as IrodoriGameHistory;
  } catch {
    return {};
  }
}

/**
 * Save game history to localStorage.
 */
export function saveHistory(history: IrodoriGameHistory): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

/**
 * Load today's game record from history.
 */
export function loadTodayGame(date: string): IrodoriGameHistory[string] | null {
  const history = loadHistory();
  return history[date] ?? null;
}

/**
 * Save today's game record into history.
 */
export function saveTodayGame(
  date: string,
  game: IrodoriGameHistory[string],
): void {
  const history = loadHistory();
  history[date] = game;
  saveHistory(history);
}
