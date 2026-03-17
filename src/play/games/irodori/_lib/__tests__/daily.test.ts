import { describe, expect, test } from "vitest";
import {
  formatDateJST,
  getPuzzleNumber,
  simpleHash,
  getTodaysPuzzle,
  getInitialSliderValues,
  ROUNDS_PER_GAME,
} from "../daily";
import type { IrodoriScheduleEntry } from "../types";

// Minimal traditional color for testing
const mockColors = Array.from({ length: 10 }, (_, i) => ({
  slug: `color-${i}`,
  name: `Color ${i}`,
  romaji: `color${i}`,
  hex: `#${i.toString().padStart(6, "0")}`,
  rgb: [i * 25, i * 25, i * 25] as [number, number, number],
  hsl: [i * 36, 50, 50] as [number, number, number],
  category: "test",
}));

describe("formatDateJST", () => {
  test("formats date as YYYY-MM-DD", () => {
    // Use a known UTC date; in JST it's +9 hours
    const date = new Date("2026-02-20T00:00:00Z");
    const formatted = formatDateJST(date);
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("getPuzzleNumber", () => {
  test("epoch date is puzzle #1", () => {
    const date = new Date("2026-02-20T10:00:00+09:00");
    expect(getPuzzleNumber(date)).toBe(1);
  });

  test("day after epoch is puzzle #2", () => {
    const date = new Date("2026-02-21T10:00:00+09:00");
    expect(getPuzzleNumber(date)).toBe(2);
  });
});

describe("simpleHash", () => {
  test("returns consistent results for same input", () => {
    const h1 = simpleHash("test");
    const h2 = simpleHash("test");
    expect(h1).toBe(h2);
  });

  test("returns different results for different inputs", () => {
    const h1 = simpleHash("test1");
    const h2 = simpleHash("test2");
    expect(h1).not.toBe(h2);
  });

  test("returns non-negative number", () => {
    expect(simpleHash("any-string")).toBeGreaterThanOrEqual(0);
  });
});

describe("getTodaysPuzzle", () => {
  test("returns puzzle with correct number of colors", () => {
    const schedule: IrodoriScheduleEntry[] = [
      {
        date: "2026-02-20",
        colorIndices: [0, 1, 2, -1, -2],
      },
    ];
    const result = getTodaysPuzzle(
      mockColors,
      schedule,
      new Date("2026-02-20T10:00:00+09:00"),
    );
    expect(result.colors).toHaveLength(5);
    expect(result.puzzleNumber).toBe(1);
  });

  test("traditional colors have name and slug", () => {
    const schedule: IrodoriScheduleEntry[] = [
      {
        date: "2026-02-20",
        colorIndices: [0, 1, 2, -1, -2],
      },
    ];
    const result = getTodaysPuzzle(
      mockColors,
      schedule,
      new Date("2026-02-20T10:00:00+09:00"),
    );
    // First 3 should be traditional colors
    expect(result.colors[0].name).toBe("Color 0");
    expect(result.colors[0].slug).toBe("color-0");
    // Last 2 should be random (no name)
    expect(result.colors[3].name).toBeUndefined();
    expect(result.colors[4].name).toBeUndefined();
  });

  test("falls back to hash when no schedule entry", () => {
    const result = getTodaysPuzzle(
      mockColors,
      [],
      new Date("2099-01-01T10:00:00+09:00"),
    );
    expect(result.colors).toHaveLength(ROUNDS_PER_GAME);
  });
});

describe("getInitialSliderValues", () => {
  test("returns correct number of values", () => {
    const values = getInitialSliderValues("2026-02-20", 5);
    expect(values).toHaveLength(5);
  });

  test("values are within valid ranges", () => {
    const values = getInitialSliderValues("2026-02-20", 5);
    for (const v of values) {
      expect(v.h).toBeGreaterThanOrEqual(0);
      expect(v.h).toBeLessThan(360);
      expect(v.s).toBeGreaterThanOrEqual(0);
      expect(v.s).toBeLessThanOrEqual(100);
      expect(v.l).toBeGreaterThanOrEqual(0);
      expect(v.l).toBeLessThanOrEqual(100);
    }
  });

  test("same date produces same values", () => {
    const v1 = getInitialSliderValues("2026-02-20", 5);
    const v2 = getInitialSliderValues("2026-02-20", 5);
    expect(v1).toEqual(v2);
  });

  test("different dates produce different values", () => {
    const v1 = getInitialSliderValues("2026-02-20", 5);
    const v2 = getInitialSliderValues("2026-02-21", 5);
    expect(v1).not.toEqual(v2);
  });
});
