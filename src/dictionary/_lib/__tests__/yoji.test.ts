import { describe, expect, test } from "vitest";
import {
  getAllYoji,
  getYojiByYoji,
  getYojiByCategory,
  getYojiByDifficulty,
  getYojiCategories,
  getAllYojiIds,
} from "../yoji";

describe("getAllYoji", () => {
  test("returns 101 yoji entries", () => {
    expect(getAllYoji()).toHaveLength(101);
  });

  test("each entry has required fields", () => {
    for (const y of getAllYoji()) {
      expect(y.yoji).toBeTruthy();
      expect(y.yoji.length).toBe(4);
      expect(y.reading).toBeTruthy();
      expect(y.meaning).toBeTruthy();
      expect(y.difficulty).toBeGreaterThanOrEqual(1);
      expect(y.difficulty).toBeLessThanOrEqual(3);
      expect(y.category).toBeTruthy();
    }
  });
});

describe("getYojiByYoji", () => {
  test("returns correct entry for known yoji", () => {
    const result = getYojiByYoji("一期一会");
    expect(result).toBeDefined();
    expect(result!.reading).toBe("いちごいちえ");
  });

  test("returns undefined for unknown yoji", () => {
    expect(getYojiByYoji("存在しない")).toBeUndefined();
  });
});

describe("getYojiByCategory", () => {
  test("returns entries for life category", () => {
    const result = getYojiByCategory("life");
    expect(result.length).toBeGreaterThan(0);
    for (const y of result) {
      expect(y.category).toBe("life");
    }
  });
});

describe("getYojiByDifficulty", () => {
  test("returns entries for difficulty 1", () => {
    const result = getYojiByDifficulty(1);
    expect(result.length).toBeGreaterThan(0);
    for (const y of result) {
      expect(y.difficulty).toBe(1);
    }
  });

  test("returns entries for difficulty 3", () => {
    const result = getYojiByDifficulty(3);
    expect(result.length).toBeGreaterThan(0);
    for (const y of result) {
      expect(y.difficulty).toBe(3);
    }
  });
});

describe("getYojiCategories", () => {
  test("returns sorted category list", () => {
    const categories = getYojiCategories();
    expect(categories.length).toBeGreaterThan(0);
    const sorted = [...categories].sort();
    expect(categories).toEqual(sorted);
  });

  test("includes known categories", () => {
    const categories = getYojiCategories();
    expect(categories).toContain("life");
    expect(categories).toContain("effort");
    expect(categories).toContain("nature");
  });
});

describe("getAllYojiIds", () => {
  test("returns 101 ids", () => {
    expect(getAllYojiIds()).toHaveLength(101);
  });

  test("contains known yoji", () => {
    const ids = getAllYojiIds();
    expect(ids).toContain("一期一会");
    expect(ids).toContain("切磋琢磨");
  });
});
