import { describe, it, expect } from "vitest";
import {
  calculateKnowledgeScore,
  calculatePersonalityPoints,
  determineResult,
  isCorrectChoice,
} from "../scoring";
import type { QuizQuestion, QuizAnswer, QuizDefinition } from "../types";

const knowledgeQuestions: QuizQuestion[] = [
  {
    id: "q1",
    text: "Q1",
    choices: [
      { id: "a", text: "A", isCorrect: true },
      { id: "b", text: "B" },
    ],
  },
  {
    id: "q2",
    text: "Q2",
    choices: [
      { id: "a", text: "A" },
      { id: "b", text: "B", isCorrect: true },
    ],
  },
  {
    id: "q3",
    text: "Q3",
    choices: [
      { id: "a", text: "A", isCorrect: true },
      { id: "b", text: "B" },
    ],
  },
];

const personalityQuestions: QuizQuestion[] = [
  {
    id: "q1",
    text: "Q1",
    choices: [
      { id: "a", text: "A", points: { red: 2, blue: 1 } },
      { id: "b", text: "B", points: { blue: 2, green: 1 } },
    ],
  },
  {
    id: "q2",
    text: "Q2",
    choices: [
      { id: "a", text: "A", points: { red: 1, green: 2 } },
      { id: "b", text: "B", points: { blue: 1 } },
    ],
  },
];

describe("calculateKnowledgeScore", () => {
  it("counts all correct answers", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" },
      { questionId: "q2", choiceId: "b" },
      { questionId: "q3", choiceId: "a" },
    ];
    expect(calculateKnowledgeScore(knowledgeQuestions, answers)).toBe(3);
  });

  it("counts partial correct answers", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" },
      { questionId: "q2", choiceId: "a" }, // wrong
      { questionId: "q3", choiceId: "b" }, // wrong
    ];
    expect(calculateKnowledgeScore(knowledgeQuestions, answers)).toBe(1);
  });

  it("returns 0 for all wrong answers", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "b" },
      { questionId: "q2", choiceId: "a" },
      { questionId: "q3", choiceId: "b" },
    ];
    expect(calculateKnowledgeScore(knowledgeQuestions, answers)).toBe(0);
  });

  it("returns 0 for empty answers", () => {
    expect(calculateKnowledgeScore(knowledgeQuestions, [])).toBe(0);
  });

  it("ignores answers for non-existent questions", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" },
      { questionId: "q99", choiceId: "a" },
    ];
    expect(calculateKnowledgeScore(knowledgeQuestions, answers)).toBe(1);
  });
});

describe("calculatePersonalityPoints", () => {
  it("accumulates points correctly", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" }, // red:2, blue:1
      { questionId: "q2", choiceId: "a" }, // red:1, green:2
    ];
    const points = calculatePersonalityPoints(personalityQuestions, answers);
    expect(points).toEqual({ red: 3, blue: 1, green: 2 });
  });

  it("returns empty object for no answers", () => {
    expect(calculatePersonalityPoints(personalityQuestions, [])).toEqual({});
  });
});

describe("determineResult", () => {
  const knowledgeQuiz: QuizDefinition = {
    meta: {
      slug: "test",
      title: "Test",
      description: "Test quiz",
      shortDescription: "Test",
      type: "knowledge",
      questionCount: 3,
      icon: "T",
      accentColor: "#000",
      keywords: [],
      publishedAt: "2026-01-01",
    },
    questions: knowledgeQuestions,
    results: [
      { id: "low", title: "Low", description: "Low score", minScore: 0 },
      { id: "mid", title: "Mid", description: "Mid score", minScore: 2 },
      { id: "high", title: "High", description: "High score", minScore: 3 },
    ],
  };

  it("returns correct result for knowledge quiz based on score", () => {
    // All correct -> 3 -> "high"
    const allCorrect: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" },
      { questionId: "q2", choiceId: "b" },
      { questionId: "q3", choiceId: "a" },
    ];
    expect(determineResult(knowledgeQuiz, allCorrect).id).toBe("high");
  });

  it("returns mid result for 2 correct", () => {
    const twoCorrect: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" },
      { questionId: "q2", choiceId: "b" },
      { questionId: "q3", choiceId: "b" },
    ];
    expect(determineResult(knowledgeQuiz, twoCorrect).id).toBe("mid");
  });

  it("returns low result for 0 correct", () => {
    const noneCorrect: QuizAnswer[] = [
      { questionId: "q1", choiceId: "b" },
      { questionId: "q2", choiceId: "a" },
      { questionId: "q3", choiceId: "b" },
    ];
    expect(determineResult(knowledgeQuiz, noneCorrect).id).toBe("low");
  });

  const personalityQuiz: QuizDefinition = {
    meta: {
      slug: "test-p",
      title: "Test P",
      description: "Test personality quiz",
      shortDescription: "Test",
      type: "personality",
      questionCount: 2,
      icon: "P",
      accentColor: "#000",
      keywords: [],
      publishedAt: "2026-01-01",
    },
    questions: personalityQuestions,
    results: [
      { id: "red", title: "Red", description: "Red type" },
      { id: "blue", title: "Blue", description: "Blue type" },
      { id: "green", title: "Green", description: "Green type" },
    ],
  };

  it("returns result with highest points for personality quiz", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" }, // red:2, blue:1
      { questionId: "q2", choiceId: "a" }, // red:1, green:2
    ];
    // red:3, blue:1, green:2 -> red wins
    expect(determineResult(personalityQuiz, answers).id).toBe("red");
  });

  it("returns blue when blue has most points", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "b" }, // blue:2, green:1
      { questionId: "q2", choiceId: "b" }, // blue:1
    ];
    // blue:3, green:1 -> blue wins
    expect(determineResult(personalityQuiz, answers).id).toBe("blue");
  });
});

describe("isCorrectChoice", () => {
  it("returns true for correct choice", () => {
    expect(isCorrectChoice(knowledgeQuestions[0], "a")).toBe(true);
  });

  it("returns false for incorrect choice", () => {
    expect(isCorrectChoice(knowledgeQuestions[0], "b")).toBe(false);
  });

  it("returns false for non-existent choice", () => {
    expect(isCorrectChoice(knowledgeQuestions[0], "z")).toBe(false);
  });
});
