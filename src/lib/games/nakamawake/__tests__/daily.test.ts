import { describe, test, expect } from "vitest";
import { formatDateJST, getPuzzleNumber, getTodaysPuzzle } from "../daily";
import type { NakamawakePuzzle, NakamawakeScheduleEntry } from "../types";

const samplePuzzles: NakamawakePuzzle[] = [
  {
    groups: [
      {
        name: "\u679C\u7269",
        words: [
          "\u308A\u3093\u3054",
          "\u307F\u304B\u3093",
          "\u3076\u3069\u3046",
          "\u3082\u3082",
        ],
        difficulty: 1,
      },
      {
        name: "\u52D5\u7269",
        words: [
          "\u3044\u306C",
          "\u306D\u3053",
          "\u3046\u3055\u304E",
          "\u304F\u307E",
        ],
        difficulty: 2,
      },
      {
        name: "\u8272",
        words: [
          "\u3042\u304B",
          "\u3042\u304A",
          "\u304D\u3044\u308D",
          "\u307F\u3069\u308A",
        ],
        difficulty: 3,
      },
      {
        name: "\u5B63\u7BC0",
        words: ["\u306F\u308B", "\u306A\u3064", "\u3042\u304D", "\u3075\u3086"],
        difficulty: 4,
      },
    ],
  },
  {
    groups: [
      {
        name: "\u9B5A",
        words: [
          "\u305F\u3044",
          "\u3055\u3051",
          "\u307E\u3050\u308D",
          "\u3076\u308A",
        ],
        difficulty: 1,
      },
      {
        name: "\u82B1",
        words: [
          "\u3055\u304F\u3089",
          "\u3070\u3089",
          "\u3086\u308A",
          "\u304D\u304F",
        ],
        difficulty: 2,
      },
      {
        name: "\u5929\u6C17",
        words: ["\u6674\u308C", "\u96E8", "\u96EA", "\u98A8"],
        difficulty: 3,
      },
      {
        name: "\u697D\u5668",
        words: [
          "\u30D4\u30A2\u30CE",
          "\u30AE\u30BF\u30FC",
          "\u30C9\u30E9\u30E0",
          "\u30D0\u30A4\u30AA\u30EA\u30F3",
        ],
        difficulty: 4,
      },
    ],
  },
  {
    groups: [
      {
        name: "\u4F53",
        words: ["\u3042\u305F\u307E", "\u3066", "\u3042\u3057", "\u3081"],
        difficulty: 1,
      },
      {
        name: "\u5C71",
        words: [
          "\u5BCC\u58EB",
          "\u30A2\u30EB\u30D7\u30B9",
          "\u30D2\u30DE\u30E9\u30E4",
          "\u30A8\u30D9\u30EC\u30B9\u30C8",
        ],
        difficulty: 2,
      },
      {
        name: "\u6599\u7406",
        words: [
          "\u5BFF\u53F8",
          "\u30E9\u30FC\u30E1\u30F3",
          "\u30AB\u30EC\u30FC",
          "\u30D1\u30B9\u30BF",
        ],
        difficulty: 3,
      },
      {
        name: "\u661F",
        words: ["\u706B\u661F", "\u6728\u661F", "\u571F\u661F", "\u91D1\u661F"],
        difficulty: 4,
      },
    ],
  },
];

const sampleSchedule: NakamawakeScheduleEntry[] = [
  { date: "2026-02-14", puzzleIndex: 0 },
  { date: "2026-02-15", puzzleIndex: 1 },
  { date: "2026-02-16", puzzleIndex: 2 },
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
  test("returns scheduled puzzle for a matching date", () => {
    const date = new Date("2026-02-14T03:00:00Z");
    const result = getTodaysPuzzle(samplePuzzles, sampleSchedule, date);
    expect(result.puzzle.groups[0].name).toBe("\u679C\u7269");
    expect(result.puzzleNumber).toBe(1);
  });

  test("returns different puzzle for different scheduled dates", () => {
    const date = new Date("2026-02-15T03:00:00Z");
    const result = getTodaysPuzzle(samplePuzzles, sampleSchedule, date);
    expect(result.puzzle.groups[0].name).toBe("\u9B5A");
    expect(result.puzzleNumber).toBe(2);
  });

  test("falls back to hash when date is not in schedule", () => {
    const date = new Date("2026-03-17T03:00:00Z");
    const result = getTodaysPuzzle(samplePuzzles, sampleSchedule, date);
    // Should return a valid puzzle (from the dataset)
    const allGroupNames = samplePuzzles.flatMap((p) =>
      p.groups.map((g) => g.name),
    );
    expect(allGroupNames).toContain(result.puzzle.groups[0].name);
    expect(result.puzzleNumber).toBe(32);
  });

  test("fallback is deterministic for the same date", () => {
    const date = new Date("2027-01-01T03:00:00Z");
    const result1 = getTodaysPuzzle(samplePuzzles, sampleSchedule, date);
    const result2 = getTodaysPuzzle(samplePuzzles, sampleSchedule, date);
    expect(result1.puzzle.groups[0].name).toBe(result2.puzzle.groups[0].name);
    expect(result1.puzzleNumber).toBe(result2.puzzleNumber);
  });
});
