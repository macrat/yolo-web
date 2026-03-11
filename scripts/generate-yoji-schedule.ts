/**
 * Puzzle Schedule Generator for Yoji Kimeru
 *
 * Generates three JSON files for each difficulty level (beginner, intermediate, advanced).
 * Each file maps dates to yoji indices within the filtered pool for that difficulty.
 * Uses a seeded PRNG (mulberry32) to ensure deterministic, reproducible output.
 *
 * Usage: npx tsx scripts/generate-yoji-schedule.ts
 */

import * as fs from "fs";
import * as path from "path";

// Seed: 0x596F6A69 = "Yoji" in ASCII hex
const SEED = 0x596f6a69;

interface YojiEntry {
  difficulty: number;
  [key: string]: unknown;
}

interface DifficultyConfig {
  name: string;
  /** Maximum difficulty value to include in the pool */
  maxDifficulty: number;
  outputFile: string;
}

const DIFFICULTIES: DifficultyConfig[] = [
  {
    name: "beginner",
    maxDifficulty: 1,
    outputFile: "yoji-schedule-beginner.json",
  },
  {
    name: "intermediate",
    maxDifficulty: 2,
    outputFile: "yoji-schedule-intermediate.json",
  },
  {
    name: "advanced",
    maxDifficulty: 3,
    outputFile: "yoji-schedule-advanced.json",
  },
];

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
  const yojiDataPath = path.resolve(__dirname, "../src/data/yoji-data.json");
  const yojiDataRaw = fs.readFileSync(yojiDataPath, "utf-8");
  const yojiData = JSON.parse(yojiDataRaw) as YojiEntry[];

  console.log(`Total dataset size: ${yojiData.length} yoji`);

  const startDate = "2026-03-01";
  const numDays = 730; // 2 years

  const outputDir = path.resolve(__dirname, "../src/games/yoji-kimeru/data");

  for (const config of DIFFICULTIES) {
    // Filter entries by difficulty for this level.
    // The filtered pool indices correspond to the indices within
    // the filtered array (not the original yoji-data.json indices).
    const filteredIndices: number[] = [];
    let poolIndex = 0;
    for (let i = 0; i < yojiData.length; i++) {
      if (yojiData[i].difficulty <= config.maxDifficulty) {
        filteredIndices.push(poolIndex);
        poolIndex++;
      }
    }

    const poolSize = filteredIndices.length;
    console.log(
      `${config.name}: ${poolSize} yoji (difficulty <= ${config.maxDifficulty})`,
    );

    // Generate shuffled pool-local indices
    const rng = mulberry32(SEED);
    const poolLocalIndices = Array.from({ length: poolSize }, (_, i) => i);
    const shuffled = seededShuffle(poolLocalIndices, rng);

    // Generate schedule: yojiIndex is the index within the difficulty-filtered pool
    const schedule: { date: string; yojiIndex: number }[] = [];
    for (let i = 0; i < numDays; i++) {
      const date = addDays(startDate, i);
      const yojiIndex = shuffled[i % shuffled.length];
      schedule.push({ date, yojiIndex });
    }

    const outputPath = path.join(outputDir, config.outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(schedule, null, 2) + "\n");
    console.log(`  Generated ${schedule.length} entries: ${outputPath}`);
  }
}

main();
