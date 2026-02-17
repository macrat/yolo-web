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

/** Returns all unique kanji categories that have entries */
export function getKanjiCategories(): KanjiCategory[] {
  const categories = new Set<KanjiCategory>();
  for (const k of allKanji) {
    categories.add(k.category);
  }
  return Array.from(categories).sort();
}

/** Returns all kanji characters as an array of strings */
export function getAllKanjiChars(): string[] {
  return allKanji.map((k) => k.character);
}
