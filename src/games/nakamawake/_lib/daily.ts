import type { NakamawakePuzzle, NakamawakeScheduleEntry } from "./types";

/**
 * The epoch date for puzzle numbering.
 * Puzzle #1 is 2026-02-14 (JST).
 */
const EPOCH_DATE = "2026-02-14";

/**
 * Format a Date object as "YYYY-MM-DD" in JST (Asia/Tokyo timezone).
 */
export function formatDateJST(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA locale outputs YYYY-MM-DD format
  return formatter.format(date);
}

/**
 * Calculate the puzzle number for a given date.
 * Returns the number of days since the epoch date (1-indexed).
 * Returns 0 or negative if the date is before the epoch.
 */
export function getPuzzleNumber(date: Date): number {
  const todayStr = formatDateJST(date);
  const todayMs = Date.parse(todayStr + "T00:00:00Z");
  const epochMs = Date.parse(EPOCH_DATE + "T00:00:00Z");
  const daysDiff = Math.floor((todayMs - epochMs) / (1000 * 60 * 60 * 24));
  return daysDiff + 1;
}

/**
 * Simple hash function for fallback puzzle selection.
 * Uses a basic FNV-1a-like hash.
 */
function simpleHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * Get today's puzzle and puzzle number.
 *
 * First checks the pre-generated schedule. If no entry is found for today's
 * date (e.g., schedule has expired), falls back to a deterministic hash.
 */
export function getTodaysPuzzle(
  puzzles: NakamawakePuzzle[],
  schedule: NakamawakeScheduleEntry[],
  now?: Date,
): { puzzle: NakamawakePuzzle; puzzleNumber: number } {
  const date = now ?? new Date();
  const todayStr = formatDateJST(date);
  const puzzleNumber = getPuzzleNumber(date);

  const entry = schedule.find((p) => p.date === todayStr);
  if (entry && entry.puzzleIndex < puzzles.length) {
    return { puzzle: puzzles[entry.puzzleIndex], puzzleNumber };
  }

  // Fallback: deterministic hash of date string
  const hash = simpleHash(todayStr);
  const index = hash % puzzles.length;
  return { puzzle: puzzles[index], puzzleNumber };
}
