import { describe, test, expect } from "vitest";
import { areCategoriesRelated, categorySuperGroups } from "../categories";

describe("categorySuperGroups", () => {
  test("contains 10 super-groups", () => {
    expect(Object.keys(categorySuperGroups)).toHaveLength(10);
  });

  test("all 20 radical groups are covered", () => {
    const coveredGroups = new Set<number>();
    for (const group of Object.values(categorySuperGroups)) {
      for (const g of group) {
        coveredGroups.add(g);
      }
    }

    for (let i = 1; i <= 20; i++) {
      expect(coveredGroups.has(i)).toBe(true);
    }
  });
});

describe("areCategoriesRelated", () => {
  test("returns true for identical groups", () => {
    expect(areCategoriesRelated(1, 1)).toBe(true);
    expect(areCategoriesRelated(20, 20)).toBe(true);
  });

  test("returns true for groups in same super-group (basicHuman: 1-3)", () => {
    expect(areCategoriesRelated(1, 2)).toBe(true);
    expect(areCategoriesRelated(2, 3)).toBe(true);
    expect(areCategoriesRelated(1, 3)).toBe(true);
  });

  test("returns true for groups in same super-group (metalWeather: 18-19)", () => {
    expect(areCategoriesRelated(18, 19)).toBe(true);
  });

  test("group 19 is close to group 18 (metalWeather)", () => {
    expect(areCategoriesRelated(19, 18)).toBe(true);
  });

  test("group 20 is NOT close to group 19 (separate super-groups)", () => {
    expect(areCategoriesRelated(20, 19)).toBe(false);
  });

  test("group 20 is in its own super-group (bioOther)", () => {
    // Group 20 is only related to itself
    expect(areCategoriesRelated(20, 20)).toBe(true);
    expect(areCategoriesRelated(20, 1)).toBe(false);
    expect(areCategoriesRelated(20, 19)).toBe(false);
  });

  test("returns false for groups in different super-groups", () => {
    expect(areCategoriesRelated(1, 4)).toBe(false);
    expect(areCategoriesRelated(5, 8)).toBe(false);
    expect(areCategoriesRelated(10, 16)).toBe(false);
    expect(areCategoriesRelated(12, 18)).toBe(false);
  });

  test("returns true for groups in same super-group (terrainAction: 6-7)", () => {
    expect(areCategoriesRelated(6, 7)).toBe(true);
  });

  test("returns true for groups in same super-group (senseMaterial: 12-13)", () => {
    expect(areCategoriesRelated(12, 13)).toBe(true);
  });
});
