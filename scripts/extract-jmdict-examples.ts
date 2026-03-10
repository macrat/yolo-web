/**
 * JMdict Example Word Extractor
 *
 * Reads kanji-base.json and enriches each entry with up to 3 example
 * compound words from JMdict (common words only).
 *
 * Data source: https://github.com/scriptin/jmdict-simplified
 * License: CC BY-SA 4.0 (EDRDG)
 *
 * Usage: npx tsx scripts/extract-jmdict-examples.ts
 */

import * as fs from "fs";
import * as path from "path";

// ── Types ──────────────────────────────────────────────────────────

interface JmdictKanji {
  common: boolean;
  text: string;
  tags: string[];
}

interface JmdictWord {
  id: string;
  kanji: JmdictKanji[];
  kana: { common: boolean; text: string }[];
  sense: { partOfSpeech: string[] }[];
}

interface JmdictFile {
  words: JmdictWord[];
}

interface KanjiBaseEntry {
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

/** Maximum example words per kanji */
const MAX_EXAMPLES = 3;

/** Regex: word consists entirely of kanji (CJK Unified Ideographs) */
const ALL_KANJI_REGEX = /^[\u4e00-\u9fff]+$/;

/** Regex: word is 2-4 characters */
function isValidLength(word: string): boolean {
  return word.length >= 2 && word.length <= 4;
}

function main(): void {
  // Load kanji base data
  const basePath = path.resolve(__dirname, "tmp/kanji-base.json");
  if (!fs.existsSync(basePath)) {
    console.error(
      `kanji-base.json not found. Run generate-kanji-data.ts first.`,
    );
    process.exit(1);
  }
  const kanjiEntries: KanjiBaseEntry[] = JSON.parse(
    fs.readFileSync(basePath, "utf-8"),
  );
  console.log(`Loaded ${kanjiEntries.length} kanji entries`);

  // Build a set of all joyo kanji for quick lookup
  const joyoKanjiSet = new Set(kanjiEntries.map((e) => e.character));

  // Load JMdict
  const jmdictPath = path.resolve(
    __dirname,
    "tmp/jmdict-eng-common-3.6.2.json",
  );
  if (!fs.existsSync(jmdictPath)) {
    console.error(
      `JMdict file not found: ${jmdictPath}\nDownload it from https://github.com/scriptin/jmdict-simplified/releases`,
    );
    process.exit(1);
  }
  const jmdict: JmdictFile = JSON.parse(fs.readFileSync(jmdictPath, "utf-8"));
  console.log(`Loaded ${jmdict.words.length} JMdict entries`);

  // Build index: kanji character -> list of candidate words
  // Each candidate: { word, isAllKanji, frequency (based on common flag position) }
  interface Candidate {
    word: string;
    isAllKanji: boolean;
    /** Lower = more common (index in the kanji array with common=true) */
    frequency: number;
  }

  const candidateMap = new Map<string, Candidate[]>();

  for (const jmdictWord of jmdict.words) {
    // Only consider entries that have kanji writings
    for (const kanjiWriting of jmdictWord.kanji) {
      const word = kanjiWriting.text;

      // Filter: must be common, 2-4 chars
      if (!kanjiWriting.common) continue;
      if (!isValidLength(word)) continue;

      const isAllKanji = ALL_KANJI_REGEX.test(word);

      // For each joyo kanji in this word, add it as a candidate
      for (const char of word) {
        if (!joyoKanjiSet.has(char)) continue;

        if (!candidateMap.has(char)) {
          candidateMap.set(char, []);
        }

        // Use JMdict entry order as a rough frequency proxy
        // (earlier entries tend to be more common)
        candidateMap.get(char)!.push({
          word,
          isAllKanji,
          frequency: candidateMap.get(char)!.length,
        });
      }
    }
  }

  // For each kanji, select the top 3 examples
  let withExamples = 0;
  let totalExamples = 0;
  const exampleCounts: Record<number, number> = {};

  for (const entry of kanjiEntries) {
    const candidates = candidateMap.get(entry.character) || [];

    // Sort: all-kanji words first, then by frequency (order in JMdict)
    candidates.sort((a, b) => {
      if (a.isAllKanji !== b.isAllKanji) {
        return a.isAllKanji ? -1 : 1;
      }
      return a.frequency - b.frequency;
    });

    // Deduplicate words (same word might appear from different JMdict entries)
    const seen = new Set<string>();
    const selected: string[] = [];
    for (const candidate of candidates) {
      if (seen.has(candidate.word)) continue;
      seen.add(candidate.word);
      selected.push(candidate.word);
      if (selected.length >= MAX_EXAMPLES) break;
    }

    entry.examples = selected;

    const count = selected.length;
    exampleCounts[count] = (exampleCounts[count] || 0) + 1;
    if (count > 0) withExamples++;
    totalExamples += count;
  }

  // Write final output to src/data/kanji-data.json
  const outputPath = path.resolve(__dirname, "../src/data/kanji-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(kanjiEntries, null, 2) + "\n");

  // Print statistics
  console.log("\nExample word statistics:");
  for (const count of Object.keys(exampleCounts).sort(
    (a, b) => Number(a) - Number(b),
  )) {
    console.log(`  ${count} examples: ${exampleCounts[Number(count)]} kanji`);
  }
  console.log(
    `\nKanji with at least 1 example: ${withExamples}/${kanjiEntries.length} (${((withExamples / kanjiEntries.length) * 100).toFixed(1)}%)`,
  );
  console.log(`Total example words: ${totalExamples}`);
  console.log(
    `Average examples per kanji: ${(totalExamples / kanjiEntries.length).toFixed(2)}`,
  );
  console.log(`\nWrote ${kanjiEntries.length} entries to ${outputPath}`);
}

main();
