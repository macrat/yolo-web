import { describe, it, expect } from "vitest";
import {
  calculateAge,
  toWareki,
  getZodiac,
  getConstellation,
  formatDate,
  parseDate,
} from "../logic";

describe("calculateAge", () => {
  it("returns 0 for same day", () => {
    const d = new Date(2000, 0, 1);
    const result = calculateAge(d, d);
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.totalDays).toBe(0);
    expect(result.totalMonths).toBe(0);
  });

  it("calculates exactly 1 year", () => {
    const birth = new Date(2000, 0, 1);
    const target = new Date(2001, 0, 1);
    const result = calculateAge(birth, target);
    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.totalDays).toBe(366); // 2000 is a leap year
    expect(result.totalMonths).toBe(12);
  });

  it("handles leap year birthday (Feb 29)", () => {
    const birth = new Date(2000, 1, 29);
    const target = new Date(2001, 1, 28);
    const result = calculateAge(birth, target);
    expect(result.years).toBe(0);
    expect(result.months).toBe(11);
  });

  it("handles leap year birthday to next leap year", () => {
    const birth = new Date(2000, 1, 29);
    const target = new Date(2004, 1, 29);
    const result = calculateAge(birth, target);
    expect(result.years).toBe(4);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
  });

  it("calculates months and days accurately", () => {
    const birth = new Date(2000, 0, 15);
    const target = new Date(2000, 3, 20);
    const result = calculateAge(birth, target);
    expect(result.years).toBe(0);
    expect(result.months).toBe(3);
    expect(result.days).toBe(5);
    expect(result.totalMonths).toBe(3);
  });

  it("handles future date (birth after target) using absolute value", () => {
    const birth = new Date(2026, 0, 1);
    const target = new Date(2025, 0, 1);
    const result = calculateAge(birth, target);
    expect(result.years).toBe(1);
    expect(result.totalDays).toBe(365);
  });
});

describe("toWareki", () => {
  it("converts 2026 to Reiwa 8", () => {
    const result = toWareki(2026);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("令和");
    expect(result!.year).toBe(8);
    expect(result!.formatted).toBe("令和8年");
  });

  it("converts 2019 to Reiwa 1 (元年)", () => {
    const result = toWareki(2019);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("令和");
    expect(result!.year).toBe(1);
    expect(result!.formatted).toBe("令和元年");
  });

  it("converts 2018 to Heisei 30", () => {
    const result = toWareki(2018);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("平成");
    expect(result!.year).toBe(30);
    expect(result!.formatted).toBe("平成30年");
  });

  it("converts 1989 to Heisei 1 (boundary)", () => {
    const result = toWareki(1989);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("平成");
    expect(result!.year).toBe(1);
  });

  it("converts 1988 to Showa 63", () => {
    const result = toWareki(1988);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("昭和");
    expect(result!.year).toBe(63);
  });

  it("converts 1926 to Showa 1 (boundary)", () => {
    const result = toWareki(1926);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("昭和");
    expect(result!.year).toBe(1);
  });

  it("converts 1925 to Taisho 14", () => {
    const result = toWareki(1925);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("大正");
    expect(result!.year).toBe(14);
  });

  it("converts 1912 to Taisho 1 (boundary)", () => {
    const result = toWareki(1912);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("大正");
    expect(result!.year).toBe(1);
  });

  it("converts 1911 to Meiji 44", () => {
    const result = toWareki(1911);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("明治");
    expect(result!.year).toBe(44);
  });

  it("converts 1868 to Meiji 1 (boundary)", () => {
    const result = toWareki(1868);
    expect(result).not.toBeNull();
    expect(result!.era).toBe("明治");
    expect(result!.year).toBe(1);
  });

  it("returns null for pre-Meiji year", () => {
    const result = toWareki(1867);
    expect(result).toBeNull();
  });
});

describe("getZodiac", () => {
  it("returns 子 for 2020", () => {
    expect(getZodiac(2020)).toBe("子");
  });

  it("returns 丑 for 2021", () => {
    expect(getZodiac(2021)).toBe("丑");
  });

  it("returns 亥 for 2019", () => {
    expect(getZodiac(2019)).toBe("亥");
  });

  it("returns 辰 for 2024", () => {
    expect(getZodiac(2024)).toBe("辰");
  });

  it("returns 巳 for 2025", () => {
    expect(getZodiac(2025)).toBe("巳");
  });

  it("returns 午 for 2026", () => {
    expect(getZodiac(2026)).toBe("午");
  });

  it("cycles correctly for historical year", () => {
    // 12-year cycle: 2020 = 子, so 2008 = 子
    expect(getZodiac(2008)).toBe("子");
  });
});

describe("getConstellation", () => {
  it("returns 水瓶座 for Jan 20", () => {
    expect(getConstellation(1, 20)).toBe("水瓶座");
  });

  it("returns 水瓶座 for Feb 18", () => {
    expect(getConstellation(2, 18)).toBe("水瓶座");
  });

  it("returns 魚座 for Feb 19", () => {
    expect(getConstellation(2, 19)).toBe("魚座");
  });

  it("returns 魚座 for Mar 20", () => {
    expect(getConstellation(3, 20)).toBe("魚座");
  });

  it("returns 牡羊座 for Mar 21", () => {
    expect(getConstellation(3, 21)).toBe("牡羊座");
  });

  it("returns 牡牛座 for Apr 20", () => {
    expect(getConstellation(4, 20)).toBe("牡牛座");
  });

  it("returns 双子座 for May 21", () => {
    expect(getConstellation(5, 21)).toBe("双子座");
  });

  it("returns 蟹座 for Jun 22", () => {
    expect(getConstellation(6, 22)).toBe("蟹座");
  });

  it("returns 獅子座 for Jul 23", () => {
    expect(getConstellation(7, 23)).toBe("獅子座");
  });

  it("returns 乙女座 for Aug 23", () => {
    expect(getConstellation(8, 23)).toBe("乙女座");
  });

  it("returns 天秤座 for Sep 23", () => {
    expect(getConstellation(9, 23)).toBe("天秤座");
  });

  it("returns 蠍座 for Oct 24", () => {
    expect(getConstellation(10, 24)).toBe("蠍座");
  });

  it("returns 射手座 for Nov 23", () => {
    expect(getConstellation(11, 23)).toBe("射手座");
  });

  it("returns 山羊座 for Dec 22", () => {
    expect(getConstellation(12, 22)).toBe("山羊座");
  });

  it("returns 山羊座 for Jan 19 (wraps around year)", () => {
    expect(getConstellation(1, 19)).toBe("山羊座");
  });

  it("returns 射手座 for Dec 21 (boundary)", () => {
    expect(getConstellation(12, 21)).toBe("射手座");
  });

  it("returns 蠍座 for Nov 22 (boundary)", () => {
    expect(getConstellation(11, 22)).toBe("蠍座");
  });
});

describe("formatDate", () => {
  it("formats date as YYYY-MM-DD", () => {
    expect(formatDate(new Date(2026, 1, 14))).toBe("2026-02-14");
  });

  it("pads month and day", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("parseDate", () => {
  it("parses valid date string", () => {
    const d = parseDate("2026-02-14");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(1);
    expect(d!.getDate()).toBe(14);
  });

  it("returns null for invalid date", () => {
    expect(parseDate("invalid")).toBeNull();
  });

  it("round-trips with formatDate", () => {
    const original = new Date(1990, 5, 15);
    const formatted = formatDate(original);
    const parsed = parseDate(formatted);
    expect(parsed).not.toBeNull();
    expect(parsed!.getFullYear()).toBe(1990);
    expect(parsed!.getMonth()).toBe(5);
    expect(parsed!.getDate()).toBe(15);
  });
});
