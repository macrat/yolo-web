/**
 * Puzzle Schedule Generator for Kanji Kanaru
 *
 * Generates a JSON file mapping dates to kanji indices for 365 days.
 * Uses a seeded PRNG (mulberry32) to ensure deterministic, reproducible output.
 *
 * Usage: npx tsx scripts/generate-puzzle-schedule.ts
 */

import * as fs from "fs";
import * as path from "path";

// Seed: 0x4B616E6A69 = "Kanji" in ASCII hex
const SEED = 0x4b616e6a;

/**
 * Mulberry32 seeded PRNG.
 * Returns a function that produces a pseudo-random number in [0, 1) on each call.
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using a seeded PRNG.
 */
function seededShuffle(arr: number[], rng: () => number): number[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Add N days to a date string "YYYY-MM-DD" and return the new date string.
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function main(): void {
  // Load kanji data to determine dataset size
  const kanjiDataPath = path.resolve(__dirname, "../src/data/kanji-data.json");
  const kanjiDataRaw = fs.readFileSync(kanjiDataPath, "utf-8");
  const kanjiData = JSON.parse(kanjiDataRaw) as unknown[];
  const datasetSize = kanjiData.length;

  console.log(`Dataset size: ${datasetSize} kanji`);

  // Generate shuffled indices
  const rng = mulberry32(SEED);
  const indices = Array.from({ length: datasetSize }, (_, i) => i);
  const shuffled = seededShuffle(indices, rng);

  // Generate 365 days of puzzles starting from 2026-03-01
  const startDate = "2026-03-01";
  const numDays = 365;

  const schedule: { date: string; kanjiIndex: number }[] = [];
  for (let i = 0; i < numDays; i++) {
    const date = addDays(startDate, i);
    // Cycle through the shuffled indices if the dataset is smaller than 365
    const kanjiIndex = shuffled[i % shuffled.length];
    schedule.push({ date, kanjiIndex });
  }

  // Write output
  const outputPath = path.resolve(
    __dirname,
    "../src/games/kanji-kanaru/data/puzzle-schedule.json",
  );
  fs.writeFileSync(outputPath, JSON.stringify(schedule, null, 2) + "\n");

  console.log(`Generated ${schedule.length} puzzle entries: ${outputPath}`);
}

main();
