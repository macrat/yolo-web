/** Data access functions for kanji dictionary */

import kanjiData from "@/data/kanji-data.json";
import type { KanjiEntry, KanjiCategory } from "./types";

const allKanji: KanjiEntry[] = kanjiData as KanjiEntry[];

/** Returns all kanji entries */
export function getAllKanji(): KanjiEntry[] {
  return allKanji;
}

/** Returns a single kanji entry by character, or undefined if not found */
export function getKanjiByChar(char: string): KanjiEntry | undefined {
  return allKanji.find((k) => k.character === char);
}

/** Returns all kanji entries in a given category */
export function getKanjiByCategory(category: KanjiCategory): KanjiEntry[] {
  return allKanji.filter((k) => k.category === category);
}

/**
 * Returns all unique kanji categories that have entries.
 * Categories are returned as string representations of their numeric IDs
 * for URL compatibility (e.g., "1", "2", ..., "20").
 */
export function getKanjiCategories(): string[] {
  const categories = new Set<number>();
  for (const k of allKanji) {
    categories.add(k.category);
  }
  return Array.from(categories)
    .sort((a, b) => a - b)
    .map(String);
}

/** Returns all kanji characters as an array of strings */
export function getAllKanjiChars(): string[] {
  return allKanji.map((k) => k.character);
}
