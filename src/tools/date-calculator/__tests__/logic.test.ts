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

  test("one day difference", () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 2);
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
