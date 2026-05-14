import { describe, test, expect } from "vitest";
import {
  getAllEntries,
  getKeigoCategories,
  getEntriesByCategory,
  searchEntries,
  filterEntries,
  getCommonMistakes,
  getMistakesByType,
  getDailyEntry,
  getCategoryName,
} from "../logic";

describe("getAllEntries", () => {
  test("returns 50 or more entries", () => {
    expect(getAllEntries().length).toBeGreaterThanOrEqual(50);
  });

  test("each entry has required fields", () => {
    for (const entry of getAllEntries()) {
      expect(entry.id).toBeTruthy();
      expect(entry.casual).toBeTruthy();
      expect(entry.sonkeigo).toBeTruthy();
      expect(entry.kenjogo).toBeTruthy();
      expect(entry.teineigo).toBeTruthy();
      expect(entry.category).toBeTruthy();
    }
  });

  test("each entry has at least one example", () => {
    for (const entry of getAllEntries()) {
      expect(entry.examples.length).toBeGreaterThanOrEqual(1);
    }
  });

  test("all entry IDs are unique", () => {
    const ids = getAllEntries().map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("getKeigoCategories", () => {
  test("returns 3 categories", () => {
    expect(getKeigoCategories()).toHaveLength(3);
  });

  test("includes basic, business, service", () => {
    const ids = getKeigoCategories().map((c) => c.id);
    expect(ids).toContain("basic");
    expect(ids).toContain("business");
    expect(ids).toContain("service");
  });
});

describe("getCategoryName", () => {
  test("returns '基本動詞' for id 'basic'", () => {
    expect(getCategoryName("basic")).toBe("基本動詞");
  });

  test("returns 'ビジネス' for id 'business'", () => {
    expect(getCategoryName("business")).toBe("ビジネス");
  });

  test("returns '接客・サービス' for id 'service'", () => {
    expect(getCategoryName("service")).toBe("接客・サービス");
  });

  test("returns the id itself as fallback for unknown id", () => {
    expect(getCategoryName("unknown" as "basic")).toBe("unknown");
  });
});

describe("getEntriesByCategory", () => {
  test("returns entries for each category", () => {
    expect(getEntriesByCategory("basic").length).toBeGreaterThan(0);
    expect(getEntriesByCategory("business").length).toBeGreaterThan(0);
    expect(getEntriesByCategory("service").length).toBeGreaterThan(0);
  });

  test("all entries belong to the specified category", () => {
    for (const entry of getEntriesByCategory("basic")) {
      expect(entry.category).toBe("basic");
    }
    for (const entry of getEntriesByCategory("business")) {
      expect(entry.category).toBe("business");
    }
    for (const entry of getEntriesByCategory("service")) {
      expect(entry.category).toBe("service");
    }
  });
});

describe("searchEntries", () => {
  test("finds by casual form", () => {
    const results = searchEntries("言う");
    expect(results.some((e) => e.casual === "言う")).toBe(true);
  });

  test("finds by sonkeigo form", () => {
    const results = searchEntries("おっしゃる");
    expect(results.some((e) => e.casual === "言う")).toBe(true);
  });

  test("finds by kenjogo form", () => {
    const results = searchEntries("申す");
    expect(results.some((e) => e.casual === "言う")).toBe(true);
  });

  test("finds by teineigo form", () => {
    const results = searchEntries("行きます");
    expect(results.some((e) => e.casual === "行く")).toBe(true);
  });

  test("finds by partial match", () => {
    const results = searchEntries("言");
    expect(results.some((e) => e.casual === "言う")).toBe(true);
  });

  test("returns all entries for empty query", () => {
    expect(searchEntries("")).toEqual(getAllEntries());
    expect(searchEntries("  ")).toEqual(getAllEntries());
  });

  test("returns empty array for non-matching query", () => {
    expect(searchEntries("XXXXXX")).toHaveLength(0);
  });
});

describe("filterEntries", () => {
  test("returns all entries with category 'all' and empty query", () => {
    expect(filterEntries("", "all")).toEqual(getAllEntries());
  });

  test("filters by category only when query is empty", () => {
    const basicEntries = filterEntries("", "basic");
    expect(basicEntries.length).toBeGreaterThan(0);
    for (const entry of basicEntries) {
      expect(entry.category).toBe("basic");
    }
  });

  test("filters by query only when category is 'all'", () => {
    const results = filterEntries("言う", "all");
    expect(results.some((e) => e.casual === "言う")).toBe(true);
  });

  test("filters by both category and query", () => {
    const results = filterEntries("確認", "business");
    expect(results.length).toBeGreaterThan(0);
    for (const entry of results) {
      expect(entry.category).toBe("business");
    }
  });
});

describe("getCommonMistakes", () => {
  test("returns 10 or more mistakes", () => {
    expect(getCommonMistakes().length).toBeGreaterThanOrEqual(10);
  });

  test("each mistake has required fields", () => {
    for (const mistake of getCommonMistakes()) {
      expect(mistake.id).toBeTruthy();
      expect(mistake.wrong).toBeTruthy();
      expect(mistake.correct).toBeTruthy();
      expect(mistake.explanation).toBeTruthy();
      expect(mistake.mistakeType).toBeTruthy();
    }
  });

  test("all mistake IDs are unique", () => {
    const ids = getCommonMistakes().map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("getMistakesByType", () => {
  test("returns mistakes for each type", () => {
    expect(getMistakesByType("double-keigo").length).toBeGreaterThan(0);
    expect(getMistakesByType("wrong-direction").length).toBeGreaterThan(0);
    expect(getMistakesByType("baito-keigo").length).toBeGreaterThan(0);
  });

  test("all mistakes belong to the specified type", () => {
    for (const mistake of getMistakesByType("double-keigo")) {
      expect(mistake.mistakeType).toBe("double-keigo");
    }
    for (const mistake of getMistakesByType("wrong-direction")) {
      expect(mistake.mistakeType).toBe("wrong-direction");
    }
    for (const mistake of getMistakesByType("baito-keigo")) {
      expect(mistake.mistakeType).toBe("baito-keigo");
    }
  });
});

describe("getDailyEntry", () => {
  test("returns a KeigoEntry (not undefined) when called with a valid date", () => {
    const entry = getDailyEntry(new Date("2026-05-14"));
    expect(entry).toBeDefined();
    expect(entry!.id).toBeTruthy();
    expect(entry!.casual).toBeTruthy();
  });

  test("returns the same entry for the same date (deterministic)", () => {
    const date = new Date("2026-05-14");
    const entry1 = getDailyEntry(date);
    const entry2 = getDailyEntry(date);
    expect(entry1!.id).toBe(entry2!.id);
  });

  test("returns different entries for different dates (not always same)", () => {
    // 全エントリ数よりはるかに少ない日数の衝突を確認するより、
    // 複数日付をサンプルして少なくとも 1 種類以上異なることを確認
    const dates = [
      new Date("2026-05-14"),
      new Date("2026-05-15"),
      new Date("2026-05-16"),
      new Date("2026-05-17"),
      new Date("2026-05-18"),
    ];
    const ids = dates.map((d) => getDailyEntry(d)!.id);
    const uniqueIds = new Set(ids);
    // 5 日分で全部同じになることは確率的にほぼ起きない
    expect(uniqueIds.size).toBeGreaterThan(1);
  });

  test("returns a valid entry from getAllEntries()", () => {
    const entry = getDailyEntry(new Date("2026-01-01"));
    const allEntries = getAllEntries();
    expect(allEntries.some((e) => e.id === entry!.id)).toBe(true);
  });

  test("uses current date when no argument is provided", () => {
    // 引数なしで呼べること（エラーが出ないこと）を確認
    const entry = getDailyEntry();
    expect(entry).toBeDefined();
  });
});
