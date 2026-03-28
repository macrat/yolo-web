/**
 * Shared store for the daily fortune feature.
 *
 * Provides a useSyncExternalStore-compatible interface so that both
 * FortunePreview and DailyFortuneCard can share a single cache and
 * avoid duplicating store logic.
 *
 * Cache invalidation strategy:
 * - The cache stores the date it was computed for.
 * - On each snapshot call, the current JST date is compared with the cached date.
 * - If the date has changed (e.g., the user kept the page open past midnight),
 *   the cache is invalidated and the fortune is recomputed.
 */

import { getUserSeed, selectFortune } from "@/play/fortune/logic";
import { getTodayJst } from "@/lib/achievements/date";
import type { DailyFortuneEntry } from "@/play/fortune/types";

export type FortuneState = { fortune: DailyFortuneEntry; today: string } | null;

/**
 * Module-scope cache for the computed fortune state.
 * useSyncExternalStore requires snapshot functions to return the same reference
 * when nothing has changed, otherwise it triggers an infinite re-render loop.
 * Caching here ensures referential stability within the same date.
 */
let fortuneCache: FortuneState = null;
let fortuneListeners: Array<() => void> = [];

/** Subscribe a listener to fortune store updates (required by useSyncExternalStore). */
export function subscribeFortuneStore(callback: () => void): () => void {
  fortuneListeners.push(callback);
  return () => {
    fortuneListeners = fortuneListeners.filter((l) => l !== callback);
  };
}

/**
 * Client-side snapshot for useSyncExternalStore.
 *
 * Returns cached state if the date has not changed.
 * Invalidates the cache when the JST date changes so that users who keep
 * the page open past midnight always see the correct fortune for today.
 */
export function getFortuneSnapshot(): FortuneState {
  const today = getTodayJst();
  // Return cached value only if it was computed for the same date
  if (fortuneCache !== null && fortuneCache.today === today)
    return fortuneCache;
  if (typeof window === "undefined") return null;
  const userSeed = getUserSeed();
  if (userSeed === null) return null;
  fortuneCache = { fortune: selectFortune(today, userSeed), today };
  return fortuneCache;
}

/**
 * Server-side snapshot for useSyncExternalStore.
 *
 * Always returns null so that SSR output and the first client render match,
 * preventing React Hydration Errors.
 */
export function getFortuneServerSnapshot(): FortuneState {
  return null;
}

/**
 * Reset the module-scope cache.
 *
 * This is intended for use in tests only. It clears both the cached fortune
 * state and all registered listeners to ensure test isolation.
 */
export function resetFortuneCache(): void {
  fortuneCache = null;
  fortuneListeners = [];
}
