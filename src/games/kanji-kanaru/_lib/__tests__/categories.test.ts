import { describe, test, expect } from "vitest";
import { areCategoriesRelated, categorySuperGroups } from "../categories";

describe("categorySuperGroups", () => {
  test("contains 4 super-groups", () => {
    expect(Object.keys(categorySuperGroups)).toHaveLength(4);
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

  test("returns true for groups in same super-group (human: 1-6)", () => {
    expect(areCategoriesRelated(1, 2)).toBe(true);
    expect(areCategoriesRelated(2, 3)).toBe(true);
    expect(areCategoriesRelated(1, 6)).toBe(true);
    expect(areCategoriesRelated(4, 5)).toBe(true);
  });

  test("returns true for groups in same super-group (nature: 7-12)", () => {
    expect(areCategoriesRelated(7, 8)).toBe(true);
    expect(areCategoriesRelated(9, 12)).toBe(true);
    expect(areCategoriesRelated(10, 11)).toBe(true);
  });

  test("returns true for groups in same super-group (civilization: 13-19)", () => {
    expect(areCategoriesRelated(13, 14)).toBe(true);
    expect(areCategoriesRelated(15, 19)).toBe(true);
    expect(areCategoriesRelated(17, 18)).toBe(true);
  });

  test("group 20 is NOT close to group 19 (separate super-groups)", () => {
    expect(areCategoriesRelated(20, 19)).toBe(false);
  });

  test("group 20 is in its own super-group (abstract)", () => {
    expect(areCategoriesRelated(20, 20)).toBe(true);
    expect(areCategoriesRelated(20, 1)).toBe(false);
    expect(areCategoriesRelated(20, 19)).toBe(false);
  });

  test("returns false for groups in different super-groups", () => {
    // human vs nature
    expect(areCategoriesRelated(1, 7)).toBe(false);
    // human vs civilization
    expect(areCategoriesRelated(5, 13)).toBe(false);
    // nature vs civilization
    expect(areCategoriesRelated(10, 16)).toBe(false);
    // nature vs abstract
    expect(areCategoriesRelated(12, 20)).toBe(false);
  });
});
