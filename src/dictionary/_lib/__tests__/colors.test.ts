import { describe, expect, test } from "vitest";
import {
  getAllColors,
  getColorBySlug,
  getColorsByCategory,
  getColorCategories,
  getAllColorSlugs,
} from "../colors";

describe("getAllColors", () => {
  test("returns 250 color entries", () => {
    expect(getAllColors()).toHaveLength(250);
  });

  test("each entry has required fields", () => {
    for (const color of getAllColors()) {
      expect(color.slug).toBeTruthy();
      expect(color.name).toBeTruthy();
      expect(color.romaji).toBeTruthy();
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(color.rgb).toHaveLength(3);
      expect(color.hsl).toHaveLength(3);
      expect(color.category).toBeTruthy();
    }
  });
});

describe("getColorBySlug", () => {
  test("returns correct entry for known slug", () => {
    const result = getColorBySlug("nadeshiko");
    expect(result).toBeDefined();
    expect(result!.name).toBe("撫子");
    expect(result!.hex).toBe("#dc9fb4");
  });

  test("returns undefined for unknown slug", () => {
    expect(getColorBySlug("no-such-color")).toBeUndefined();
  });
});

describe("getColorsByCategory", () => {
  test("returns entries for red category", () => {
    const result = getColorsByCategory("red");
    expect(result.length).toBeGreaterThan(0);
    for (const color of result) {
      expect(color.category).toBe("red");
    }
  });
});

describe("getColorCategories", () => {
  test("returns 7 categories", () => {
    expect(getColorCategories()).toHaveLength(7);
  });

  test("returns sorted category list", () => {
    const categories = getColorCategories();
    const sorted = [...categories].sort();
    expect(categories).toEqual(sorted);
  });
});

describe("getAllColorSlugs", () => {
  test("returns 250 slugs", () => {
    expect(getAllColorSlugs()).toHaveLength(250);
  });

  test("all slugs are unique", () => {
    const slugs = getAllColorSlugs();
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });
});
