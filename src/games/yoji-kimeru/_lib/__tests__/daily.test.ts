import { describe, test, expect } from "vitest";
import {
  formatDateJST,
  getPuzzleNumber,
  getTodaysPuzzle,
  filterByDifficulty,
} from "../daily";
import type { YojiEntry, YojiPuzzleScheduleEntry } from "../types";

const sampleYoji: YojiEntry[] = [
  {
    yoji: "一期一会",
    reading: "いちごいちえ",
    meaning: "一生に一度の出会いを大切にすること",
    difficulty: 1,
    category: "life",
    origin: "中国",
    structure: "組合せ",
    sourceUrl: "",
  },
  {
    yoji: "花鳥風月",
    reading: "かちょうふうげつ",
    meaning: "自然の美しい風景",
    difficulty: 1,
    category: "nature",
    origin: "日本",
    structure: "組合せ",
    sourceUrl: "",
  },
  {
    yoji: "切磋琢磨",
    reading: "せっさたくま",
    meaning: "互いに競い合い高め合うこと",
    difficulty: 2,
    category: "effort",
    origin: "中国",
    structure: "対句",
    sourceUrl: "",
  },
  {
    yoji: "韋編三絶",
    reading: "いへんさんぜつ",
    meaning: "熱心に読書すること",
    difficulty: 3,
    category: "knowledge",
    origin: "中国",
    structure: "組合せ",
    sourceUrl: "",
  },
];

const sampleSchedule: YojiPuzzleScheduleEntry[] = [
  { date: "2026-02-14", yojiIndex: 0 },
  { date: "2026-02-15", yojiIndex: 1 },
  { date: "2026-02-16", yojiIndex: 2 },
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

describe("filterByDifficulty", () => {
  test("beginner returns only difficulty 1", () => {
    const filtered = filterByDifficulty(sampleYoji, "beginner");
    expect(filtered).toHaveLength(2);
    expect(filtered.every((y) => y.difficulty === 1)).toBe(true);
  });

  test("intermediate returns difficulty 1 and 2", () => {
    const filtered = filterByDifficulty(sampleYoji, "intermediate");
    expect(filtered).toHaveLength(3);
    expect(filtered.every((y) => y.difficulty <= 2)).toBe(true);
  });

  test("advanced returns all entries", () => {
    const filtered = filterByDifficulty(sampleYoji, "advanced");
    expect(filtered).toHaveLength(4);
  });
});

describe("getTodaysPuzzle", () => {
  test("returns scheduled yoji for a matching date (intermediate)", () => {
    const date = new Date("2026-02-14T03:00:00Z");
    // Intermediate pool: indices 0,1,2 (difficulty 1,1,2)
    const result = getTodaysPuzzle(
      sampleYoji,
      sampleSchedule,
      "intermediate",
      date,
    );
    expect(result.yoji.yoji).toBe("一期一会");
    expect(result.puzzleNumber).toBe(1);
  });

  test("returns different yoji for different scheduled dates", () => {
    const date = new Date("2026-02-15T03:00:00Z");
    const result = getTodaysPuzzle(
      sampleYoji,
      sampleSchedule,
      "intermediate",
      date,
    );
    expect(result.yoji.yoji).toBe("花鳥風月");
    expect(result.puzzleNumber).toBe(2);
  });

  test("falls back to hash when date is not in schedule", () => {
    const date = new Date("2026-03-17T03:00:00Z");
    const result = getTodaysPuzzle(
      sampleYoji,
      sampleSchedule,
      "intermediate",
      date,
    );
    const intermediatePool = sampleYoji.filter((y) => y.difficulty <= 2);
    expect(intermediatePool.map((y) => y.yoji)).toContain(result.yoji.yoji);
    expect(result.puzzleNumber).toBe(32);
  });

  test("fallback is deterministic for the same date", () => {
    const date = new Date("2027-01-01T03:00:00Z");
    const result1 = getTodaysPuzzle(
      sampleYoji,
      sampleSchedule,
      "advanced",
      date,
    );
    const result2 = getTodaysPuzzle(
      sampleYoji,
      sampleSchedule,
      "advanced",
      date,
    );
    expect(result1.yoji.yoji).toBe(result2.yoji.yoji);
    expect(result1.puzzleNumber).toBe(result2.puzzleNumber);
  });

  test("beginner pool only includes difficulty 1", () => {
    const date = new Date("2026-02-16T03:00:00Z");
    // Schedule entry at index 2 => beginner pool only has 2 items (indices 0,1)
    // So index 2 is out of range, falls back to hash
    const result = getTodaysPuzzle(
      sampleYoji,
      sampleSchedule,
      "beginner",
      date,
    );
    expect(result.yoji.difficulty).toBe(1);
  });
});
