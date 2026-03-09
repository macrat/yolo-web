import { describe, it, expect } from "vitest";
import scienceThinkingQuiz, {
  AXIS_IDS,
  SCIENCE_TYPE_IDS,
  determineScienceThinkingResult,
  getAxisScores,
} from "../data/science-thinking";
import type { QuizAnswer } from "../types";

describe("science-thinking quiz data", () => {
  const quiz = scienceThinkingQuiz;

  it("has correct meta", () => {
    expect(quiz.meta.slug).toBe("science-thinking");
    expect(quiz.meta.type).toBe("personality");
    expect(quiz.meta.questionCount).toBe(20);
    expect(quiz.questions.length).toBe(20);
  });

  it("has exactly 10 result types", () => {
    expect(quiz.results.length).toBe(10);
  });

  it("all result IDs match SCIENCE_TYPE_IDS", () => {
    const resultIds = quiz.results.map((r) => r.id);
    expect(resultIds).toEqual([...SCIENCE_TYPE_IDS]);
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

  it("all point keys reference valid axis IDs", () => {
    const validAxes = new Set<string>(AXIS_IDS);
    for (const question of quiz.questions) {
      for (const choice of question.choices) {
        for (const key of Object.keys(choice.points ?? {})) {
          expect(validAxes.has(key)).toBe(true);
        }
      }
    }
  });

  it("each result description is between 300 and 500 characters", () => {
    for (const result of quiz.results) {
      const len = result.description.length;
      expect(len).toBeGreaterThanOrEqual(300);
      expect(len).toBeLessThanOrEqual(500);
    }
  });
});

describe("point distribution balance", () => {
  const quiz = scienceThinkingQuiz;

  it("each axis has exactly 16 main (+3) slots", () => {
    const mainCounts: Record<string, number> = {};
    for (const axis of AXIS_IDS) {
      mainCounts[axis] = 0;
    }

    for (const question of quiz.questions) {
      for (const choice of question.choices) {
        for (const [axisId, points] of Object.entries(choice.points ?? {})) {
          if (points === 3) {
            mainCounts[axisId] = (mainCounts[axisId] ?? 0) + 1;
          }
        }
      }
    }

    for (const axis of AXIS_IDS) {
      expect(mainCounts[axis]).toBe(16);
    }
  });

  it("each choice has exactly one main (+3) and one sub (+1) point", () => {
    for (const question of quiz.questions) {
      for (const choice of question.choices) {
        const entries = Object.entries(choice.points ?? {});
        expect(entries.length).toBe(2);
        const values = entries.map(([, v]) => v).sort();
        expect(values).toEqual([1, 3]);
      }
    }
  });

  it("total main (+3) points are equal across all axes (48 each)", () => {
    const mainTotals: Record<string, number> = {};
    for (const question of quiz.questions) {
      for (const choice of question.choices) {
        for (const [axisId, points] of Object.entries(choice.points ?? {})) {
          if (points === 3) {
            mainTotals[axisId] = (mainTotals[axisId] ?? 0) + 3;
          }
        }
      }
    }

    // 16 slots x 3 points = 48 per axis
    for (const axis of AXIS_IDS) {
      expect(mainTotals[axis]).toBe(48);
    }
  });
});

describe("determineScienceThinkingResult - all 10 types reachable", () => {
  const quiz = scienceThinkingQuiz;

  // Type definition: primary axis + secondary axis
  const typeAxes: Array<{
    typeId: string;
    primary: string;
    secondary: string;
  }> = [
    { typeId: "einstein", primary: "theory", secondary: "creative" },
    { typeId: "curie", primary: "empirical", secondary: "observational" },
    { typeId: "turing", primary: "quantitative", secondary: "theory" },
    { typeId: "davinci", primary: "creative", secondary: "observational" },
    { typeId: "darwin", primary: "observational", secondary: "theory" },
    { typeId: "edison", primary: "creative", secondary: "empirical" },
    { typeId: "newton", primary: "theory", secondary: "quantitative" },
    {
      typeId: "nightingale",
      primary: "quantitative",
      secondary: "observational",
    },
    { typeId: "faraday", primary: "empirical", secondary: "creative" },
    { typeId: "fabre", primary: "observational", secondary: "empirical" },
  ];

  for (const { typeId, primary, secondary } of typeAxes) {
    it(`can reach ${typeId} (${primary} + ${secondary})`, () => {
      // Build answers that maximize primary axis, then secondary axis
      const answers: QuizAnswer[] = [];

      for (const question of quiz.questions) {
        let bestChoice = question.choices[0];
        let bestScore = -1;

        for (const choice of question.choices) {
          const pts = choice.points ?? {};
          let score = 0;
          if (pts[primary] === 3) score += 100;
          if (pts[secondary] === 3) score += 30;
          if (pts[primary] === 1) score += 10;
          if (pts[secondary] === 1) score += 3;
          if (score > bestScore) {
            bestScore = score;
            bestChoice = choice;
          }
        }

        answers.push({
          questionId: question.id,
          choiceId: bestChoice.id,
        });
      }

      const result = determineScienceThinkingResult(
        quiz.questions,
        answers,
        quiz.results,
      );
      expect(result.id).toBe(typeId);
    });
  }
});

describe("determineScienceThinkingResult - fallback logic", () => {
  const quiz = scienceThinkingQuiz;

  it("handles non-mapped axis pair via fallback", () => {
    // Build answers: theory highest, observational second, quantitative third
    // This is not directly mapped (theory+observational), so fallback should
    // compare creative vs quantitative and pick newton (quantitative higher)
    const answers: QuizAnswer[] = [];

    for (const question of quiz.questions) {
      let bestChoice = question.choices[0];
      let bestScore = -1;

      for (const choice of question.choices) {
        const pts = choice.points ?? {};
        let score = 0;
        // theory >> observational >> quantitative > everything else
        if (pts["theory"] === 3) score += 1000;
        if (pts["observational"] === 3) score += 100;
        if (pts["quantitative"] === 3) score += 30;
        if (pts["theory"] === 1) score += 10;
        if (pts["observational"] === 1) score += 5;
        if (pts["quantitative"] === 1) score += 3;
        if (score > bestScore) {
          bestScore = score;
          bestChoice = choice;
        }
      }

      answers.push({
        questionId: question.id,
        choiceId: bestChoice.id,
      });
    }

    const scores = getAxisScores(quiz.questions, answers);
    // Verify theory is highest and observational is second
    expect(scores.theory).toBeGreaterThan(scores.observational);

    const result = determineScienceThinkingResult(
      quiz.questions,
      answers,
      quiz.results,
    );
    // Fallback: theory primary -> einstein(creative) vs newton(quantitative)
    // Since we prioritized quantitative, should be newton
    expect(result.id).toBe("newton");
  });

  it("handles another non-mapped axis pair via fallback", () => {
    // Build answers: empirical highest, quantitative second, observational third
    // Fallback: empirical primary -> curie(observational) vs faraday(creative)
    // Since we prioritize observational third, should be curie
    const answers: QuizAnswer[] = [];

    for (const question of quiz.questions) {
      let bestChoice = question.choices[0];
      let bestScore = -1;

      for (const choice of question.choices) {
        const pts = choice.points ?? {};
        let score = 0;
        if (pts["empirical"] === 3) score += 1000;
        if (pts["quantitative"] === 3) score += 100;
        if (pts["observational"] === 3) score += 30;
        if (pts["empirical"] === 1) score += 10;
        if (pts["quantitative"] === 1) score += 5;
        if (pts["observational"] === 1) score += 3;
        if (score > bestScore) {
          bestScore = score;
          bestChoice = choice;
        }
      }

      answers.push({
        questionId: question.id,
        choiceId: bestChoice.id,
      });
    }

    const scores = getAxisScores(quiz.questions, answers);
    expect(scores.empirical).toBeGreaterThan(scores.quantitative);

    const result = determineScienceThinkingResult(
      quiz.questions,
      answers,
      quiz.results,
    );
    // Fallback compares observational vs creative scores
    // Since we prioritized observational, should be curie
    expect(result.id).toBe("curie");
  });
});

describe("getAxisScores", () => {
  const quiz = scienceThinkingQuiz;

  it("returns zero scores for empty answers", () => {
    const scores = getAxisScores(quiz.questions, []);
    for (const axis of AXIS_IDS) {
      expect(scores[axis]).toBe(0);
    }
  });

  it("returns correct scores for a single answer", () => {
    const answers: QuizAnswer[] = [{ questionId: "q1", choiceId: "q1-a" }];
    const scores = getAxisScores(quiz.questions, answers);
    expect(scores.theory).toBe(3);
    expect(scores.observational).toBe(1);
    expect(scores.empirical).toBe(0);
    expect(scores.quantitative).toBe(0);
    expect(scores.creative).toBe(0);
  });

  it("accumulates scores across multiple answers", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "q1-a" }, // theory:3, observational:1
      { questionId: "q2", choiceId: "q2-b" }, // theory:3, quantitative:1
    ];
    const scores = getAxisScores(quiz.questions, answers);
    expect(scores.theory).toBe(6);
    expect(scores.observational).toBe(1);
    expect(scores.quantitative).toBe(1);
  });
});
