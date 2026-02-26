/** Builds the search index from all content types */

import { allToolMetas } from "@/tools/registry";
import { allCheatsheetMetas } from "@/cheatsheets/registry";
import { getAllKanji } from "@/lib/dictionary/kanji";
import { getAllYoji } from "@/lib/dictionary/yoji";
import { getAllColors } from "@/lib/dictionary/colors";
import { getAllBlogPosts } from "@/lib/blog";
import { allQuizMetas } from "@/lib/quiz/registry";
import { allGameMetas } from "@/games/registry";
import type { SearchDocument } from "./types";

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
  for (const game of allGameMetas) {
    documents.push({
      id: `game:${game.slug}`,
      type: "game",
      title: game.title,
      description: game.description,
      keywords: [...game.keywords],
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
