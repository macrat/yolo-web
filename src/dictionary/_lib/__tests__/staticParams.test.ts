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

  test("yoji detail pages: 400 params", () => {
    const ids = getAllYojiIds();
    expect(ids).toHaveLength(400);
    // All ids should be unique
    expect(new Set(ids).size).toBe(400);
  });

  test("yoji category pages: 10 params", () => {
    const categories = getYojiCategories();
    expect(categories).toHaveLength(10);
  });
});

/**
 * generateStaticParams の二重エンコード防止テスト。
 * Next.js の generateStaticParams はデコード済みの生文字列を返す必要がある。
 * encodeURIComponent を誤って適用すると `%` を含む値になり、
 * Next.js 内部でさらにエンコードされて 404 になるバグを引き起こす。
 */
describe("generateStaticParams: 二重エンコード防止", () => {
  test("getKanjiRadicals() の各値に % が含まれないこと", () => {
    const radicals = getKanjiRadicals();
    for (const radical of radicals) {
      expect(radical, `部首 "${radical}" にエンコード文字が混入`).not.toContain(
        "%",
      );
    }
  });

  test("getAllKanjiChars() の各値に % が含まれないこと", () => {
    const chars = getAllKanjiChars();
    for (const char of chars) {
      expect(char, `漢字 "${char}" にエンコード文字が混入`).not.toContain("%");
    }
  });

  test("getAllYojiIds() の各値に % が含まれないこと", () => {
    const ids = getAllYojiIds();
    for (const id of ids) {
      expect(id, `四字熟語 "${id}" にエンコード文字が混入`).not.toContain("%");
    }
  });
});
