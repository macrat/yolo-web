import { describe, test, expect } from "vitest";
import type {
  YojiGameState,
  YojiGameHistory,
  PuzzleResponse,
  EvaluateResponse,
  YojiEntry,
  YojiGuessFeedback,
} from "../types";

describe("YojiGameState", () => {
  test("allows null for targetYoji (during game)", () => {
    const state: YojiGameState = {
      puzzleDate: "2026-03-20",
      puzzleNumber: 1,
      targetYoji: null,
      guesses: [],
      status: "playing",
    };
    expect(state.targetYoji).toBeNull();
  });

  test("allows YojiEntry for targetYoji (game ended)", () => {
    const entry: YojiEntry = {
      yoji: "一期一会",
      reading: "いちごいちえ",
      meaning: "一生に一度の出会いを大切にすること",
      difficulty: 1,
      category: "life",
      origin: "中国",
      structure: "対句",
      sourceUrl: "https://example.com",
    };
    const state: YojiGameState = {
      puzzleDate: "2026-03-20",
      puzzleNumber: 1,
      targetYoji: entry,
      guesses: [],
      status: "won",
    };
    expect(state.targetYoji).not.toBeNull();
    expect(state.targetYoji?.yoji).toBe("一期一会");
  });
});

describe("PuzzleResponse", () => {
  test("contains expected fields without yoji answer", () => {
    const response: PuzzleResponse = {
      puzzleNumber: 42,
      reading: "いちごいちえ",
      category: "life",
      origin: "中国",
      difficulty: 1,
    };
    expect(response.puzzleNumber).toBe(42);
    expect(response.reading).toBe("いちごいちえ");
    // yoji フィールドが存在しないことを型レベルで確認
    expect("yoji" in response).toBe(false);
  });
});

describe("EvaluateResponse", () => {
  test("contains feedback and isCorrect", () => {
    const feedback: YojiGuessFeedback = {
      guess: "花鳥風月",
      charFeedbacks: ["absent", "absent", "absent", "absent"],
    };
    const response: EvaluateResponse = {
      feedback,
      isCorrect: false,
    };
    expect(response.isCorrect).toBe(false);
    expect(response.targetYoji).toBeUndefined();
  });

  test("contains targetYoji when game is over", () => {
    const feedback: YojiGuessFeedback = {
      guess: "一期一会",
      charFeedbacks: ["correct", "correct", "correct", "correct"],
    };
    const entry: YojiEntry = {
      yoji: "一期一会",
      reading: "いちごいちえ",
      meaning: "一生に一度の出会いを大切にすること",
      difficulty: 1,
      category: "life",
      origin: "中国",
      structure: "対句",
      sourceUrl: "https://example.com",
    };
    const response: EvaluateResponse = {
      feedback,
      isCorrect: true,
      targetYoji: entry,
    };
    expect(response.isCorrect).toBe(true);
    expect(response.targetYoji?.yoji).toBe("一期一会");
  });
});

describe("YojiGameHistory", () => {
  test("allows feedbacks field in history entries", () => {
    const feedback: YojiGuessFeedback = {
      guess: "花鳥風月",
      charFeedbacks: ["absent", "absent", "absent", "absent"],
    };
    const history: YojiGameHistory = {
      "2026-03-20": {
        guesses: ["花鳥風月", "一期一会"],
        feedbacks: [feedback],
        status: "won",
        guessCount: 2,
      },
    };
    expect(history["2026-03-20"]?.feedbacks).toHaveLength(1);
  });

  test("feedbacks field is optional in history entries", () => {
    const history: YojiGameHistory = {
      "2026-03-20": {
        guesses: ["一期一会"],
        status: "won",
        guessCount: 1,
      },
    };
    expect(history["2026-03-20"]?.feedbacks).toBeUndefined();
  });
});
