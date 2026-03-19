/**
 * personality型クイズ11個のFAQデータが正しく定義されていることを確認するテスト
 * B-212: traditional-color, yoji-personality, impossible-advice, contrarian-fortune,
 *        unexpected-compatibility, music-personality, character-fortune,
 *        animal-personality, science-thinking, japanese-culture, character-personalityのFAQ
 */
import { describe, it, expect } from "vitest";
import traditionalColorQuiz from "../data/traditional-color";
import yojiPersonalityQuiz from "../data/yoji-personality";
import impossibleAdviceQuiz from "../data/impossible-advice";
import contrarianFortuneQuiz from "../data/contrarian-fortune";
import unexpectedCompatibilityQuiz from "../data/unexpected-compatibility";
import musicPersonalityQuiz from "../data/music-personality";
import characterFortuneQuiz from "../data/character-fortune";
import animalPersonalityQuiz from "../data/animal-personality";
import scienceThinkingQuiz from "../data/science-thinking";
import japaneseCultureQuiz from "../data/japanese-culture";
import characterPersonalityQuiz from "../data/character-personality";

const quizzes = [
  { quiz: traditionalColorQuiz, name: "traditional-color" },
  { quiz: yojiPersonalityQuiz, name: "yoji-personality" },
  { quiz: impossibleAdviceQuiz, name: "impossible-advice" },
  { quiz: contrarianFortuneQuiz, name: "contrarian-fortune" },
  { quiz: unexpectedCompatibilityQuiz, name: "unexpected-compatibility" },
  { quiz: musicPersonalityQuiz, name: "music-personality" },
  { quiz: characterFortuneQuiz, name: "character-fortune" },
  { quiz: animalPersonalityQuiz, name: "animal-personality" },
  { quiz: scienceThinkingQuiz, name: "science-thinking" },
  { quiz: japaneseCultureQuiz, name: "japanese-culture" },
  { quiz: characterPersonalityQuiz, name: "character-personality" },
];

describe("personality quiz FAQ data", () => {
  for (const { quiz, name } of quizzes) {
    describe(`${name}`, () => {
      it("has faq field defined", () => {
        expect(quiz.meta.faq).toBeDefined();
      });

      it("has 3 to 5 FAQ entries", () => {
        const faq = quiz.meta.faq;
        expect(faq).toBeDefined();
        expect(faq!.length).toBeGreaterThanOrEqual(3);
        expect(faq!.length).toBeLessThanOrEqual(5);
      });

      it("each FAQ entry has non-empty question and answer strings", () => {
        const faq = quiz.meta.faq;
        expect(faq).toBeDefined();
        for (const entry of faq!) {
          expect(typeof entry.question).toBe("string");
          expect(entry.question.length).toBeGreaterThan(0);
          expect(typeof entry.answer).toBe("string");
          expect(entry.answer.length).toBeGreaterThan(0);
        }
      });

      it("FAQ answers contain no HTML tags", () => {
        const faq = quiz.meta.faq;
        expect(faq).toBeDefined();
        for (const entry of faq!) {
          // HTMLタグが含まれていないことを確認
          expect(entry.answer).not.toMatch(/<[^>]+>/);
        }
      });
    });
  }

  it("each quiz has unique FAQ questions (no cross-quiz duplicates)", () => {
    // 11個のクイズで全く同じ質問文がコピーされていないことを確認
    const allQuestions = quizzes.flatMap(({ quiz }) =>
      (quiz.meta.faq ?? []).map((f) => f.question),
    );
    const uniqueQuestions = new Set(allQuestions);
    expect(uniqueQuestions.size).toBe(allQuestions.length);
  });
});
