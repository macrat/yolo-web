/** Data access functions for yoji (four-character idiom) dictionary */

import yojiData from "@/data/yoji-data.json";
import type { YojiEntry, YojiCategory, YojiDifficulty } from "./types";

const allYoji: YojiEntry[] = yojiData as YojiEntry[];

/** Returns all yoji entries */
export function getAllYoji(): YojiEntry[] {
  return allYoji;
}

/** Returns a single yoji entry by its four-character string, or undefined if not found */
export function getYojiByYoji(yoji: string): YojiEntry | undefined {
  return allYoji.find((y) => y.yoji === yoji);
}

/** Returns all yoji entries in a given category */
export function getYojiByCategory(category: YojiCategory): YojiEntry[] {
  return allYoji.filter((y) => y.category === category);
}

/** Returns all yoji entries matching a given difficulty level */
export function getYojiByDifficulty(level: YojiDifficulty): YojiEntry[] {
  return allYoji.filter((y) => y.difficulty === level);
}

/** Returns all unique yoji categories that have entries */
export function getYojiCategories(): YojiCategory[] {
  const categories = new Set<YojiCategory>();
  for (const y of allYoji) {
    categories.add(y.category);
  }
  return Array.from(categories).sort();
}

/** Returns all yoji strings as an array */
export function getAllYojiIds(): string[] {
  return allYoji.map((y) => y.yoji);
}
