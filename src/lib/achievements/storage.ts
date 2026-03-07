/**
 * LocalStorage persistence layer for the achievement system.
 *
 * All localStorage access is wrapped in try-catch to handle:
 * - QuotaExceededError (storage full)
 * - SecurityError (private browsing restrictions)
 * - SSR environment (typeof window === "undefined")
 */

import type { AchievementStore } from "./types";
import { STORAGE_KEY } from "./badges";

/** Current schema version. Increment when store shape changes. */
const CURRENT_SCHEMA_VERSION = 1;

/** Maximum number of daily progress entries to retain */
const MAX_DAILY_ENTRIES = 90;

/** Create a fresh default store */
export function createDefaultStore(): AchievementStore {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    streak: {
      current: 0,
      longest: 0,
      lastPlayDate: "",
    },
    totalStats: {
      totalDaysPlayed: 0,
      totalContentUsed: 0,
      perContent: {},
    },
    achievements: {},
    dailyProgress: {},
  };
}

/**
 * Load the achievement store from localStorage.
 * Returns a default store if no data exists or parsing fails.
 * Returns null in SSR environments.
 */
export function loadStore(): AchievementStore | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultStore();
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isValidStore(parsed)) {
      return createDefaultStore();
    }

    // Future: apply migration chain here based on schemaVersion
    return parsed;
  } catch {
    // JSON parse error, SecurityError, etc.
    return createDefaultStore();
  }
}

/**
 * Save the achievement store to localStorage.
 * Silently fails in SSR or on storage errors (graceful degradation).
 */
export function saveStore(store: AchievementStore): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const serialized = JSON.stringify(store);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // QuotaExceededError, SecurityError, etc. - silently degrade
  }
}

/**
 * Remove daily progress entries older than 90 days.
 * Mutates the store in place and returns it for chaining convenience.
 */
export function pruneDailyProgress(store: AchievementStore): AchievementStore {
  const dates = Object.keys(store.dailyProgress).sort();

  if (dates.length <= MAX_DAILY_ENTRIES) {
    return store;
  }

  // Keep only the most recent MAX_DAILY_ENTRIES entries
  const toRemove = dates.slice(0, dates.length - MAX_DAILY_ENTRIES);
  for (const date of toRemove) {
    delete store.dailyProgress[date];
  }

  return store;
}

/**
 * Basic structural validation for a parsed store object.
 * Checks top-level shape to guard against corrupted data.
 */
function isValidStore(value: unknown): value is AchievementStore {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.schemaVersion === "number" &&
    typeof obj.streak === "object" &&
    obj.streak !== null &&
    typeof obj.totalStats === "object" &&
    obj.totalStats !== null &&
    typeof obj.achievements === "object" &&
    obj.achievements !== null &&
    typeof obj.dailyProgress === "object" &&
    obj.dailyProgress !== null
  );
}
