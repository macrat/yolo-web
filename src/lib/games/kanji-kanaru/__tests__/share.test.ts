import { describe, test, expect, vi, beforeEach } from "vitest";
import { generateShareText, generateTwitterShareUrl } from "../share";
import type { GameState, KanjiEntry } from "../types";

const targetKanji: KanjiEntry = {
  character: "山",
  radical: "山",
  radicalGroup: 46,
  strokeCount: 3,
  grade: 1,
  onYomi: ["サン"],
  kunYomi: ["やま"],
  meanings: ["mountain"],
  category: "nature",
  examples: ["山脈"],
};

beforeEach(() => {
  // Mock window.location.origin
  vi.stubGlobal("window", {
    location: { origin: "https://example.com" },
  });
});

describe("generateShareText", () => {
  test("generates correct text for a won game", () => {
    const state: GameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 1,
      targetKanji,
      guesses: [
        {
          guess: "川",
          radical: "wrong",
          strokeCount: "correct",
          grade: "correct",
          onYomi: "correct",
          category: "close",
        },
        {
          guess: "山",
          radical: "correct",
          strokeCount: "correct",
          grade: "correct",
          onYomi: "correct",
          category: "correct",
        },
      ],
      status: "won",
    };

    const text = generateShareText(state);
    expect(text).toContain("\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #1 2/6");
    // Row 1: wrong, correct, correct, correct, close
    expect(text).toContain("\u2B1C\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E8}");
    // Row 2: all correct
    expect(text).toContain("\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}");
    expect(text).toContain("https://example.com/games/kanji-kanaru");
  });

  test("generates correct text for a lost game", () => {
    const guesses = Array.from({ length: 6 }, () => ({
      guess: "川",
      radical: "wrong" as const,
      strokeCount: "wrong" as const,
      grade: "wrong" as const,
      onYomi: "wrong" as const,
      category: "wrong" as const,
    }));

    const state: GameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 42,
      targetKanji,
      guesses,
      status: "lost",
    };

    const text = generateShareText(state);
    expect(text).toContain("\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #42 X/6");
    // Each row should be all wrong (5 white squares)
    const allWrongRow = "\u2B1C\u2B1C\u2B1C\u2B1C\u2B1C";
    const lines = text.split("\n");
    // Lines 1-6 (after header) should all be the wrong row
    for (let i = 1; i <= 6; i++) {
      expect(lines[i]).toBe(allWrongRow);
    }
  });

  test("includes puzzle number in header", () => {
    const state: GameState = {
      puzzleDate: "2026-03-15",
      puzzleNumber: 15,
      targetKanji,
      guesses: [
        {
          guess: "山",
          radical: "correct",
          strokeCount: "correct",
          grade: "correct",
          onYomi: "correct",
          category: "correct",
        },
      ],
      status: "won",
    };

    const text = generateShareText(state);
    expect(text).toContain("\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #15 1/6");
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
    const pageUrl = "https://example.com/games/kanji-kanaru";
    const text = `\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #1 2/6\n\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\n${pageUrl}`;
    const url = generateTwitterShareUrl(text, pageUrl);
    // text param should not contain the page URL
    expect(url).toContain(
      `text=${encodeURIComponent("\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #1 2/6\n\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}")}`,
    );
    // url param should contain the page URL
    expect(url).toContain(`&url=${encodeURIComponent(pageUrl)}`);
  });

  test("encodes special characters without pageUrl", () => {
    const text =
      "\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #1 2/6\nhttps://example.com";
    const url = generateTwitterShareUrl(text);
    expect(url).toContain("https://twitter.com/intent/tweet?text=");
    // Should be properly encoded
    expect(url).toContain(encodeURIComponent(text));
  });
});
