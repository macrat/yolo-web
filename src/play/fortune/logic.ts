/**
 * Deterministic daily fortune selection logic.
 *
 * Combines a date-based seed with a user-specific seed stored in
 * localStorage to ensure:
 * - Same user sees the same fortune on the same day
 * - Different users see different fortunes on the same day
 * - Tomorrow always gives a different result
 */

import type { DailyFortuneEntry } from "./types";
import { DAILY_FORTUNES } from "./data/daily-fortunes";

/** localStorage key for the user-specific fortune seed */
const USER_SEED_KEY = "yolos-fortune-seed";

/**
 * Hash a date string into a numeric seed value.
 * Uses a simple FNV-1a inspired hash for good distribution.
 */
export function hashDate(dateStr: string): number {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
    hash = hash >>> 0; // convert to unsigned 32-bit
  }
  return hash;
}

/**
 * Mulberry32: a simple deterministic PRNG that produces values in [0, 1).
 * Given the same seed, always produces the same sequence.
 */
export function mulberry32(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Get or create the user-specific seed from localStorage.
 * Returns null in SSR environments where localStorage is unavailable.
 */
export function getUserSeed(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(USER_SEED_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) return parsed;
    }

    // Generate a new random seed and persist it
    const newSeed = Math.floor(Math.random() * 2147483647);
    localStorage.setItem(USER_SEED_KEY, String(newSeed));
    return newSeed;
  } catch {
    // localStorage blocked or unavailable; fall back to a fixed seed
    return 42;
  }
}

/**
 * Select today's fortune entry based on date and user seed.
 *
 * @param dateStr - JST date string in "YYYY-MM-DD" format
 * @param userSeed - User-specific seed from localStorage
 * @returns The selected DailyFortuneEntry
 */
export function selectFortune(
  dateStr: string,
  userSeed: number,
): DailyFortuneEntry {
  const dateSeed = hashDate(dateStr);
  // Combine date seed and user seed for per-user variation
  const combinedSeed = (dateSeed ^ userSeed) >>> 0;
  const random = mulberry32(combinedSeed);
  const index = Math.floor(random * DAILY_FORTUNES.length);
  return DAILY_FORTUNES[index];
}
