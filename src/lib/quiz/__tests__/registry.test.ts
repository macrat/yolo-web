import { describe, it, expect } from "vitest";
import {
  quizBySlug,
  allQuizMetas,
  getAllQuizSlugs,
  getResultIdsForQuiz,
} from "../registry";

describe("quiz registry", () => {
  it("has at least one quiz registered", () => {
    expect(allQuizMetas.length).toBeGreaterThan(0);
  });

  it("getAllQuizSlugs returns all slugs", () => {
    const slugs = getAllQuizSlugs();
    expect(slugs.length).toBe(allQuizMetas.length);
    for (const meta of allQuizMetas) {
      expect(slugs).toContain(meta.slug);
    }
  });

  it("quizBySlug has all entries", () => {
    for (const meta of allQuizMetas) {
      expect(quizBySlug.has(meta.slug)).toBe(true);
    }
  });

  it("kanji-level quiz exists and has correct structure", () => {
    const quiz = quizBySlug.get("kanji-level");
    expect(quiz).toBeDefined();
    expect(quiz!.meta.type).toBe("knowledge");
    expect(quiz!.meta.questionCount).toBe(quiz!.questions.length);
  });

  describe("data integrity for all quizzes", () => {
    for (const [slug, quiz] of quizBySlug) {
      describe(`quiz: ${slug}`, () => {
        it("has required meta fields", () => {
          expect(quiz.meta.slug).toBeTruthy();
          expect(quiz.meta.title).toBeTruthy();
          expect(quiz.meta.description).toBeTruthy();
          expect(quiz.meta.shortDescription).toBeTruthy();
          expect(quiz.meta.type).toMatch(/^(knowledge|personality)$/);
          expect(quiz.meta.questionCount).toBeGreaterThan(0);
          expect(quiz.meta.icon).toBeTruthy();
          expect(quiz.meta.accentColor).toBeTruthy();
          expect(quiz.meta.publishedAt).toBeTruthy();
        });

        it("questionCount matches actual question count", () => {
          expect(quiz.meta.questionCount).toBe(quiz.questions.length);
        });

        it("has at least one result", () => {
          expect(quiz.results.length).toBeGreaterThan(0);
        });

        it("all result IDs are unique", () => {
          const ids = quiz.results.map((r) => r.id);
          expect(new Set(ids).size).toBe(ids.length);
        });

        it("all question IDs are unique", () => {
          const ids = quiz.questions.map((q) => q.id);
          expect(new Set(ids).size).toBe(ids.length);
        });

        it("all choice IDs within a question are unique", () => {
          for (const question of quiz.questions) {
            const ids = question.choices.map((c) => c.id);
            expect(new Set(ids).size).toBe(ids.length);
          }
        });

        if (quiz.meta.type === "knowledge") {
          it("each knowledge question has exactly one correct answer", () => {
            for (const question of quiz.questions) {
              const correctCount = question.choices.filter(
                (c) => c.isCorrect,
              ).length;
              expect(correctCount).toBe(1);
            }
          });

          it("results have minScore defined", () => {
            for (const result of quiz.results) {
              expect(result.minScore).toBeDefined();
              expect(typeof result.minScore).toBe("number");
            }
          });
        }

        if (quiz.meta.type === "personality") {
          it("each personality choice has points", () => {
            for (const question of quiz.questions) {
              for (const choice of question.choices) {
                expect(choice.points).toBeDefined();
                expect(Object.keys(choice.points ?? {}).length).toBeGreaterThan(
                  0,
                );
              }
            }
          });
        }
      });
    }
  });

  describe("getResultIdsForQuiz", () => {
    it("returns result IDs for existing quiz", () => {
      const ids = getResultIdsForQuiz("kanji-level");
      expect(ids.length).toBeGreaterThan(0);
    });

    it("returns empty array for non-existent quiz", () => {
      expect(getResultIdsForQuiz("nonexistent")).toEqual([]);
    });
  });
});
