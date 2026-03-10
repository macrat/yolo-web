/**
 * Puzzle Schedule Generator for Kanji Kanaru
 *
 * Generates three JSON files for each difficulty level (beginner, intermediate, advanced).
 * Each file maps dates to kanji indices within the filtered pool for that difficulty.
 * Uses a seeded PRNG (mulberry32) to ensure deterministic, reproducible output.
 *
 * Usage: npx tsx scripts/generate-puzzle-schedule.ts
 */

import * as fs from "fs";
import * as path from "path";

// Seed: 0x4B616E6A69 = "Kanji" in ASCII hex
const SEED = 0x4b616e6a;

interface KanjiEntry {
  grade: number;
  [key: string]: unknown;
}

interface DifficultyConfig {
  name: string;
  maxGrade: number;
  outputFile: string;
}

const DIFFICULTIES: DifficultyConfig[] = [
  {
    name: "beginner",
    maxGrade: 2,
    outputFile: "puzzle-schedule-beginner.json",
  },
  {
    name: "intermediate",
    maxGrade: 6,
    outputFile: "puzzle-schedule-intermediate.json",
  },
  {
    name: "advanced",
    maxGrade: 7,
    outputFile: "puzzle-schedule-advanced.json",
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
  // Load kanji data to determine dataset and filter by grade
  const kanjiDataPath = path.resolve(__dirname, "../src/data/kanji-data.json");
  const kanjiDataRaw = fs.readFileSync(kanjiDataPath, "utf-8");
  const kanjiData = JSON.parse(kanjiDataRaw) as KanjiEntry[];

  console.log(`Total dataset size: ${kanjiData.length} kanji`);

  const startDate = "2026-03-01";
  const numDays = 730; // 2 years

  const outputDir = path.resolve(__dirname, "../src/games/kanji-kanaru/data");

  for (const config of DIFFICULTIES) {
    // Filter indices by grade for this difficulty
    const filteredIndices: number[] = [];
    for (let i = 0; i < kanjiData.length; i++) {
      if (kanjiData[i].grade <= config.maxGrade) {
        filteredIndices.push(i);
      }
    }

    const poolSize = filteredIndices.length;
    console.log(
      `${config.name}: ${poolSize} kanji (grade <= ${config.maxGrade})`,
    );

    // Generate shuffled pool-local indices
    const rng = mulberry32(SEED);
    const poolLocalIndices = Array.from({ length: poolSize }, (_, i) => i);
    const shuffled = seededShuffle(poolLocalIndices, rng);

    // Generate schedule: kanjiIndex is the pool-local index
    const schedule: { date: string; kanjiIndex: number }[] = [];
    for (let i = 0; i < numDays; i++) {
      const date = addDays(startDate, i);
      const kanjiIndex = shuffled[i % shuffled.length];
      schedule.push({ date, kanjiIndex });
    }

    const outputPath = path.join(outputDir, config.outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(schedule, null, 2) + "\n");
    console.log(`  Generated ${schedule.length} entries: ${outputPath}`);
  }
}

main();
