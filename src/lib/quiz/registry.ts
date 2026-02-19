import type { QuizDefinition, QuizMeta } from "./types";
import kanjiLevelQuiz from "./data/kanji-level";
import traditionalColorQuiz from "./data/traditional-color";

const quizEntries: QuizDefinition[] = [kanjiLevelQuiz, traditionalColorQuiz];

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
