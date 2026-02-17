import { describe, expect, test } from "vitest";
import {
  getAllKanji,
  getKanjiByChar,
  getKanjiByCategory,
  getKanjiCategories,
  getAllKanjiChars,
} from "../kanji";

describe("getAllKanji", () => {
  test("returns 50 kanji entries", () => {
    expect(getAllKanji()).toHaveLength(50);
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
  test("returns 50 characters", () => {
    expect(getAllKanjiChars()).toHaveLength(50);
  });

  test("contains known characters", () => {
    const chars = getAllKanjiChars();
    expect(chars).toContain("山");
    expect(chars).toContain("川");
    expect(chars).toContain("日");
  });
});
