import { describe, test, expect, vi, beforeEach } from "vitest";
import { generateShareText, generateTwitterShareUrl } from "../share";
import type { YojiGameState, YojiEntry } from "../types";

const targetYoji: YojiEntry = {
  yoji: "一期一会",
  reading: "いちごいちえ",
  meaning: "一生に一度の出会いを大切にすること",
  difficulty: 1,
  category: "life",
};

beforeEach(() => {
  // Mock window.location.origin
  vi.stubGlobal("window", {
    location: { origin: "https://example.com" },
  });
});

describe("generateShareText", () => {
  test("generates correct text for a won game", () => {
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

    const text = generateShareText(state);
    expect(text).toContain(
      "\u56DB\u5B57\u30AD\u30E1\u30EB #1 2/6",
    );
    // Row 1: all absent (4 white squares)
    expect(text).toContain("\u2B1C\u2B1C\u2B1C\u2B1C");
    // Row 2: all correct (4 green squares)
    expect(text).toContain(
      "\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}",
    );
    expect(text).toContain("https://example.com/games/yoji-kimeru");
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

    const text = generateShareText(state);
    expect(text).toContain(
      "\u56DB\u5B57\u30AD\u30E1\u30EB #42 X/6",
    );
    // Each row should be all absent (4 white squares)
    const allAbsentRow = "\u2B1C\u2B1C\u2B1C\u2B1C";
    const lines = text.split("\n");
    // Lines 1-6 (after header) should all be the absent row
    for (let i = 1; i <= 6; i++) {
      expect(lines[i]).toBe(allAbsentRow);
    }
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

    const text = generateShareText(state);
    // correct=green, present=yellow, absent=white, absent=white
    expect(text).toContain(
      "\u{1F7E9}\u{1F7E8}\u2B1C\u2B1C",
    );
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

    const text = generateShareText(state);
    expect(text).toContain(
      "\u56DB\u5B57\u30AD\u30E1\u30EB #15 1/6",
    );
  });
});

describe("generateTwitterShareUrl", () => {
  test("generates correct Twitter intent URL", () => {
    const text = "Test share text";
    const url = generateTwitterShareUrl(text);
    expect(url).toBe(
      "https://twitter.com/intent/tweet?text=Test%20share%20text",
    );
  });

  test("encodes special characters", () => {
    const text =
      "\u56DB\u5B57\u30AD\u30E1\u30EB #1 2/6\nhttps://example.com";
    const url = generateTwitterShareUrl(text);
    expect(url).toContain("https://twitter.com/intent/tweet?text=");
    // Should be properly encoded
    expect(url).toContain(encodeURIComponent(text));
  });
});
