import yojiData from "@/data/yoji-data.json";
import type {
  YojiEntry,
  YojiCategory,
  YojiDifficulty,
  YojiOrigin,
} from "@/dictionary/_lib/types";

const allYoji: YojiEntry[] = yojiData as YojiEntry[];

/** Total number of yoji entries in the dataset */
export const YOJI_COUNT = allYoji.length;

export interface YojiFilters {
  query: string;
  category: YojiCategory | "all";
  difficulty: YojiDifficulty | "all";
  origin: YojiOrigin | "all";
}

/** Normalize text for comparison: katakana → hiragana, lowercase */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u30A1-\u30F6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60),
    );
}

/** Filter yoji entries by query text, category, difficulty, and origin */
export function filterYoji(filters: YojiFilters): YojiEntry[] {
  const { query, category, difficulty, origin } = filters;
  const normalizedQuery = normalize(query.trim());

  return allYoji.filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (difficulty !== "all" && entry.difficulty !== difficulty) return false;
    if (origin !== "all" && entry.origin !== origin) return false;

    if (normalizedQuery === "") return true;

    // Match against yoji, reading, and meaning fields
    return (
      normalize(entry.yoji).includes(normalizedQuery) ||
      normalize(entry.reading).includes(normalizedQuery) ||
      normalize(entry.meaning).includes(normalizedQuery)
    );
  });
}
