import type { GameMeta } from "./types";

const gameEntries: GameMeta[] = [
  {
    slug: "kanji-kanaru",
    title: "漢字カナール",
    shortDescription: "毎日1つの漢字を推理するパズル",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
    icon: "\u{1F4DA}",
    accentColor: "#4d8c3f",
    difficulty: "初級〜中級",
    keywords: ["漢字", "パズル", "デイリー", "推理"],
    statsKey: "kanji-kanaru-stats",
    ogpSubtitle: "毎日の漢字パズル",
    sitemap: { changeFrequency: "daily", priority: 0.8 },
  },
  {
    slug: "yoji-kimeru",
    title: "四字キメル",
    shortDescription: "毎日1つの四字熟語を当てるパズル",
    description:
      "毎日1つの四字熟語を当てるパズルゲーム。4文字の漢字を推理しよう!",
    icon: "\u{1F3AF}",
    accentColor: "#9a8533",
    difficulty: "中級〜上級",
    keywords: ["四字熟語", "パズル", "デイリー", "漢字"],
    statsKey: "yoji-kimeru-stats",
    ogpSubtitle: "毎日の四字熟語パズル",
    sitemap: { changeFrequency: "daily", priority: 0.8 },
  },
  {
    slug: "nakamawake",
    title: "ナカマワケ",
    shortDescription: "16個の言葉を4グループに分けるパズル",
    description:
      "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう!",
    icon: "\u{1F9E9}",
    accentColor: "#8a5a9a",
    difficulty: "初級〜上級",
    keywords: ["仲間分け", "グループ", "パズル", "言葉"],
    statsKey: "nakamawake-stats",
    ogpSubtitle: "毎日の仲間分けパズル",
    sitemap: { changeFrequency: "daily", priority: 0.8 },
  },
  {
    slug: "irodori",
    title: "イロドリ",
    shortDescription: "毎日5つの色を作って色彩感覚を鍛えよう",
    description:
      "毎日5つの色を作って色彩感覚を鍛えよう! ターゲットカラーにどれだけ近づけるかチャレンジ!",
    icon: "\u{1F3A8}",
    accentColor: "#e91e63",
    difficulty: "初級〜上級",
    keywords: ["色", "カラー", "色彩", "デイリー"],
    statsKey: "irodori-stats",
    ogpSubtitle: "毎日の色彩チャレンジ",
    sitemap: { changeFrequency: "daily", priority: 0.8 },
  },
];

/** slug -> GameMeta O(1) lookup */
export const gameBySlug: Map<string, GameMeta> = new Map(
  gameEntries.map((g) => [g.slug, g]),
);

/** All game metadata (display order preserved) */
export const allGameMetas: GameMeta[] = gameEntries;

/** All game slugs */
export function getAllGameSlugs(): string[] {
  return gameEntries.map((g) => g.slug);
}

/** Derive the path for a game from its slug */
export function getGamePath(slug: string): string {
  return `/games/${slug}`;
}
