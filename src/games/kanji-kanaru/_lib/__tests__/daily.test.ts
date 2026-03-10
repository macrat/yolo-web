import { describe, test, expect } from "vitest";
import { formatDateJST, getPuzzleNumber, getTodaysPuzzle } from "../daily";
import type { KanjiEntry, PuzzleScheduleEntry } from "../types";

const sampleKanji: KanjiEntry[] = [
  {
    character: "\u5C71",
    radical: "\u5C71",
    radicalGroup: 46,
    strokeCount: 3,
    grade: 1,
    onYomi: ["\u30B5\u30F3"],
    kunYomi: ["\u3084\u307E"],
    meanings: ["mountain"],
    category: 6,
    examples: ["\u5C71\u8108"],
  },
  {
    character: "\u5DDD",
    radical: "\u5DDD",
    radicalGroup: 47,
    strokeCount: 3,
    grade: 1,
    onYomi: ["\u30BB\u30F3"],
    kunYomi: ["\u304B\u308F"],
    meanings: ["river"],
    category: 6,
    examples: ["\u6CB3\u5DDD"],
  },
  {
    character: "\u65E5",
    radical: "\u65E5",
    radicalGroup: 72,
    strokeCount: 4,
    grade: 1,
    onYomi: ["\u30CB\u30C1"],
    kunYomi: ["\u3072"],
    meanings: ["day"],
    category: 8,
    examples: ["\u65E5\u672C"],
  },
];

const sampleSchedule: PuzzleScheduleEntry[] = [
  { date: "2026-02-14", kanjiIndex: 0 },
  { date: "2026-02-15", kanjiIndex: 1 },
  { date: "2026-02-16", kanjiIndex: 2 },
];

describe("formatDateJST", () => {
  test("formats a date in YYYY-MM-DD format", () => {
    const date = new Date("2026-02-14T00:00:00Z");
    const result = formatDateJST(date);
    expect(result).toBe("2026-02-14");
  });

  test("handles JST timezone boundary (late UTC = next day in JST)", () => {
    const date = new Date("2026-02-13T15:00:00Z");
    const result = formatDateJST(date);
    expect(result).toBe("2026-02-14");
  });

  test("handles JST timezone boundary (early UTC = same day in JST)", () => {
    const date = new Date("2026-02-14T14:59:00Z");
    const result = formatDateJST(date);
    expect(result).toBe("2026-02-14");
  });
});

describe("getPuzzleNumber", () => {
  test("returns 1 for epoch date (2026-02-14)", () => {
    const date = new Date("2026-02-14T03:00:00Z");
    expect(getPuzzleNumber(date)).toBe(1);
  });

  test("returns 2 for the day after epoch", () => {
    const date = new Date("2026-02-15T03:00:00Z");
    expect(getPuzzleNumber(date)).toBe(2);
  });

  test("returns 0 for the day before epoch", () => {
    const date = new Date("2026-02-13T03:00:00Z");
    expect(getPuzzleNumber(date)).toBe(0);
  });

  test("returns correct number for a date well after epoch", () => {
    const date = new Date("2026-03-16T03:00:00Z");
    expect(getPuzzleNumber(date)).toBe(31);
  });
});

describe("getTodaysPuzzle", () => {
  test("returns scheduled kanji for a matching date", () => {
    const date = new Date("2026-02-14T03:00:00Z");
    const result = getTodaysPuzzle(sampleKanji, sampleSchedule, date);
    expect(result.kanji.character).toBe("\u5C71");
    expect(result.puzzleNumber).toBe(1);
  });

  test("returns different kanji for different scheduled dates", () => {
    const date = new Date("2026-02-15T03:00:00Z");
    const result = getTodaysPuzzle(sampleKanji, sampleSchedule, date);
    expect(result.kanji.character).toBe("\u5DDD");
    expect(result.puzzleNumber).toBe(2);
  });

  test("falls back to hash when date is not in schedule", () => {
    const date = new Date("2026-03-17T03:00:00Z");
    const result = getTodaysPuzzle(sampleKanji, sampleSchedule, date);
    expect(sampleKanji.map((k) => k.character)).toContain(
      result.kanji.character,
    );
    expect(result.puzzleNumber).toBe(32);
  });

  test("fallback is deterministic for the same date", () => {
    const date = new Date("2027-01-01T03:00:00Z");
    const result1 = getTodaysPuzzle(sampleKanji, sampleSchedule, date);
    const result2 = getTodaysPuzzle(sampleKanji, sampleSchedule, date);
    expect(result1.kanji.character).toBe(result2.kanji.character);
    expect(result1.puzzleNumber).toBe(result2.puzzleNumber);
  });
});
