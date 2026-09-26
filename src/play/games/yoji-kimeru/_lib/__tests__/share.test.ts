import { describe, test, expect } from "vitest";
import { generateShareText } from "../share";
import type { YojiGameState, YojiEntry } from "../types";

const targetYoji: YojiEntry = {
  yoji: "一期一会",
  reading: "いちごいちえ",
  meaning: "一生に一度の出会いを大切にすること",
  difficulty: 1,
  category: "life",
  origin: "中国",
  structure: "組合せ",
  sourceUrl: "",
};

describe("generateShareText", () => {
  test("generates correct text for a won game with difficulty", () => {
    const state: YojiGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 1,
      targetYoji,
      guesses: [
        {
          guess: "花鳥風月",
          charFeedbacks: ["absent", "absent", "absent", "absent"],
        },
        {
          guess: "一期一会",
          charFeedbacks: ["correct", "correct", "correct", "correct"],
        },
      ],
      status: "won",
    };

    const text = generateShareText(state, "intermediate");
    expect(text).toContain(
      "\u56DB\u5B57\u30AD\u30E1\u30EB #1 (\u4E2D\u7D1A) 2/6",
    );
    expect(text).toContain("\u2B1C\u2B1C\u2B1C\u2B1C");
    expect(text).toContain("\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}");
    expect(text.split("\n").at(-1)).toBe(
      "#\u56DB\u5B57\u30AD\u30E1\u30EB #yolosnet",
    );
    expect(text).not.toContain("http");
  });

  test("generates correct text for a lost game", () => {
    const guesses = Array.from({ length: 6 }, () => ({
      guess: "花鳥風月",
      charFeedbacks: ["absent", "absent", "absent", "absent"] as [
        "absent",
        "absent",
        "absent",
        "absent",
      ],
    }));

    const state: YojiGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 42,
      targetYoji,
      guesses,
      status: "lost",
    };

    const text = generateShareText(state, "advanced");
    expect(text).toContain(
      "\u56DB\u5B57\u30AD\u30E1\u30EB #42 (\u4E0A\u7D1A) X/6",
    );
    const allAbsentRow = "\u2B1C\u2B1C\u2B1C\u2B1C";
    const lines = text.split("\n");
    for (let i = 1; i <= 6; i++) {
      expect(lines[i]).toBe(allAbsentRow);
    }
    expect(text).toContain("#\u56DB\u5B57\u30AD\u30E1\u30EB #yolosnet");
  });

  test("includes difficulty label for beginner", () => {
    const state: YojiGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 5,
      targetYoji,
      guesses: [
        {
          guess: "一期一会",
          charFeedbacks: ["correct", "correct", "correct", "correct"],
        },
      ],
      status: "won",
    };

    const text = generateShareText(state, "beginner");
    expect(text).toContain("(\u521D\u7D1A)");
  });

  test("emoji mapping is correct", () => {
    const state: YojiGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 5,
      targetYoji,
      guesses: [
        {
          guess: "一会期花",
          charFeedbacks: ["correct", "present", "absent", "absent"],
        },
      ],
      status: "playing",
    };

    const text = generateShareText(state, "intermediate");
    expect(text).toContain("\u{1F7E9}\u{1F7E8}\u2B1C\u2B1C");
  });

  test("includes puzzle number in header", () => {
    const state: YojiGameState = {
      puzzleDate: "2026-03-15",
      puzzleNumber: 15,
      targetYoji,
      guesses: [
        {
          guess: "一期一会",
          charFeedbacks: ["correct", "correct", "correct", "correct"],
        },
      ],
      status: "won",
    };

    const text = generateShareText(state, "intermediate");
    expect(text).toContain(
      "\u56DB\u5B57\u30AD\u30E1\u30EB #15 (\u4E2D\u7D1A) 1/6",
    );
  });
});
