import { describe, expect, test } from "vitest";
import {
  getAllKanji,
  getKanjiByChar,
  getKanjiByGrade,
  getKanjiGrades,
  getKanjiByRadical,
  getKanjiRadicals,
  getKanjiByStrokeCount,
  getKanjiStrokeCounts,
  getAllKanjiChars,
} from "../kanji";

describe("getAllKanji", () => {
  test("returns 2136 kanji entries", () => {
    expect(getAllKanji()).toHaveLength(2136);
  });

  test("each entry has required fields", () => {
    for (const k of getAllKanji()) {
      expect(k.character).toBeTruthy();
      expect(k.radical).toBeTruthy();
      expect(k.strokeCount).toBeGreaterThan(0);
      expect(k.grade).toBeGreaterThan(0);
      expect(k.meanings.length).toBeGreaterThan(0);
    }
  });

  test("all 2136 characters are unique", () => {
    const chars = getAllKanji().map((k) => k.character);
    const unique = new Set(chars);
    expect(unique.size).toBe(2136);
  });

  test("entries have grades 1-7", () => {
    const grades = new Set(getAllKanji().map((k) => k.grade));
    expect(grades.has(1)).toBe(true);
    expect(grades.has(7)).toBe(true);
  });

  test("all entries conform to KanjiEntry structure", () => {
    for (const k of getAllKanji()) {
      expect(typeof k.character).toBe("string");
      // Most kanji are 1 JS char, but some CJK extension characters
      // (e.g. U+20B9F) use surrogate pairs and have length 2
      expect([...k.character]).toHaveLength(1);
      expect(typeof k.radical).toBe("string");
      expect(typeof k.radicalGroup).toBe("number");
      expect(k.radicalGroup).toBeGreaterThanOrEqual(1);
      expect(k.radicalGroup).toBeLessThanOrEqual(214);
      expect(typeof k.strokeCount).toBe("number");
      expect(Array.isArray(k.onYomi)).toBe(true);
      expect(Array.isArray(k.kunYomi)).toBe(true);
      expect(Array.isArray(k.meanings)).toBe(true);
      expect(k.meanings.length).toBeGreaterThan(0);
      expect(typeof k.grade).toBe("number");
      expect(Array.isArray(k.examples)).toBe(true);
    }
  });
});

describe("getKanjiByChar", () => {
  test("returns correct entry for known character", () => {
    const result = getKanjiByChar("\u5C71");
    expect(result).toBeDefined();
    expect(result!.character).toBe("\u5C71");
    expect(result!.meanings).toContain("mountain");
  });

  test("returns undefined for unknown character", () => {
    expect(getKanjiByChar("\u9F8D")).toBeUndefined();
  });
});

describe("getKanjiByGrade", () => {
  test("returns entries for grade 1", () => {
    const result = getKanjiByGrade(1);
    expect(result.length).toBeGreaterThan(0);
    for (const k of result) {
      expect(k.grade).toBe(1);
    }
  });

  test("returns empty array for unused grade value", () => {
    const result = getKanjiByGrade(999);
    expect(result).toHaveLength(0);
  });
});

describe("getKanjiGrades", () => {
  test("returns sorted grade list as strings", () => {
    const grades = getKanjiGrades();
    expect(grades.length).toBe(7);
    expect(grades[0]).toBe("1");
    expect(grades[6]).toBe("7");
  });
});

describe("getKanjiByRadical", () => {
  test("returns entries for a known radical", () => {
    const result = getKanjiByRadical("\u6728");
    expect(result.length).toBeGreaterThan(0);
    for (const k of result) {
      expect(k.radical).toBe("\u6728");
    }
  });

  test("returns empty array for unknown radical", () => {
    const result = getKanjiByRadical("\uFFFF");
    expect(result).toHaveLength(0);
  });
});

describe("getKanjiRadicals", () => {
  test("returns non-empty sorted radical list", () => {
    const radicals = getKanjiRadicals();
    expect(radicals.length).toBeGreaterThan(0);
    // Each radical should be a string
    for (const r of radicals) {
      expect(typeof r).toBe("string");
      expect(r.length).toBeGreaterThan(0);
    }
  });
});

describe("getKanjiByStrokeCount", () => {
  test("returns entries for stroke count 3", () => {
    const result = getKanjiByStrokeCount(3);
    expect(result.length).toBeGreaterThan(0);
    for (const k of result) {
      expect(k.strokeCount).toBe(3);
    }
  });

  test("returns empty array for unused stroke count", () => {
    const result = getKanjiByStrokeCount(999);
    expect(result).toHaveLength(0);
  });
});

describe("getKanjiStrokeCounts", () => {
  test("returns sorted stroke count list", () => {
    const counts = getKanjiStrokeCounts();
    expect(counts.length).toBeGreaterThan(0);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThan(counts[i - 1]);
    }
  });
});

describe("getAllKanjiChars", () => {
  test("returns 2136 characters", () => {
    expect(getAllKanjiChars()).toHaveLength(2136);
  });

  test("contains known characters", () => {
    const chars = getAllKanjiChars();
    expect(chars).toContain("\u5C71");
    expect(chars).toContain("\u5DDD");
    expect(chars).toContain("\u65E5");
  });
});
