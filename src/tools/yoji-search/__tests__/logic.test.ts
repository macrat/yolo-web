import { describe, it, expect } from "vitest";
import { filterYoji, YOJI_COUNT } from "../logic";

describe("filterYoji", () => {
  const allFilters = {
    query: "",
    category: "all" as const,
    difficulty: "all" as const,
    origin: "all" as const,
  };

  it("returns all entries when no filters are applied", () => {
    const results = filterYoji(allFilters);
    expect(results).toHaveLength(YOJI_COUNT);
  });

  it("filters by yoji text", () => {
    const results = filterYoji({ ...allFilters, query: "一期一会" });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((e) => e.yoji === "一期一会")).toBe(true);
  });

  it("filters by reading (hiragana)", () => {
    const results = filterYoji({ ...allFilters, query: "いちごいちえ" });
    expect(results.some((e) => e.yoji === "一期一会")).toBe(true);
  });

  it("filters by meaning text", () => {
    const results = filterYoji({ ...allFilters, query: "出会い" });
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("normalizes katakana to hiragana for matching", () => {
    const results = filterYoji({ ...allFilters, query: "イチゴイチエ" });
    expect(results.some((e) => e.yoji === "一期一会")).toBe(true);
  });

  it("filters by category", () => {
    const results = filterYoji({ ...allFilters, category: "life" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((e) => e.category === "life")).toBe(true);
  });

  it("filters by difficulty", () => {
    const results = filterYoji({ ...allFilters, difficulty: 1 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((e) => e.difficulty === 1)).toBe(true);
  });

  it("filters by origin", () => {
    const results = filterYoji({ ...allFilters, origin: "日本" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((e) => e.origin === "日本")).toBe(true);
  });

  it("combines text query with category filter", () => {
    const allLife = filterYoji({ ...allFilters, category: "life" });
    const lifePlusQuery = filterYoji({
      ...allFilters,
      category: "life",
      query: "人生",
    });
    expect(lifePlusQuery.length).toBeLessThanOrEqual(allLife.length);
    expect(lifePlusQuery.every((e) => e.category === "life")).toBe(true);
  });

  it("returns empty array when no results match", () => {
    const results = filterYoji({
      ...allFilters,
      query: "zzzzznonexistent",
    });
    expect(results).toHaveLength(0);
  });

  it("trims whitespace from query", () => {
    const results = filterYoji({ ...allFilters, query: "  一期一会  " });
    expect(results.some((e) => e.yoji === "一期一会")).toBe(true);
  });
});
