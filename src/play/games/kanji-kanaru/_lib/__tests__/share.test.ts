import { describe, test, expect } from "vitest";
import { generateShareText } from "../share";
import type { GameState, KanjiEntry } from "../types";

const targetKanji: KanjiEntry = {
  character: "\u5C71",
  radical: "\u5C71",
  radicalGroup: 46,
  strokeCount: 3,
  grade: 1,
  onYomi: ["\u30B5\u30F3"],
  kunYomi: ["\u3084\u307E"],
  meanings: ["mountain"],
  examples: ["\u5C71\u8108"],
};

describe("generateShareText", () => {
  test("generates correct text for a won game with difficulty label", () => {
    const state: GameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 1,
      targetKanji,
      guesses: [
        {
          guess: "\u5DDD",
          radical: "wrong",
          strokeCount: "correct",
          grade: "correct",
          gradeDirection: "equal",
          onYomi: "correct",
          category: "close",
          kunYomiCount: "correct",
        },
        {
          guess: "\u5C71",
          radical: "correct",
          strokeCount: "correct",
          grade: "correct",
          gradeDirection: "equal",
          onYomi: "correct",
          category: "correct",
          kunYomiCount: "correct",
        },
      ],
      status: "won",
    };

    const text = generateShareText(state, "intermediate");
    expect(text).toContain(
      "\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #1 (\u4E2D\u7D1A) 2/6",
    );
    // 1行目: 不一致・一致・一致・一致・近い・一致
    expect(text).toContain("×◯◯◯△◯");
    // 2行目: 6つとも一致
    expect(text).toContain("◯◯◯◯◯◯");
    expect(text.split("\n").at(-1)).toBe(
      "#\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #yolosnet",
    );
    expect(text).not.toContain("http");
  });

  test("generates correct text for a lost game", () => {
    const guesses = Array.from({ length: 6 }, () => ({
      guess: "\u5DDD",
      radical: "wrong" as const,
      strokeCount: "wrong" as const,
      grade: "wrong" as const,
      gradeDirection: "up" as const,
      onYomi: "wrong" as const,
      category: "wrong" as const,
      kunYomiCount: "wrong" as const,
    }));

    const state: GameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 42,
      targetKanji,
      guesses,
      status: "lost",
    };

    const text = generateShareText(state, "advanced");
    expect(text).toContain(
      "\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #42 (\u4E0A\u7D1A) X/6",
    );
    // どの行も6つとも不一致
    const allWrongRow = "××××××";
    const lines = text.split("\n");
    for (let i = 1; i <= 6; i++) {
      expect(lines[i]).toBe(allWrongRow);
    }
    expect(text).toContain("#\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #yolosnet");
  });

  test("gradeDirection is NOT included in the mark rows", () => {
    const state: GameState = {
      puzzleDate: "2026-03-15",
      puzzleNumber: 15,
      targetKanji,
      guesses: [
        {
          guess: "\u5C71",
          radical: "correct",
          strokeCount: "correct",
          grade: "correct",
          gradeDirection: "up",
          onYomi: "correct",
          category: "correct",
          kunYomiCount: "correct",
        },
      ],
      status: "won",
    };

    const text = generateShareText(state, "beginner");
    // 1行は6つの印（学年の向きの7つ目を持たない）
    const markRow = text.split("\n")[1];
    expect(markRow).toBe("◯◯◯◯◯◯");
  });

  test("kunYomiCount column IS included in the mark rows", () => {
    const state: GameState = {
      puzzleDate: "2026-03-15",
      puzzleNumber: 15,
      targetKanji,
      guesses: [
        {
          guess: "\u5C71",
          radical: "correct",
          strokeCount: "correct",
          grade: "correct",
          gradeDirection: "equal",
          onYomi: "correct",
          category: "correct",
          kunYomiCount: "wrong",
        },
      ],
      status: "won",
    };

    const text = generateShareText(state, "intermediate");
    const markRow = text.split("\n")[1];
    expect(markRow).toBe("◯◯◯◯◯×");
  });

  test("has no emoji", () => {
    const state: GameState = {
      puzzleDate: "2026-03-15",
      puzzleNumber: 15,
      targetKanji,
      guesses: [
        {
          guess: "\u5C71",
          radical: "close",
          strokeCount: "wrong",
          grade: "correct",
          gradeDirection: "equal",
          onYomi: "correct",
          category: "close",
          kunYomiCount: "wrong",
        },
      ],
      status: "won",
    };
    expect(generateShareText(state)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  test("includes puzzle number and difficulty in header", () => {
    const state: GameState = {
      puzzleDate: "2026-03-15",
      puzzleNumber: 15,
      targetKanji,
      guesses: [
        {
          guess: "\u5C71",
          radical: "correct",
          strokeCount: "correct",
          grade: "correct",
          gradeDirection: "equal",
          onYomi: "correct",
          category: "correct",
          kunYomiCount: "correct",
        },
      ],
      status: "won",
    };

    const text = generateShareText(state, "beginner");
    expect(text).toContain(
      "\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #15 (\u521D\u7D1A) 1/6",
    );
  });

  test("defaults to intermediate when no difficulty specified", () => {
    const state: GameState = {
      puzzleDate: "2026-03-15",
      puzzleNumber: 15,
      targetKanji,
      guesses: [
        {
          guess: "\u5C71",
          radical: "correct",
          strokeCount: "correct",
          grade: "correct",
          gradeDirection: "equal",
          onYomi: "correct",
          category: "correct",
          kunYomiCount: "correct",
        },
      ],
      status: "won",
    };

    const text = generateShareText(state);
    expect(text).toContain("(\u4E2D\u7D1A)");
  });
});
