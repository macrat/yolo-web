import { describe, test, expect } from "vitest";
import {
  TRUST_LEVEL_META,
  STATIC_PAGE_TRUST_LEVELS,
  DICTIONARY_TRUST_LEVELS,
  MEMO_TRUST_LEVEL,
  MEMO_TRUST_NOTE,
} from "@/lib/trust-levels";

const ALL_LEVELS = ["verified", "curated", "generated"] as const;

describe("TRUST_LEVEL_META", () => {
  test("defines metadata for all 3 trust levels", () => {
    expect(Object.keys(TRUST_LEVEL_META)).toHaveLength(3);
    for (const level of ALL_LEVELS) {
      expect(TRUST_LEVEL_META[level]).toBeDefined();
    }
  });

  test.each(ALL_LEVELS)("%s has label, description, and icon", (level) => {
    const meta = TRUST_LEVEL_META[level];
    expect(typeof meta.label).toBe("string");
    expect(meta.label.length).toBeGreaterThan(0);
    expect(typeof meta.description).toBe("string");
    expect(meta.description.length).toBeGreaterThan(0);
    expect(typeof meta.icon).toBe("string");
    expect(meta.icon.length).toBeGreaterThan(0);
  });
});

describe("STATIC_PAGE_TRUST_LEVELS", () => {
  test("all values are valid TrustLevel", () => {
    for (const value of Object.values(STATIC_PAGE_TRUST_LEVELS)) {
      expect(ALL_LEVELS).toContain(value);
    }
  });

  test("includes / and /about", () => {
    expect(STATIC_PAGE_TRUST_LEVELS["/"]).toBe("generated");
    expect(STATIC_PAGE_TRUST_LEVELS["/about"]).toBe("generated");
  });
});

describe("DICTIONARY_TRUST_LEVELS", () => {
  test("all values are valid TrustLevel", () => {
    for (const value of Object.values(DICTIONARY_TRUST_LEVELS)) {
      expect(ALL_LEVELS).toContain(value);
    }
  });

  test("includes expected paths", () => {
    expect(DICTIONARY_TRUST_LEVELS["/dictionary/kanji"]).toBe("curated");
    expect(DICTIONARY_TRUST_LEVELS["/dictionary/yoji"]).toBe("curated");
    expect(DICTIONARY_TRUST_LEVELS["/colors"]).toBe("curated");
  });
});

describe("MEMO constants", () => {
  test("MEMO_TRUST_LEVEL is generated", () => {
    expect(MEMO_TRUST_LEVEL).toBe("generated");
  });

  test("MEMO_TRUST_NOTE is a non-empty string", () => {
    expect(typeof MEMO_TRUST_NOTE).toBe("string");
    expect(MEMO_TRUST_NOTE.length).toBeGreaterThan(0);
  });
});
