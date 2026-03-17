import type { IrodoriColor, IrodoriScheduleEntry } from "./types";
import { hslToHex } from "./color-utils";

/**
 * Traditional color data type matching traditional-colors.json.
 */
export interface TraditionalColor {
  slug: string;
  name: string;
  romaji: string;
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  category: string;
}

/**
 * The epoch date for puzzle numbering.
 * Puzzle #1 is 2026-02-20 (JST).
 */
const EPOCH_DATE = "2026-02-20";

/**
 * Number of rounds per game.
 */
export const ROUNDS_PER_GAME = 5;

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
  return formatter.format(date);
}

/**
 * Calculate the puzzle number for a given date.
 * Returns the number of days since the epoch date (1-indexed).
 */
export function getPuzzleNumber(date: Date): number {
  const todayStr = formatDateJST(date);
  const todayMs = Date.parse(todayStr + "T00:00:00Z");
  const epochMs = Date.parse(EPOCH_DATE + "T00:00:00Z");
  const daysDiff = Math.floor((todayMs - epochMs) / (1000 * 60 * 60 * 24));
  return daysDiff + 1;
}

/**
 * Simple FNV-1a hash function for deterministic random generation.
 */
export function simpleHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * Generate a deterministic random color from a seed string.
 * Produces visually interesting colors (avoids extremes of lightness/saturation).
 */
function generateRandomColor(seed: string): IrodoriColor {
  const h1 = simpleHash(seed + "-h");
  const h2 = simpleHash(seed + "-s");
  const h3 = simpleHash(seed + "-l");

  const h = h1 % 360;
  const s = 30 + (h2 % 50); // 30-79 saturation
  const l = 25 + (h3 % 45); // 25-69 lightness

  return {
    h,
    s,
    l,
    hex: hslToHex(h, s, l),
  };
}

/**
 * Convert a traditional color entry to an IrodoriColor.
 */
function traditionalToIrodoriColor(tc: TraditionalColor): IrodoriColor {
  return {
    h: tc.hsl[0],
    s: tc.hsl[1],
    l: tc.hsl[2],
    hex: tc.hex,
    name: tc.name,
    slug: tc.slug,
  };
}

/**
 * Get today's puzzle colors and puzzle number.
 *
 * First checks the pre-generated schedule. If no entry is found,
 * falls back to deterministic hash-based selection.
 */
export function getTodaysPuzzle(
  traditionalColors: TraditionalColor[],
  schedule: IrodoriScheduleEntry[],
  now?: Date,
): { colors: IrodoriColor[]; puzzleNumber: number } {
  const date = now ?? new Date();
  const todayStr = formatDateJST(date);
  const puzzleNumber = getPuzzleNumber(date);

  const entry = schedule.find((e) => e.date === todayStr);

  if (entry) {
    const colors = entry.colorIndices.map((idx, i) => {
      if (idx >= 0 && idx < traditionalColors.length) {
        return traditionalToIrodoriColor(traditionalColors[idx]);
      }
      // Negative index: generate random color
      return generateRandomColor(`${todayStr}-round-${i}`);
    });
    return { colors, puzzleNumber };
  }

  // Fallback: deterministic hash-based selection
  const colors: IrodoriColor[] = [];
  for (let i = 0; i < ROUNDS_PER_GAME; i++) {
    const seed = `${todayStr}-${i}`;
    const hash = simpleHash(seed);

    // 60% chance traditional color, 40% random
    if (hash % 5 < 3) {
      const colorIndex = hash % traditionalColors.length;
      colors.push(traditionalToIrodoriColor(traditionalColors[colorIndex]));
    } else {
      colors.push(generateRandomColor(seed));
    }
  }

  return { colors, puzzleNumber };
}

/**
 * Generate deterministic initial slider values for each round.
 * These should NOT give hints about the answer.
 */
export function getInitialSliderValues(
  dateStr: string,
  roundCount: number,
): Array<{ h: number; s: number; l: number }> {
  const values: Array<{ h: number; s: number; l: number }> = [];
  for (let i = 0; i < roundCount; i++) {
    const seed = `${dateStr}-init-${i}`;
    const hHash = simpleHash(seed + "-h");
    const sHash = simpleHash(seed + "-s");
    const lHash = simpleHash(seed + "-l");
    values.push({
      h: hHash % 360,
      s: sHash % 101,
      l: lHash % 101,
    });
  }
  return values;
}
