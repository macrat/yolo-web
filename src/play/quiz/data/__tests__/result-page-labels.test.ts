/**
 * Tests for resultPageLabels in the personality quizzes whose detailedContent uses the
 * standard QuizResultDetailedContent format.
 *
 * The other personality quizzes use variant-specific DetailedContent formats with dedicated
 * result components, which do not use resultPageLabels, so they are not covered here.
 *
 * Verifies that each quiz with detailedContent has meaningful,
 * non-default resultPageLabels set in meta, and that they don't
 * contain "あなた" (since these are third-person type description pages).
 */
import { describe, it, expect } from "vitest";
import animalPersonalityQuiz from "../animal-personality";
import wordSensePersonalityQuiz from "../word-sense-personality";

// 標準形式の detailedContent を使う診断。
const quizzesWithDetailedContent = [
  { quiz: animalPersonalityQuiz, name: "animal-personality" },
  { quiz: wordSensePersonalityQuiz, name: "word-sense-personality" },
];

describe("resultPageLabels for quizzes with detailedContent", () => {
  it("all standard-format quizzes have resultPageLabels defined", () => {
    for (const { quiz, name } of quizzesWithDetailedContent) {
      expect(
        quiz.meta.resultPageLabels,
        `${name}: resultPageLabels must be defined`,
      ).toBeDefined();
    }
  });

  it("each quiz has all three headings set", () => {
    for (const { quiz, name } of quizzesWithDetailedContent) {
      const labels = quiz.meta.resultPageLabels!;
      expect(
        labels.traitsHeading,
        `${name}: traitsHeading must be set`,
      ).toBeDefined();
      expect(
        labels.behaviorsHeading,
        `${name}: behaviorsHeading must be set`,
      ).toBeDefined();
      expect(
        labels.adviceHeading,
        `${name}: adviceHeading must be set`,
      ).toBeDefined();
    }
  });

  it("headings are non-empty strings", () => {
    for (const { quiz, name } of quizzesWithDetailedContent) {
      const labels = quiz.meta.resultPageLabels!;
      expect(
        labels.traitsHeading!.length,
        `${name}: traitsHeading must not be empty`,
      ).toBeGreaterThan(0);
      expect(
        labels.behaviorsHeading!.length,
        `${name}: behaviorsHeading must not be empty`,
      ).toBeGreaterThan(0);
      expect(
        labels.adviceHeading!.length,
        `${name}: adviceHeading must not be empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("headings do not contain 'あなた' (third-person page requirement)", () => {
    for (const { quiz, name } of quizzesWithDetailedContent) {
      const labels = quiz.meta.resultPageLabels!;
      expect(
        labels.traitsHeading,
        `${name}: traitsHeading must not contain 'あなた'`,
      ).not.toContain("あなた");
      expect(
        labels.behaviorsHeading,
        `${name}: behaviorsHeading must not contain 'あなた'`,
      ).not.toContain("あなた");
      expect(
        labels.adviceHeading,
        `${name}: adviceHeading must not contain 'あなた'`,
      ).not.toContain("あなた");
    }
  });

  it("headings are reasonably concise (5-30 chars each)", () => {
    for (const { quiz, name } of quizzesWithDetailedContent) {
      const labels = quiz.meta.resultPageLabels!;
      for (const [key, value] of Object.entries(labels)) {
        if (value !== undefined) {
          expect(
            value.length,
            `${name}: ${key} should be 5-30 chars`,
          ).toBeGreaterThanOrEqual(5);
          expect(
            value.length,
            `${name}: ${key} should be 5-30 chars`,
          ).toBeLessThanOrEqual(30);
        }
      }
    }
  });

  it("all quizzes have unique traitsHeadings (no two quizzes share the same label)", () => {
    const traitsHeadings = quizzesWithDetailedContent.map(
      ({ quiz }) => quiz.meta.resultPageLabels!.traitsHeading!,
    );
    const uniqueHeadings = new Set(traitsHeadings);
    expect(
      uniqueHeadings.size,
      `all traitsHeadings must be unique, but found duplicates: [${traitsHeadings.join(", ")}]`,
    ).toBe(quizzesWithDetailedContent.length);
  });

  it("all quizzes have unique behaviorsHeadings (no two quizzes share the same label)", () => {
    const behaviorsHeadings = quizzesWithDetailedContent.map(
      ({ quiz }) => quiz.meta.resultPageLabels!.behaviorsHeading!,
    );
    const uniqueHeadings = new Set(behaviorsHeadings);
    expect(
      uniqueHeadings.size,
      `all behaviorsHeadings must be unique, but found duplicates: [${behaviorsHeadings.join(", ")}]`,
    ).toBe(quizzesWithDetailedContent.length);
  });

  it("all quizzes have unique adviceHeadings (no two quizzes share the same label)", () => {
    const adviceHeadings = quizzesWithDetailedContent.map(
      ({ quiz }) => quiz.meta.resultPageLabels!.adviceHeading!,
    );
    const uniqueHeadings = new Set(adviceHeadings);
    expect(
      uniqueHeadings.size,
      `all adviceHeadings must be unique, but found duplicates: [${adviceHeadings.join(", ")}]`,
    ).toBe(quizzesWithDetailedContent.length);
  });

  it("animal-personality adviceHeading should not be '生息地からのメッセージ' (advice content is unrelated to habitat)", () => {
    const labels = animalPersonalityQuiz.meta.resultPageLabels!;
    expect(labels.adviceHeading).not.toBe("生息地からのメッセージ");
  });

  /**
   * Require at least 1 out of 1 quizzes to use non-generic phrasing.
   * Generic patterns: "の特徴", "のあるある", "へのひとこと" used together
   * across many quizzes constitute the "画一的" problem this task solves.
   *
   * A quiz is considered "differentiated" if at least 2 of its 3 headings
   * do NOT follow the common "この〇〇タイプ" template.
   */
  it("all standard-format quizzes have differentiated headings (not generic 'タイプの特徴/あるある/ひとこと' pattern)", () => {
    const genericPatterns = [
      "のあるある",
      "タイプの特徴",
      "タイプへのひとこと",
      "タイプのあるある",
    ];

    const differentiatedCount = quizzesWithDetailedContent.filter(
      ({ quiz }) => {
        const labels = quiz.meta.resultPageLabels!;
        const headings = [
          labels.traitsHeading ?? "",
          labels.behaviorsHeading ?? "",
          labels.adviceHeading ?? "",
        ];
        // Count headings that do NOT match any generic pattern
        const nonGenericCount = headings.filter(
          (h) => !genericPatterns.some((p) => h.includes(p)),
        ).length;
        // A quiz is "differentiated" if at least 2 of 3 headings are non-generic
        return nonGenericCount >= 2;
      },
    ).length;

    // 標準形式 detailedContent を持つ全クイズが差別化見出しを持つことを要求する
    // （汎用見出しの「画一的」問題を防ぐ）。
    expect(
      differentiatedCount,
      `all ${quizzesWithDetailedContent.length} quizzes should have differentiated headings, but only ${differentiatedCount} do`,
    ).toBe(quizzesWithDetailedContent.length);
  });
});
