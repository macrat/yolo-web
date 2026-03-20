import { describe, test, expect, vi, beforeEach } from "vitest";
import { generateShareText } from "../share";
import { generateTwitterShareUrl } from "../../../shared/_lib/share";
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

beforeEach(() => {
  vi.stubGlobal("window", {
    location: { origin: "https://example.com" },
  });
});

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
    // Row 1: wrong, correct, correct, correct, close, correct (6 columns)
    expect(text).toContain(
      "\u2B1C\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E8}\u{1F7E9}",
    );
    // Row 2: all correct (6 columns)
    expect(text).toContain(
      "\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}",
    );
    expect(text).toContain("#\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #yolosnet");
    expect(text).toContain("https://example.com/play/kanji-kanaru");
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
    // Each row should be all wrong (6 white squares)
    const allWrongRow = "\u2B1C\u2B1C\u2B1C\u2B1C\u2B1C\u2B1C";
    const lines = text.split("\n");
    for (let i = 1; i <= 6; i++) {
      expect(lines[i]).toBe(allWrongRow);
    }
    expect(text).toContain("#\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #yolosnet");
  });

  test("gradeDirection is NOT included in emoji grid", () => {
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
    // Should have exactly 6 emojis per row (not 7)
    const lines = text.split("\n");
    // Line 1 is the row of emojis for the single guess
    const emojiRow = lines[1];
    // Count emoji characters (each is 2 code units for colored squares, or surrogate pairs)
    // 6 green squares
    expect(emojiRow).toBe(
      "\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}",
    );
  });

  test("kunYomiCount column IS included in emoji grid", () => {
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
    const lines = text.split("\n");
    const emojiRow = lines[1];
    // 5 correct (green) + 1 wrong (white) = 6 emojis
    expect(emojiRow).toBe(
      "\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u2B1C",
    );
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

describe("generateTwitterShareUrl", () => {
  test("generates correct Twitter intent URL without pageUrl", () => {
    const text = "Test share text";
    const url = generateTwitterShareUrl(text);
    expect(url).toBe(
      "https://twitter.com/intent/tweet?text=Test%20share%20text",
    );
  });

  test("separates text and url when pageUrl is provided", () => {
    const pageUrl = "https://example.com/play/kanji-kanaru";
    const text = `\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #1 (\u4E2D\u7D1A) 2/6\n\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\n${pageUrl}`;
    const url = generateTwitterShareUrl(text, pageUrl);
    expect(url).toContain(
      `text=${encodeURIComponent("\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #1 (\u4E2D\u7D1A) 2/6\n\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}")}`,
    );
    expect(url).toContain(`&url=${encodeURIComponent(pageUrl)}`);
  });
});
