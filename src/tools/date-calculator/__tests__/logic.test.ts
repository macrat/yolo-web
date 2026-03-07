import { describe, test, expect } from "vitest";
import {
  dateDiff,
  addDays,
  subtractDays,
  toWareki,
  fromWareki,
  formatDate,
  parseDate,
  getDayOfWeek,
} from "../logic";

describe("dateDiff", () => {
  test("same date returns 0 days", () => {
    const d = new Date(2026, 0, 1);
    const result = dateDiff(d, d);
    expect(result.totalDays).toBe(0);
  });

  test("same calendar date with different local times still returns 0 totalDays", () => {
    const d1 = new Date(2024, 2, 10, 0, 30);
    const d2 = new Date(2024, 2, 10, 23, 30);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(0);
  });

  test("one day difference", () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 2);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(1);
  });

  test("one calendar day across DST boundary keeps totalDays stable", () => {
    const d1 = new Date("2024-03-10T00:00:00-08:00");
    const d2 = new Date("2024-03-11T00:00:00-07:00");
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(1);
  });

  test("one year difference", () => {
    const d1 = new Date(2025, 0, 1);
    const d2 = new Date(2026, 0, 1);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(365);
    expect(result.years).toBe(1);
  });

  test("handles leap year", () => {
    const d1 = new Date(2024, 0, 1);
    const d2 = new Date(2024, 11, 31);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(365); // 2024 is leap year: 366 days total, but Jan 1 to Dec 31 = 365
  });

  test("handles leap day boundary", () => {
    const d1 = new Date(2024, 1, 28);
    const d2 = new Date(2024, 2, 1);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(2);
  });

  test("order independent (absolute difference)", () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 15);
    expect(dateDiff(d1, d2).totalDays).toBe(dateDiff(d2, d1).totalDays);
  });

  test("calculates weeks correctly", () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 15);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(14);
    expect(result.weeks).toBe(2);
  });

  test("calculates months correctly", () => {
    const d1 = new Date(2026, 0, 15);
    const d2 = new Date(2026, 3, 15);
    const result = dateDiff(d1, d2);
    expect(result.months).toBe(3);
  });
});

describe("addDays", () => {
  test("adds positive days", () => {
    const d = new Date(2026, 0, 1);
    const result = addDays(d, 10);
    expect(result.getDate()).toBe(11);
    expect(result.getMonth()).toBe(0);
  });

  test("adds across month boundary", () => {
    const d = new Date(2026, 0, 28);
    const result = addDays(d, 5);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(2);
  });

  test("adds across year boundary", () => {
    const d = new Date(2025, 11, 30);
    const result = addDays(d, 5);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
  });

  test("handles zero days", () => {
    const d = new Date(2026, 5, 15);
    const result = addDays(d, 0);
    expect(result.getDate()).toBe(15);
  });
});

describe("subtractDays", () => {
  test("subtracts days", () => {
    const d = new Date(2026, 0, 15);
    const result = subtractDays(d, 5);
    expect(result.getDate()).toBe(10);
  });

  test("subtracts across month boundary", () => {
    const d = new Date(2026, 1, 3);
    const result = subtractDays(d, 5);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getDate()).toBe(29);
  });
});

describe("toWareki", () => {
  test("converts 2026-02-14 to Reiwa 8", () => {
    const result = toWareki(new Date(2026, 1, 14));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("令和");
    expect(result.year).toBe(8);
    expect(result.formatted).toBe("令和8年2月14日");
  });

  test("converts 2019-05-01 to Reiwa 1 (元年)", () => {
    const result = toWareki(new Date(2019, 4, 1));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("令和");
    expect(result.formatted).toContain("令和元年");
  });

  test("converts 1989-01-08 to Heisei 1", () => {
    const result = toWareki(new Date(1989, 0, 8));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("平成");
    expect(result.year).toBe(1);
  });

  test("converts 1970-01-01 to Showa 45", () => {
    const result = toWareki(new Date(1970, 0, 1));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("昭和");
    expect(result.year).toBe(45);
  });

  test("converts Meiji era date", () => {
    const result = toWareki(new Date(1900, 0, 1));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("明治");
  });

  test("returns error for pre-Meiji date", () => {
    const result = toWareki(new Date(1867, 0, 1));
    expect(result.success).toBe(false);
  });
});

describe("fromWareki", () => {
  test("converts Reiwa 8 to 2026", () => {
    const result = fromWareki("令和", 8, 2, 14);
    expect(result.success).toBe(true);
    expect(result.date?.getFullYear()).toBe(2026);
    expect(result.date?.getMonth()).toBe(1);
    expect(result.date?.getDate()).toBe(14);
  });

  test("converts Heisei 1 to 1989", () => {
    const result = fromWareki("平成", 1, 1, 8);
    expect(result.success).toBe(true);
    expect(result.date?.getFullYear()).toBe(1989);
  });

  test("returns error for unknown era", () => {
    const result = fromWareki("不明", 1, 1, 1);
    expect(result.success).toBe(false);
  });

  // --- endDate boundary tests ---

  test("accepts Heisei 31 Apr 30 (last day of Heisei)", () => {
    const result = fromWareki("平成", 31, 4, 30);
    expect(result.success).toBe(true);
    expect(result.date?.getFullYear()).toBe(2019);
    expect(result.date?.getMonth()).toBe(3);
    expect(result.date?.getDate()).toBe(30);
  });

  test("rejects Heisei 31 May 1 (first day of Reiwa = outside Heisei)", () => {
    const result = fromWareki("平成", 31, 5, 1);
    expect(result.success).toBe(false);
    expect(result.error).toContain("平成");
    expect(result.error).toContain("範囲外");
  });

  test("rejects Heisei 40 Jan 1 (clearly outside Heisei)", () => {
    const result = fromWareki("平成", 40, 1, 1);
    expect(result.success).toBe(false);
    expect(result.error).toContain("平成");
    expect(result.error).toContain("範囲外");
  });

  test("accepts Showa 64 Jan 7 (last day of Showa)", () => {
    const result = fromWareki("昭和", 64, 1, 7);
    expect(result.success).toBe(true);
    expect(result.date?.getFullYear()).toBe(1989);
    expect(result.date?.getMonth()).toBe(0);
    expect(result.date?.getDate()).toBe(7);
  });

  test("rejects Showa 64 Jan 8 (first day of Heisei = outside Showa)", () => {
    const result = fromWareki("昭和", 64, 1, 8);
    expect(result.success).toBe(false);
    expect(result.error).toContain("昭和");
    expect(result.error).toContain("範囲外");
  });

  test("accepts Taisho 15 Dec 24 (last day of Taisho)", () => {
    const result = fromWareki("大正", 15, 12, 24);
    expect(result.success).toBe(true);
    expect(result.date?.getFullYear()).toBe(1926);
    expect(result.date?.getMonth()).toBe(11);
    expect(result.date?.getDate()).toBe(24);
  });

  test("rejects Taisho 15 Dec 25 (first day of Showa = outside Taisho)", () => {
    const result = fromWareki("大正", 15, 12, 25);
    expect(result.success).toBe(false);
    expect(result.error).toContain("大正");
    expect(result.error).toContain("範囲外");
  });

  test("accepts Reiwa dates without restriction", () => {
    const result = fromWareki("令和", 100, 1, 1);
    expect(result.success).toBe(true);
  });

  // --- date validation tests (round-trip check in fromWareki) ---

  test("rejects invalid date: Reiwa 8 Feb 31", () => {
    const result = fromWareki("令和", 8, 2, 31);
    expect(result.success).toBe(false);
    expect(result.error).toContain("無効な日付");
  });

  test("rejects invalid date: Reiwa 8 Apr 31", () => {
    const result = fromWareki("令和", 8, 4, 31);
    expect(result.success).toBe(false);
    expect(result.error).toContain("無効な日付");
  });
});

describe("formatDate", () => {
  test("formats date as YYYY-MM-DD", () => {
    expect(formatDate(new Date(2026, 1, 14))).toBe("2026-02-14");
  });

  test("pads month and day", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("parseDate", () => {
  test("parses valid date string", () => {
    const d = parseDate("2026-02-14");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
  });

  test("returns null for invalid date", () => {
    expect(parseDate("invalid")).toBeNull();
  });

  test("returns null for Feb 31 (auto-correction prevention)", () => {
    expect(parseDate("2026-02-31")).toBeNull();
  });

  test("returns null for Feb 29 in non-leap year", () => {
    expect(parseDate("2026-02-29")).toBeNull();
  });
});

describe("getDayOfWeek", () => {
  test("returns correct day name in Japanese", () => {
    // 2026-02-14 is Saturday
    expect(getDayOfWeek(new Date(2026, 1, 14))).toBe("土曜日");
  });

  test("returns Sunday correctly", () => {
    // 2026-02-15 is Sunday
    expect(getDayOfWeek(new Date(2026, 1, 15))).toBe("日曜日");
  });
});
