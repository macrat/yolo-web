import { describe, test, expect } from "vitest";
import { areCategoriesRelated, categorySuperGroups } from "../categories";
import type { SemanticCategory } from "../types";

describe("categorySuperGroups", () => {
  test("contains 5 super-groups", () => {
    expect(Object.keys(categorySuperGroups)).toHaveLength(5);
  });

  test("all 20 categories are covered", () => {
    const allCategories: SemanticCategory[] = [
      "nature",
      "body",
      "action",
      "emotion",
      "number",
      "time",
      "direction",
      "building",
      "tool",
      "animal",
      "plant",
      "weather",
      "water",
      "fire",
      "earth",
      "person",
      "society",
      "language",
      "abstract",
      "measurement",
    ];

    const coveredCategories = new Set<string>();
    for (const group of Object.values(categorySuperGroups)) {
      for (const cat of group) {
        coveredCategories.add(cat);
      }
    }

    for (const cat of allCategories) {
      expect(coveredCategories.has(cat)).toBe(true);
    }
  });
});

describe("areCategoriesRelated", () => {
  test("returns true for identical categories", () => {
    expect(areCategoriesRelated("nature", "nature")).toBe(true);
  });

  test("returns true for categories in same super-group (elements)", () => {
    expect(areCategoriesRelated("water", "fire")).toBe(true);
    expect(areCategoriesRelated("earth", "weather")).toBe(true);
    expect(areCategoriesRelated("nature", "water")).toBe(true);
  });

  test("returns true for categories in same super-group (living)", () => {
    expect(areCategoriesRelated("animal", "plant")).toBe(true);
    expect(areCategoriesRelated("body", "person")).toBe(true);
  });

  test("returns true for categories in same super-group (human)", () => {
    expect(areCategoriesRelated("emotion", "action")).toBe(true);
    expect(areCategoriesRelated("language", "society")).toBe(true);
  });

  test("returns true for categories in same super-group (abstract)", () => {
    expect(areCategoriesRelated("number", "time")).toBe(true);
    expect(areCategoriesRelated("direction", "measurement")).toBe(true);
    expect(areCategoriesRelated("abstract", "number")).toBe(true);
  });

  test("returns true for categories in same super-group (objects)", () => {
    expect(areCategoriesRelated("building", "tool")).toBe(true);
  });

  test("returns false for categories in different super-groups", () => {
    expect(areCategoriesRelated("nature", "person")).toBe(false);
    expect(areCategoriesRelated("water", "building")).toBe(false);
    expect(areCategoriesRelated("emotion", "animal")).toBe(false);
    expect(areCategoriesRelated("number", "tool")).toBe(false);
  });
});
