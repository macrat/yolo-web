import type { QuizDefinition, QuizMeta } from "./types";
import kanjiLevelQuiz from "./data/kanji-level";
import kotowazaLevelQuiz from "./data/kotowaza-level";
import traditionalColorQuiz from "./data/traditional-color";
import yojiLevelQuiz from "./data/yoji-level";
import yojiPersonalityQuiz from "./data/yoji-personality";
import impossibleAdviceQuiz from "./data/impossible-advice";
import contrarianFortuneQuiz from "./data/contrarian-fortune";
import unexpectedCompatibilityQuiz from "./data/unexpected-compatibility";
import musicPersonalityQuiz from "./data/music-personality";
import characterFortuneQuiz from "./data/character-fortune";
import animalPersonalityQuiz from "./data/animal-personality";
import scienceThinkingQuiz from "./data/science-thinking";

const quizEntries: QuizDefinition[] = [
  kanjiLevelQuiz,
  kotowazaLevelQuiz,
  traditionalColorQuiz,
  yojiLevelQuiz,
  yojiPersonalityQuiz,
  impossibleAdviceQuiz,
  contrarianFortuneQuiz,
  unexpectedCompatibilityQuiz,
  musicPersonalityQuiz,
  characterFortuneQuiz,
  animalPersonalityQuiz,
  scienceThinkingQuiz,
];

/** Map of slug -> QuizDefinition for O(1) lookup */
export const quizBySlug: Map<string, QuizDefinition> = new Map(
  quizEntries.map((q) => [q.meta.slug, q]),
);

/** All quiz metadata (lightweight, no question data) */
export const allQuizMetas: QuizMeta[] = quizEntries.map((q) => q.meta);

/** Get all slugs for generateStaticParams */
export function getAllQuizSlugs(): string[] {
  return quizEntries.map((q) => q.meta.slug);
}

/** Get all result IDs for a given quiz slug */
export function getResultIdsForQuiz(slug: string): string[] {
  const quiz = quizBySlug.get(slug);
  if (!quiz) return [];
  return quiz.results.map((r) => r.id);
}
