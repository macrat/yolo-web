import { describe, expect, test } from "vitest";
import {
  getAllKanjiChars,
  getKanjiGrades,
  getKanjiRadicals,
  getKanjiStrokeCounts,
} from "../kanji";
import { getAllYojiIds, getYojiCategories } from "../yoji";

describe("generateStaticParams counts", () => {
  test("kanji detail pages: 2136 params", () => {
    const chars = getAllKanjiChars();
    expect(chars).toHaveLength(2136);
    // All chars should be unique
    expect(new Set(chars).size).toBe(2136);
  });

  test("kanji grade pages: 7 params", () => {
    const grades = getKanjiGrades();
    expect(grades).toHaveLength(7);
  });

  test("kanji radical pages: non-empty params", () => {
    const radicals = getKanjiRadicals();
    expect(radicals.length).toBeGreaterThan(0);
  });

  test("kanji stroke pages: non-empty params", () => {
    const counts = getKanjiStrokeCounts();
    expect(counts.length).toBeGreaterThan(0);
  });

  test("yoji detail pages: 101 params", () => {
    const ids = getAllYojiIds();
    expect(ids).toHaveLength(101);
    // All ids should be unique
    expect(new Set(ids).size).toBe(101);
  });

  test("yoji category pages: 10 params", () => {
    const categories = getYojiCategories();
    expect(categories).toHaveLength(10);
  });
});
