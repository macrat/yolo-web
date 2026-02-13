import { describe, test, expect } from "vitest";
import { formatDateJST, getPuzzleNumber, getTodaysPuzzle } from "../daily";
import type { KanjiEntry, PuzzleScheduleEntry } from "../types";

const sampleKanji: KanjiEntry[] = [
  {
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
  },
  {
    character: "川",
    radical: "川",
    radicalGroup: 47,
    strokeCount: 3,
    grade: 1,
    onYomi: ["セン"],
    kunYomi: ["かわ"],
    meanings: ["river"],
    category: "water",
    examples: ["河川"],
  },
  {
    character: "日",
    radical: "日",
    radicalGroup: 72,
    strokeCount: 4,
    grade: 1,
    onYomi: ["ニチ"],
    kunYomi: ["ひ"],
    meanings: ["day"],
    category: "time",
    examples: ["日本"],
  },
];

const sampleSchedule: PuzzleScheduleEntry[] = [
  { date: "2026-02-14", kanjiIndex: 0 },
  { date: "2026-02-15", kanjiIndex: 1 },
  { date: "2026-02-16", kanjiIndex: 2 },
];

describe("formatDateJST", () => {
  test("formats a date in YYYY-MM-DD format", () => {
    // 2026-02-14 00:00 UTC is 2026-02-14 09:00 JST
    const date = new Date("2026-02-14T00:00:00Z");
    const result = formatDateJST(date);
    expect(result).toBe("2026-02-14");
  });

  test("handles JST timezone boundary (late UTC = next day in JST)", () => {
    // 2026-02-13 15:00 UTC = 2026-02-14 00:00 JST
    const date = new Date("2026-02-13T15:00:00Z");
    const result = formatDateJST(date);
    expect(result).toBe("2026-02-14");
  });

  test("handles JST timezone boundary (early UTC = same day in JST)", () => {
    // 2026-02-14 14:59 UTC = 2026-02-14 23:59 JST
    const date = new Date("2026-02-14T14:59:00Z");
    const result = formatDateJST(date);
    expect(result).toBe("2026-02-14");
  });
});

describe("getPuzzleNumber", () => {
  test("returns 1 for epoch date (2026-02-14)", () => {
    // Use a time well within JST day for 2026-02-14
    const date = new Date("2026-02-14T03:00:00Z"); // 12:00 JST
    expect(getPuzzleNumber(date)).toBe(1);
  });

  test("returns 2 for the day after epoch", () => {
    const date = new Date("2026-02-15T03:00:00Z"); // 12:00 JST
    expect(getPuzzleNumber(date)).toBe(2);
  });

  test("returns 0 for the day before epoch", () => {
    const date = new Date("2026-02-13T03:00:00Z"); // 12:00 JST
    expect(getPuzzleNumber(date)).toBe(0);
  });

  test("returns correct number for a date well after epoch", () => {
    const date = new Date("2026-03-16T03:00:00Z"); // 12:00 JST
    // 2026-02-14 to 2026-03-16 = 30 days difference, puzzle #31
    expect(getPuzzleNumber(date)).toBe(31);
  });
});

describe("getTodaysPuzzle", () => {
  test("returns scheduled kanji for a matching date", () => {
    const date = new Date("2026-02-14T03:00:00Z");
    const result = getTodaysPuzzle(sampleKanji, sampleSchedule, date);
    expect(result.kanji.character).toBe("山");
    expect(result.puzzleNumber).toBe(1);
  });

  test("returns different kanji for different scheduled dates", () => {
    const date = new Date("2026-02-15T03:00:00Z");
    const result = getTodaysPuzzle(sampleKanji, sampleSchedule, date);
    expect(result.kanji.character).toBe("川");
    expect(result.puzzleNumber).toBe(2);
  });

  test("falls back to hash when date is not in schedule", () => {
    const date = new Date("2026-03-17T03:00:00Z");
    const result = getTodaysPuzzle(sampleKanji, sampleSchedule, date);
    // Should return a valid kanji (from the dataset)
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
