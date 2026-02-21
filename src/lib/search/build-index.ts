/** Builds the search index from all content types */

import { allToolMetas } from "@/tools/registry";
import { allCheatsheetMetas } from "@/cheatsheets/registry";
import { getAllKanji } from "@/lib/dictionary/kanji";
import { getAllYoji } from "@/lib/dictionary/yoji";
import { getAllColors } from "@/lib/dictionary/colors";
import { getAllBlogPosts } from "@/lib/blog";
import { allQuizMetas } from "@/lib/quiz/registry";
import type { SearchDocument } from "./types";

/**
 * Game data for search index.
 * TODO: ゲームもレジストリパターンに移行する (see games/page.tsx GAMES)
 * 現在はゲーム数が少なく(4件)変更頻度も低いため、ここに直接定義している。
 * ゲームページの GAMES 定数と同期が必要。
 */
const GAMES_FOR_SEARCH = [
  {
    slug: "kanji-kanaru",
    title: "漢字カナール",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
    difficulty: "初級〜中級",
    keywords: ["漢字", "パズル", "デイリー", "推理"],
  },
  {
    slug: "yoji-kimeru",
    title: "四字キメル",
    description:
      "毎日1つの四字熟語を当てるパズルゲーム。4文字の漢字を推理しよう!",
    difficulty: "中級〜上級",
    keywords: ["四字熟語", "パズル", "デイリー", "漢字"],
  },
  {
    slug: "nakamawake",
    title: "ナカマワケ",
    description:
      "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう!",
    difficulty: "初級〜上級",
    keywords: ["仲間分け", "グループ", "パズル", "言葉"],
  },
  {
    slug: "irodori",
    title: "イロドリ",
    description:
      "毎日5つの色を作って色彩感覚を鍛えよう! ターゲットカラーにどれだけ近づけるかチャレンジ!",
    difficulty: "初級〜上級",
    keywords: ["色", "カラー", "色彩", "デイリー"],
  },
] as const;

/** Known game slugs for test validation */
export const GAME_SLUGS = GAMES_FOR_SEARCH.map((g) => g.slug);

/** Build the complete search index from all content types */
export function buildSearchIndex(): SearchDocument[] {
  const documents: SearchDocument[] = [];

  // Tools
  for (const tool of allToolMetas) {
    documents.push({
      id: `tool:${tool.slug}`,
      type: "tool",
      title: tool.name,
      description: tool.shortDescription,
      keywords: [...tool.keywords, tool.nameEn],
      url: `/tools/${tool.slug}`,
      category: tool.category,
    });
  }

  // Games
  for (const game of GAMES_FOR_SEARCH) {
    documents.push({
      id: `game:${game.slug}`,
      type: "game",
      title: game.title,
      description: game.description,
      keywords: game.keywords.slice(),
      url: `/games/${game.slug}`,
      extra: game.difficulty,
    });
  }

  // Cheatsheets
  for (const cs of allCheatsheetMetas) {
    documents.push({
      id: `cheatsheet:${cs.slug}`,
      type: "cheatsheet",
      title: cs.name,
      description: cs.shortDescription,
      keywords: [...cs.keywords, cs.nameEn],
      url: `/cheatsheets/${cs.slug}`,
      category: cs.category,
      extra: cs.sections.map((s) => s.title).join(" "),
    });
  }

  // Kanji
  for (const kanji of getAllKanji()) {
    documents.push({
      id: `kanji:${kanji.character}`,
      type: "kanji",
      title: kanji.character,
      description: kanji.meanings.join("\u3001"),
      keywords: [...kanji.onYomi, ...kanji.kunYomi],
      url: `/dictionary/kanji/${kanji.character}`,
      category: kanji.category,
      extra: kanji.examples.join(" "),
    });
  }

  // Yoji (four-character idioms)
  for (const yoji of getAllYoji()) {
    documents.push({
      id: `yoji:${yoji.yoji}`,
      type: "yoji",
      title: yoji.yoji,
      description: yoji.meaning,
      keywords: [yoji.reading],
      url: `/dictionary/yoji/${yoji.yoji}`,
      category: yoji.category,
    });
  }

  // Traditional colors
  // Note: ColorEntry only has romaji, not hiragana reading (m-5 checked)
  for (const color of getAllColors()) {
    documents.push({
      id: `color:${color.slug}`,
      type: "color",
      title: color.name,
      description: color.romaji,
      keywords: [color.hex],
      url: `/dictionary/colors/${color.slug}`,
      category: color.category,
      extra: color.romaji,
    });
  }

  // Blog posts
  for (const post of getAllBlogPosts()) {
    documents.push({
      id: `blog:${post.slug}`,
      type: "blog",
      title: post.title,
      description: post.description,
      keywords: post.tags,
      url: `/blog/${post.slug}`,
      category: post.category,
    });
  }

  // Quizzes
  for (const quiz of allQuizMetas) {
    documents.push({
      id: `quiz:${quiz.slug}`,
      type: "quiz",
      title: quiz.title,
      description: quiz.shortDescription,
      keywords: quiz.keywords,
      url: `/quiz/${quiz.slug}`,
      category: quiz.type,
    });
  }

  return documents;
}
