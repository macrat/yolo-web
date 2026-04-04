/**
 * Tests for resultPageLabels configuration in all personality quizzes
 * that have detailedContent with the standard QuizResultDetailedContent format.
 *
 * Note: contrarian-fortune uses ContrarianFortuneDetailedContent (variant: "contrarian-fortune")
 * and character-fortune uses CharacterFortuneDetailedContent (variant: "character-fortune"),
 * which do NOT use resultPageLabels. They are excluded from this test file.
 *
 * Note: music-personality has been migrated to MusicPersonalityContent with
 * afterTodayAction slot for compatibility section. It no longer uses
 * resultPageLabels and is excluded from this test file.
 *
 * Note: traditional-color has been migrated to TraditionalColorDetailedContent
 * (variant: "traditional-color") which uses a dedicated result component and
 * does NOT use resultPageLabels. It is excluded from this test file.
 *
 * Note: yoji-personality has been migrated to YojiPersonalityDetailedContent
 * (variant: "yoji-personality") which uses a dedicated result component and
 * does NOT use resultPageLabels. It is excluded from this test file.
 *
 * Note: character-personality has been migrated to CharacterPersonalityDetailedContent
 * (variant: "character-personality") which uses a dedicated result component and
 * does NOT use resultPageLabels. It is excluded from this test file.
 *
 * Note: unexpected-compatibility has been migrated to UnexpectedCompatibilityDetailedContent
 * (variant: "unexpected-compatibility") which uses a dedicated result component and
 * does NOT use resultPageLabels. It is excluded from this test file.
 *
 * Verifies that each quiz with detailedContent has meaningful,
 * non-default resultPageLabels set in meta, and that they don't
 * contain "あなた" (since these are third-person type description pages).
 */
import { describe, it, expect } from "vitest";
import animalPersonalityQuiz from "../animal-personality";
import impossibleAdviceQuiz from "../impossible-advice";

// contrarian-fortune, character-fortune, music-personality, traditional-color, yoji-personality,
// character-personality, and unexpected-compatibility are excluded: they use variant-specific
// DetailedContent formats with dedicated result components that do not use resultPageLabels
const quizzesWithDetailedContent = [
  { quiz: animalPersonalityQuiz, name: "animal-personality" },
  { quiz: impossibleAdviceQuiz, name: "impossible-advice" },
];

describe("resultPageLabels for quizzes with detailedContent", () => {
  it("all 2 standard-format quizzes have resultPageLabels defined", () => {
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

  it("all 2 quizzes have unique traitsHeadings (no two quizzes share the same label)", () => {
    const traitsHeadings = quizzesWithDetailedContent.map(
      ({ quiz }) => quiz.meta.resultPageLabels!.traitsHeading!,
    );
    const uniqueHeadings = new Set(traitsHeadings);
    expect(
      uniqueHeadings.size,
      `all 2 traitsHeadings must be unique, but found duplicates: [${traitsHeadings.join(", ")}]`,
    ).toBe(2);
  });

  it("all 2 quizzes have unique behaviorsHeadings (no two quizzes share the same label)", () => {
    const behaviorsHeadings = quizzesWithDetailedContent.map(
      ({ quiz }) => quiz.meta.resultPageLabels!.behaviorsHeading!,
    );
    const uniqueHeadings = new Set(behaviorsHeadings);
    expect(
      uniqueHeadings.size,
      `all 2 behaviorsHeadings must be unique, but found duplicates: [${behaviorsHeadings.join(", ")}]`,
    ).toBe(2);
  });

  it("all 2 quizzes have unique adviceHeadings (no two quizzes share the same label)", () => {
    const adviceHeadings = quizzesWithDetailedContent.map(
      ({ quiz }) => quiz.meta.resultPageLabels!.adviceHeading!,
    );
    const uniqueHeadings = new Set(adviceHeadings);
    expect(
      uniqueHeadings.size,
      `all 2 adviceHeadings must be unique, but found duplicates: [${adviceHeadings.join(", ")}]`,
    ).toBe(2);
  });

  it("animal-personality adviceHeading should not be '生息地からのメッセージ' (advice content is unrelated to habitat)", () => {
    const labels = animalPersonalityQuiz.meta.resultPageLabels!;
    expect(labels.adviceHeading).not.toBe("生息地からのメッセージ");
  });

  /**
   * Require at least 1 out of 2 quizzes to use non-generic phrasing.
   * Generic patterns: "の特徴", "のあるある", "へのひとこと" used together
   * across many quizzes constitute the "画一的" problem this task solves.
   *
   * A quiz is considered "differentiated" if at least 2 of its 3 headings
   * do NOT follow the common "この〇〇タイプ" template.
   */
  it("at least 1 of 2 quizzes have differentiated headings (not generic 'タイプの特徴/あるある/ひとこと' pattern)", () => {
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

    expect(
      differentiatedCount,
      `at least 1 of 2 quizzes should have differentiated headings, but only ${differentiatedCount} do`,
    ).toBeGreaterThanOrEqual(1);
  });
});
