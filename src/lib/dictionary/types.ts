/** Type definitions for dictionary data */

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

export type KanjiCategory =
  | "abstract"
  | "action"
  | "animal"
  | "body"
  | "building"
  | "direction"
  | "earth"
  | "fire"
  | "language"
  | "nature"
  | "number"
  | "person"
  | "plant"
  | "time"
  | "tool"
  | "water"
  | "weather";

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

export const KANJI_CATEGORY_LABELS: Record<KanjiCategory, string> = {
  abstract: "抽象",
  action: "動作",
  animal: "動物",
  body: "身体",
  building: "建物",
  direction: "方向",
  earth: "大地",
  fire: "火",
  language: "言語",
  nature: "自然",
  number: "数字",
  person: "人",
  plant: "植物",
  time: "時間",
  tool: "道具",
  water: "水",
  weather: "天気",
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
