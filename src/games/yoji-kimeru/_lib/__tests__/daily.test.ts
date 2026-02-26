import { describe, test, expect } from "vitest";
import { formatDateJST, getPuzzleNumber, getTodaysPuzzle } from "../daily";
import type { YojiEntry, YojiPuzzleScheduleEntry } from "../types";

const sampleYoji: YojiEntry[] = [
  {
    yoji: "一期一会",
    reading: "いちごいちえ",
    meaning: "一生に一度の出会いを大切にすること",
    difficulty: 1,
    category: "life",
  },
  {
    yoji: "花鳥風月",
    reading: "かちょうふうげつ",
    meaning: "自然の美しい風景",
    difficulty: 1,
    category: "nature",
  },
  {
    yoji: "切磋琢磨",
    reading: "せっさたくま",
    meaning: "互いに競い合い高め合うこと",
    difficulty: 1,
    category: "effort",
  },
];

const sampleSchedule: YojiPuzzleScheduleEntry[] = [
  { date: "2026-02-14", yojiIndex: 0 },
  { date: "2026-02-15", yojiIndex: 1 },
  { date: "2026-02-16", yojiIndex: 2 },
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
  test("returns scheduled yoji for a matching date", () => {
    const date = new Date("2026-02-14T03:00:00Z");
    const result = getTodaysPuzzle(sampleYoji, sampleSchedule, date);
    expect(result.yoji.yoji).toBe("一期一会");
    expect(result.puzzleNumber).toBe(1);
  });

  test("returns different yoji for different scheduled dates", () => {
    const date = new Date("2026-02-15T03:00:00Z");
    const result = getTodaysPuzzle(sampleYoji, sampleSchedule, date);
    expect(result.yoji.yoji).toBe("花鳥風月");
    expect(result.puzzleNumber).toBe(2);
  });

  test("falls back to hash when date is not in schedule", () => {
    const date = new Date("2026-03-17T03:00:00Z");
    const result = getTodaysPuzzle(sampleYoji, sampleSchedule, date);
    // Should return a valid yoji (from the dataset)
    expect(sampleYoji.map((y) => y.yoji)).toContain(result.yoji.yoji);
    expect(result.puzzleNumber).toBe(32);
  });

  test("fallback is deterministic for the same date", () => {
    const date = new Date("2027-01-01T03:00:00Z");
    const result1 = getTodaysPuzzle(sampleYoji, sampleSchedule, date);
    const result2 = getTodaysPuzzle(sampleYoji, sampleSchedule, date);
    expect(result1.yoji.yoji).toBe(result2.yoji.yoji);
    expect(result1.puzzleNumber).toBe(result2.puzzleNumber);
  });
});
