/** Type definitions for dictionary data */

import type { TrustLevel } from "@/lib/trust-levels";

/** 辞典種別ごとのメタデータ（品質要素を含む） */
export interface DictionaryMeta {
  /** 辞典識別子（例: "kanji", "yoji", "colors"） */
  slug: string;
  /** 辞典の表示名（例: "漢字辞典"） */
  name: string;
  /** ISO 8601 date-time with timezone (e.g. '2026-02-19T09:25:57+09:00') */
  publishedAt: string;
  /** ISO 8601 date-time with timezone. Set when main content is updated. */
  updatedAt?: string;
  /** コンテンツの信頼レベル */
  trustLevel: TrustLevel;
  /** 一行価値テキスト（40字以内推奨） */
  valueProposition?: string;
  /**
   * FAQ: Q&A形式の配列
   * 将来B-024でJSON-LD（FAQPage schema）化を前提とした構造。
   * answerはプレーンテキストのみ。
   */
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface KanjiEntry {
  character: string;
  radical: string;
  radicalGroup: number;
  strokeCount: number;
  grade: number;
  onYomi: string[];
  kunYomi: string[];
  meanings: string[];
  category: KanjiCategory;
  examples: string[];
}

export interface YojiEntry {
  yoji: string;
  reading: string;
  meaning: string;
  difficulty: YojiDifficulty;
  category: YojiCategory;
}

/** Radical group ID (1-20), matching the game's RadicalGroup type. */
export type KanjiCategory = number;

export type YojiCategory =
  | "change"
  | "conflict"
  | "effort"
  | "emotion"
  | "knowledge"
  | "life"
  | "nature"
  | "negative"
  | "society"
  | "virtue";

export type YojiDifficulty = 1 | 2 | 3;

/** Japanese labels for radical group categories (1-20). */
export const KANJI_CATEGORY_LABELS: Record<KanjiCategory, string> = {
  1: "基本図形",
  2: "人と体上部",
  3: "刃物と力",
  4: "口と囲い",
  5: "天文と時間",
  6: "山と川",
  7: "動作基本",
  8: "打撃と文",
  9: "木と欠",
  10: "爪と父",
  11: "瓜と生",
  12: "目と矢",
  13: "米と糸",
  14: "筆と肉",
  15: "草と虫",
  16: "見と言",
  17: "足と身",
  18: "金と門",
  19: "面と革",
  20: "魚と鳥",
};

export const YOJI_CATEGORY_LABELS: Record<YojiCategory, string> = {
  change: "変化",
  conflict: "対立・闘い",
  effort: "努力",
  emotion: "感情",
  knowledge: "知識",
  life: "人生",
  nature: "自然",
  negative: "否定的",
  society: "社会",
  virtue: "美徳",
};

export const YOJI_DIFFICULTY_LABELS: Record<YojiDifficulty, string> = {
  1: "初級",
  2: "中級",
  3: "上級",
};

export interface ColorEntry {
  slug: string;
  name: string;
  romaji: string;
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  category: ColorCategory;
}

export type ColorCategory =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "achromatic";

export const COLOR_CATEGORY_LABELS: Record<ColorCategory, string> = {
  red: "赤系",
  orange: "橙系",
  yellow: "黄系",
  green: "緑系",
  blue: "青系",
  purple: "紫系",
  achromatic: "無彩色",
};
