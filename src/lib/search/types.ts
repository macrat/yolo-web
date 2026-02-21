/** Type definitions for site-wide search */

export type ContentType =
  | "tool"
  | "game"
  | "cheatsheet"
  | "kanji"
  | "yoji"
  | "color"
  | "blog"
  | "quiz";

export type SearchDocument = {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  keywords: string[];
  url: string;
  category?: string;
  extra?: string;
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  tool: "ツール",
  game: "ゲーム",
  cheatsheet: "チートシート",
  kanji: "漢字",
  yoji: "四字熟語",
  color: "伝統色",
  blog: "ブログ",
  quiz: "クイズ",
};

/** Display order for search result groups (by relevance/usage frequency) */
export const CONTENT_TYPE_ORDER: ContentType[] = [
  "tool",
  "cheatsheet",
  "game",
  "quiz",
  "blog",
  "kanji",
  "yoji",
  "color",
];

/** Maximum number of items per group in search results */
export const MAX_ITEMS_PER_GROUP = 5;
