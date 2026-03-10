/**
 * Kanji Data Validator
 *
 * Validates the generated kanji-data.json for completeness and correctness.
 *
 * Usage: npx tsx scripts/validate-kanji-data.ts
 */

import * as fs from "fs";
import * as path from "path";

interface KanjiEntry {
  character: string;
  radical: string;
  radicalGroup: number;
  strokeCount: number;
  grade: number;
  onYomi: string[];
  kunYomi: string[];
  meanings: string[];
  category: number;
  examples: string[];
}

const EXPECTED_TOTAL = 2136;

/** Expected grade distribution based on KANJIDIC2 */
const EXPECTED_GRADE_COUNTS: Record<number, number> = {
  1: 80,
  2: 160,
  3: 200,
  4: 202,
  5: 193,
  6: 191,
  7: 1110, // mapped from KANJIDIC2 grade 8
};

function main(): void {
  const dataPath = path.resolve(__dirname, "../src/data/kanji-data.json");

  if (!fs.existsSync(dataPath)) {
    console.error(`kanji-data.json not found: ${dataPath}`);
    process.exit(1);
  }

  const entries: KanjiEntry[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  let errors = 0;
  let warnings = 0;

  // ── Check 1: Total count ─────────────────────────────────────────
  if (entries.length !== EXPECTED_TOTAL) {
    console.error(
      `ERROR: Expected ${EXPECTED_TOTAL} entries, found ${entries.length}`,
    );
    errors++;
  } else {
    console.log(`OK: ${entries.length} entries`);
  }

  // ── Check 2: Uniqueness ──────────────────────────────────────────
  const chars = new Set<string>();
  for (const entry of entries) {
    if (chars.has(entry.character)) {
      console.error(`ERROR: Duplicate character: ${entry.character}`);
      errors++;
    }
    chars.add(entry.character);
  }
  if (chars.size === entries.length) {
    console.log(`OK: All characters are unique`);
  }

  // ── Check 3: Required fields non-empty ───────────────────────────
  let fieldErrors = 0;
  for (const entry of entries) {
    const requiredNonEmpty: [string, unknown][] = [
      ["character", entry.character],
      ["radical", entry.radical],
      ["radicalGroup", entry.radicalGroup],
      ["strokeCount", entry.strokeCount],
      ["grade", entry.grade],
      ["meanings", entry.meanings],
      ["category", entry.category],
    ];

    for (const [fieldName, value] of requiredNonEmpty) {
      if (value === null || value === undefined) {
        console.error(
          `ERROR: ${entry.character} has null/undefined ${fieldName}`,
        );
        fieldErrors++;
      }
      if (Array.isArray(value) && value.length === 0) {
        console.error(`ERROR: ${entry.character} has empty array ${fieldName}`);
        fieldErrors++;
      }
    }

    // onYomi and kunYomi: at least one reading should exist overall
    if (entry.onYomi.length === 0 && entry.kunYomi.length === 0) {
      console.error(
        `ERROR: ${entry.character} has no readings (neither on nor kun)`,
      );
      fieldErrors++;
    }
  }
  if (fieldErrors === 0) {
    console.log(`OK: All required fields are non-empty`);
  }
  errors += fieldErrors;

  // ── Check 4: Grade distribution ──────────────────────────────────
  const gradeDistribution: Record<number, number> = {};
  for (const entry of entries) {
    gradeDistribution[entry.grade] = (gradeDistribution[entry.grade] || 0) + 1;
  }

  let gradeOk = true;
  for (const [grade, expected] of Object.entries(EXPECTED_GRADE_COUNTS)) {
    const actual = gradeDistribution[Number(grade)] || 0;
    if (actual !== expected) {
      console.error(
        `ERROR: Grade ${grade}: expected ${expected}, found ${actual}`,
      );
      errors++;
      gradeOk = false;
    }
  }
  if (gradeOk) {
    console.log(`OK: Grade distribution matches expected values`);
  }

  // ── Check 5: Category (radical group) distribution ───────────────
  const groupDistribution: Record<number, number> = {};
  for (const entry of entries) {
    groupDistribution[entry.category] =
      (groupDistribution[entry.category] || 0) + 1;
  }

  let groupOk = true;
  for (let g = 1; g <= 20; g++) {
    if (!groupDistribution[g] || groupDistribution[g] === 0) {
      console.error(`ERROR: Radical group ${g} has no kanji`);
      errors++;
      groupOk = false;
    }
  }
  if (groupOk) {
    console.log(`OK: All 20 radical groups have at least 1 kanji`);
    console.log("Radical group distribution:");
    for (let g = 1; g <= 20; g++) {
      console.log(`  Group ${g}: ${groupDistribution[g]} kanji`);
    }
  }

  // ── Check 6: Examples statistics ─────────────────────────────────
  const exampleCounts: Record<number, number> = {};
  let withExamples = 0;
  for (const entry of entries) {
    const count = entry.examples.length;
    exampleCounts[count] = (exampleCounts[count] || 0) + 1;
    if (count > 0) withExamples++;
  }

  const coverage = (withExamples / entries.length) * 100;
  console.log(
    `\nExample coverage: ${withExamples}/${entries.length} (${coverage.toFixed(1)}%)`,
  );
  for (const count of Object.keys(exampleCounts).sort(
    (a, b) => Number(a) - Number(b),
  )) {
    console.log(`  ${count} examples: ${exampleCounts[Number(count)]} kanji`);
  }

  if (coverage < 95) {
    console.warn(
      `WARNING: Example coverage is below 95%: ${coverage.toFixed(1)}%`,
    );
    warnings++;
  } else {
    console.log(`OK: Example coverage >= 95%`);
  }

  // ── Check 7: Radical group values are in valid range ─────────────
  let radicalGroupOk = true;
  for (const entry of entries) {
    if (entry.radicalGroup < 1 || entry.radicalGroup > 214) {
      console.error(
        `ERROR: ${entry.character} has invalid radicalGroup: ${entry.radicalGroup}`,
      );
      errors++;
      radicalGroupOk = false;
    }
    if (entry.category < 1 || entry.category > 20) {
      console.error(
        `ERROR: ${entry.character} has invalid category (radical group): ${entry.category}`,
      );
      errors++;
      radicalGroupOk = false;
    }
  }
  if (radicalGroupOk) {
    console.log(
      `OK: All radicalGroup values (1-214) and category values (1-20) are in range`,
    );
  }

  // ── Summary ──────────────────────────────────────────────────────
  console.log(`\n${"=".repeat(50)}`);
  if (errors > 0) {
    console.error(
      `VALIDATION FAILED: ${errors} error(s), ${warnings} warning(s)`,
    );
    process.exit(1);
  } else {
    console.log(`VALIDATION PASSED: 0 errors, ${warnings} warning(s)`);
  }
}

main();
