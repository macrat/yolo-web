import { describe, expect, test } from "vitest";
import {
  getAllKanji,
  getKanjiByChar,
  getKanjiByCategory,
  getKanjiCategories,
  getAllKanjiChars,
} from "../kanji";

describe("getAllKanji", () => {
  test("returns 80 kanji entries", () => {
    expect(getAllKanji()).toHaveLength(80);
  });

  test("each entry has required fields", () => {
    for (const k of getAllKanji()) {
      expect(k.character).toBeTruthy();
      expect(k.radical).toBeTruthy();
      expect(k.strokeCount).toBeGreaterThan(0);
      expect(k.grade).toBeGreaterThan(0);
      expect(k.meanings.length).toBeGreaterThan(0);
      expect(k.category).toBeTruthy();
    }
  });

  test("all 80 characters are unique", () => {
    const chars = getAllKanji().map((k) => k.character);
    const unique = new Set(chars);
    expect(unique.size).toBe(80);
  });

  test("all entries have grade 1", () => {
    for (const k of getAllKanji()) {
      expect(k.grade).toBe(1);
    }
  });

  test("all entries conform to KanjiEntry structure", () => {
    for (const k of getAllKanji()) {
      expect(typeof k.character).toBe("string");
      expect(k.character.length).toBe(1);
      expect(typeof k.radical).toBe("string");
      expect(typeof k.radicalGroup).toBe("number");
      expect(k.radicalGroup).toBeGreaterThanOrEqual(1);
      expect(k.radicalGroup).toBeLessThanOrEqual(214);
      expect(typeof k.strokeCount).toBe("number");
      expect(Array.isArray(k.onYomi)).toBe(true);
      expect(Array.isArray(k.kunYomi)).toBe(true);
      expect(Array.isArray(k.meanings)).toBe(true);
      expect(k.meanings.length).toBeGreaterThan(0);
      expect(typeof k.category).toBe("string");
      expect(Array.isArray(k.examples)).toBe(true);
      expect(k.examples.length).toBeGreaterThan(0);
    }
  });
});

describe("getKanjiByChar", () => {
  test("returns correct entry for known character", () => {
    const result = getKanjiByChar("山");
    expect(result).toBeDefined();
    expect(result!.character).toBe("山");
    expect(result!.meanings).toContain("mountain");
  });

  test("returns undefined for unknown character", () => {
    expect(getKanjiByChar("龍")).toBeUndefined();
  });
});

describe("getKanjiByCategory", () => {
  test("returns entries for nature category", () => {
    const result = getKanjiByCategory("nature");
    expect(result.length).toBeGreaterThan(0);
    for (const k of result) {
      expect(k.category).toBe("nature");
    }
  });

  test("returns empty array for unused category value", () => {
    // Using a cast to test with a value that doesn't exist
    const result = getKanjiByCategory("nonexistent" as never);
    expect(result).toHaveLength(0);
  });
});

describe("getKanjiCategories", () => {
  test("returns sorted category list", () => {
    const categories = getKanjiCategories();
    expect(categories.length).toBeGreaterThan(0);
    const sorted = [...categories].sort();
    expect(categories).toEqual(sorted);
  });

  test("includes known categories", () => {
    const categories = getKanjiCategories();
    expect(categories).toContain("nature");
    expect(categories).toContain("number");
    expect(categories).toContain("body");
  });
});

describe("getAllKanjiChars", () => {
  test("returns 80 characters", () => {
    expect(getAllKanjiChars()).toHaveLength(80);
  });

  test("contains known characters", () => {
    const chars = getAllKanjiChars();
    expect(chars).toContain("山");
    expect(chars).toContain("川");
    expect(chars).toContain("日");
  });
});
