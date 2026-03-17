import { describe, it, expect } from "vitest";
import musicPersonalityQuiz, {
  compatibilityMatrix,
  getCompatibility,
  isValidMusicTypeId,
  MUSIC_TYPE_IDS,
} from "../data/music-personality";
import { determineResult } from "../scoring";
import type { QuizAnswer } from "../types";

describe("music-personality quiz data", () => {
  const quiz = musicPersonalityQuiz;

  it("has correct meta", () => {
    expect(quiz.meta.slug).toBe("music-personality");
    expect(quiz.meta.type).toBe("personality");
    expect(quiz.meta.questionCount).toBe(10);
    expect(quiz.questions.length).toBe(10);
  });

  it("has exactly 8 result types", () => {
    expect(quiz.results.length).toBe(8);
  });

  it("all result IDs match MUSIC_TYPE_IDS", () => {
    const resultIds = quiz.results.map((r) => r.id);
    expect(resultIds).toEqual([...MUSIC_TYPE_IDS]);
  });

  it("each question has exactly 4 choices", () => {
    for (const question of quiz.questions) {
      expect(question.choices.length).toBe(4);
    }
  });

  it("each choice has points defined", () => {
    for (const question of quiz.questions) {
      for (const choice of question.choices) {
        expect(choice.points).toBeDefined();
        expect(Object.keys(choice.points ?? {}).length).toBeGreaterThan(0);
      }
    }
  });

  it("all point keys reference valid result IDs", () => {
    const validIds = new Set(quiz.results.map((r) => r.id));
    for (const question of quiz.questions) {
      for (const choice of question.choices) {
        for (const key of Object.keys(choice.points ?? {})) {
          expect(validIds.has(key)).toBe(true);
        }
      }
    }
  });
});

describe("point distribution balance", () => {
  const quiz = musicPersonalityQuiz;

  it("each type has exactly 5 primary (2pt) slots", () => {
    const primaryCounts: Record<string, number> = {};
    for (const typeId of MUSIC_TYPE_IDS) {
      primaryCounts[typeId] = 0;
    }

    for (const question of quiz.questions) {
      for (const choice of question.choices) {
        for (const [typeId, points] of Object.entries(choice.points ?? {})) {
          if (points === 2) {
            primaryCounts[typeId] = (primaryCounts[typeId] ?? 0) + 1;
          }
        }
      }
    }

    for (const typeId of MUSIC_TYPE_IDS) {
      expect(primaryCounts[typeId]).toBe(5);
    }
  });

  it("each type has exactly 5 secondary (1pt) slots", () => {
    const secondaryCounts: Record<string, number> = {};
    for (const typeId of MUSIC_TYPE_IDS) {
      secondaryCounts[typeId] = 0;
    }

    for (const question of quiz.questions) {
      for (const choice of question.choices) {
        for (const [typeId, points] of Object.entries(choice.points ?? {})) {
          if (points === 1) {
            secondaryCounts[typeId] = (secondaryCounts[typeId] ?? 0) + 1;
          }
        }
      }
    }

    for (const typeId of MUSIC_TYPE_IDS) {
      expect(secondaryCounts[typeId]).toBe(5);
    }
  });

  it("no extreme bias when answering uniformly", () => {
    // Simulate "uniform" answering: sum all points across all choices
    const totalPoints: Record<string, number> = {};

    for (const question of quiz.questions) {
      for (const choice of question.choices) {
        for (const [typeId, points] of Object.entries(choice.points ?? {})) {
          totalPoints[typeId] = (totalPoints[typeId] ?? 0) + points;
        }
      }
    }

    // Each type should have the same total points across all choices
    // (5 primary * 2 + 5 secondary * 1 = 15 per type)
    for (const typeId of MUSIC_TYPE_IDS) {
      expect(totalPoints[typeId]).toBe(15);
    }
  });
});

describe("personality scoring for each type", () => {
  const quiz = musicPersonalityQuiz;

  // For each type, construct answers that maximize that type's score
  for (const targetType of MUSIC_TYPE_IDS) {
    it(`answers biased toward ${targetType} produce that result`, () => {
      const answers: QuizAnswer[] = [];

      for (const question of quiz.questions) {
        // Find the choice that gives the most points to targetType
        let bestChoice = question.choices[0];
        let bestPoints = 0;
        for (const choice of question.choices) {
          const pts = choice.points?.[targetType] ?? 0;
          if (pts > bestPoints) {
            bestPoints = pts;
            bestChoice = choice;
          }
        }
        answers.push({
          questionId: question.id,
          choiceId: bestChoice.id,
        });
      }

      const result = determineResult(quiz, answers);
      expect(result.id).toBe(targetType);
    });
  }
});

describe("compatibility matrix", () => {
  it("has exactly 36 entries (8 same-type + 28 cross-type)", () => {
    expect(Object.keys(compatibilityMatrix).length).toBe(36);
  });

  it("all entries have non-empty label and description", () => {
    for (const [, entry] of Object.entries(compatibilityMatrix)) {
      expect(entry.label.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it("covers all possible type pair combinations", () => {
    for (let i = 0; i < MUSIC_TYPE_IDS.length; i++) {
      for (let j = i; j < MUSIC_TYPE_IDS.length; j++) {
        const key = [MUSIC_TYPE_IDS[i], MUSIC_TYPE_IDS[j]].sort().join("--");
        expect(compatibilityMatrix[key]).toBeDefined();
      }
    }
  });

  it("all matrix keys use sorted type ID pairs", () => {
    for (const key of Object.keys(compatibilityMatrix)) {
      const parts = key.split("--");
      expect(parts.length).toBe(2);
      const sorted = [...parts].sort();
      expect(parts).toEqual(sorted);
    }
  });
});

describe("getCompatibility", () => {
  it("returns correct entry for a known pair", () => {
    const result = getCompatibility("festival-pioneer", "playlist-evangelist");
    expect(result).toBeDefined();
    expect(result?.label).toBe("最強の拡散装置");
  });

  it("is order-independent", () => {
    const ab = getCompatibility("festival-pioneer", "solo-explorer");
    const ba = getCompatibility("solo-explorer", "festival-pioneer");
    expect(ab).toEqual(ba);
  });

  it("works for same-type pairs", () => {
    const result = getCompatibility("repeat-warrior", "repeat-warrior");
    expect(result).toBeDefined();
    expect(result?.label).toBe("無限ループの絆");
  });

  it("returns undefined for invalid type IDs", () => {
    expect(getCompatibility("invalid", "festival-pioneer")).toBeUndefined();
  });
});

describe("isValidMusicTypeId", () => {
  it("returns true for valid type IDs", () => {
    for (const id of MUSIC_TYPE_IDS) {
      expect(isValidMusicTypeId(id)).toBe(true);
    }
  });

  it("returns false for invalid IDs", () => {
    expect(isValidMusicTypeId("invalid")).toBe(false);
    expect(isValidMusicTypeId("")).toBe(false);
  });
});
