import { describe, expect, test } from "vitest";
import { getAllKanjiChars, getKanjiCategories } from "../kanji";
import { getAllYojiIds, getYojiCategories } from "../yoji";

describe("generateStaticParams counts", () => {
  test("kanji detail pages: 80 params", () => {
    const chars = getAllKanjiChars();
    expect(chars).toHaveLength(80);
    // All chars should be unique
    expect(new Set(chars).size).toBe(80);
  });

  test("kanji category pages: 17 params", () => {
    const categories = getKanjiCategories();
    expect(categories).toHaveLength(17);
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
