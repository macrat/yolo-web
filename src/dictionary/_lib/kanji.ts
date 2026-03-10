/** Data access functions for kanji dictionary */

import kanjiData from "@/data/kanji-data.json";
import type { KanjiEntry } from "./types";

const allKanji: KanjiEntry[] = kanjiData as KanjiEntry[];

/** Returns all kanji entries */
export function getAllKanji(): KanjiEntry[] {
  return allKanji;
}

/** Returns a single kanji entry by character, or undefined if not found */
export function getKanjiByChar(char: string): KanjiEntry | undefined {
  return allKanji.find((k) => k.character === char);
}

/** Returns all kanji entries for a given grade */
export function getKanjiByGrade(grade: number): KanjiEntry[] {
  return allKanji.filter((k) => k.grade === grade);
}

/** Returns all unique grades as string array for URL compatibility */
export function getKanjiGrades(): string[] {
  const grades = new Set<number>();
  for (const k of allKanji) {
    grades.add(k.grade);
  }
  return Array.from(grades)
    .sort((a, b) => a - b)
    .map(String);
}

/** Returns all kanji entries with the given radical character */
export function getKanjiByRadical(radical: string): KanjiEntry[] {
  return allKanji.filter((k) => k.radical === radical);
}

/** Returns all unique radical characters sorted by radical group number */
export function getKanjiRadicals(): string[] {
  const radicalMap = new Map<string, number>();
  for (const k of allKanji) {
    if (!radicalMap.has(k.radical)) {
      radicalMap.set(k.radical, k.radicalGroup);
    }
  }
  return Array.from(radicalMap.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([radical]) => radical);
}

/** Returns all kanji entries with the given stroke count */
export function getKanjiByStrokeCount(count: number): KanjiEntry[] {
  return allKanji.filter((k) => k.strokeCount === count);
}

/** Returns all unique stroke counts sorted ascending */
export function getKanjiStrokeCounts(): number[] {
  const counts = new Set<number>();
  for (const k of allKanji) {
    counts.add(k.strokeCount);
  }
  return Array.from(counts).sort((a, b) => a - b);
}

/** Returns all kanji characters as an array of strings */
export function getAllKanjiChars(): string[] {
  return allKanji.map((k) => k.character);
}
