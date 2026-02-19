import { describe, expect, test } from "vitest";
import { generateShareText, generateTwitterShareUrl } from "../share";
import type { IrodoriGameState } from "../types";

const mockGameState: IrodoriGameState = {
  puzzleDate: "2026-02-20",
  puzzleNumber: 1,
  rounds: [
    {
      target: { h: 0, s: 100, l: 50, hex: "#ff0000" },
      answer: { h: 5, s: 95, l: 48 },
      deltaE: 3,
      score: 94,
    },
    {
      target: { h: 120, s: 80, l: 40, hex: "#1a8c1a" },
      answer: { h: 115, s: 75, l: 42 },
      deltaE: 5,
      score: 90,
    },
    {
      target: { h: 240, s: 60, l: 60, hex: "#6666cc" },
      answer: { h: 230, s: 50, l: 55 },
      deltaE: 12,
      score: 76,
    },
    {
      target: { h: 60, s: 90, l: 50, hex: "#f2e60d" },
      answer: { h: 55, s: 80, l: 45 },
      deltaE: 20,
      score: 60,
    },
    {
      target: { h: 300, s: 70, l: 45, hex: "#c422c4" },
      answer: { h: 280, s: 50, l: 35 },
      deltaE: 30,
      score: 40,
    },
  ],
  currentRound: 5,
  status: "completed",
  initialSliderValues: [],
};

describe("generateShareText", () => {
  test("includes puzzle number", () => {
    const text = generateShareText(mockGameState);
    expect(text).toContain("#1");
  });

  test("includes score", () => {
    const text = generateShareText(mockGameState);
    expect(text).toContain("/100");
  });

  test("includes rank", () => {
    const text = generateShareText(mockGameState);
    expect(text).toContain("\u30E9\u30F3\u30AF");
  });

  test("includes URL path", () => {
    const text = generateShareText(mockGameState);
    expect(text).toContain("/games/irodori");
  });

  test("includes emoji row", () => {
    const text = generateShareText(mockGameState);
    // Should contain color emoji blocks
    expect(text).toMatch(/[\u{1F7E5}\u{1F7E7}\u{1F7E8}\u{1F7E9}]/u);
  });
});

describe("generateTwitterShareUrl", () => {
  test("generates valid URL with encoded text", () => {
    const url = generateTwitterShareUrl("Hello World");
    expect(url).toBe("https://twitter.com/intent/tweet?text=Hello%20World");
  });
});
