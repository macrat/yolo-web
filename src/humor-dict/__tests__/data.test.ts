import { describe, expect, test } from "vitest";
import { getAllEntries, getEntryBySlug, getAllSlugs } from "../data";

describe("getAllEntries", () => {
  test("returns an array", () => {
    expect(Array.isArray(getAllEntries())).toBe(true);
  });

  test("returns entries in 五十音順 (sorted by reading)", () => {
    const entries = getAllEntries();
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].reading <= entries[i].reading).toBe(true);
    }
  });

  test("each entry has all required fields", () => {
    for (const entry of getAllEntries()) {
      expect(typeof entry.slug).toBe("string");
      expect(entry.slug.length).toBeGreaterThan(0);

      expect(typeof entry.word).toBe("string");
      expect(entry.word.length).toBeGreaterThan(0);

      expect(typeof entry.reading).toBe("string");
      expect(entry.reading.length).toBeGreaterThan(0);

      expect(typeof entry.definition).toBe("string");
      expect(entry.definition.length).toBeGreaterThan(0);

      expect(typeof entry.explanation).toBe("string");
      expect(entry.explanation.length).toBeGreaterThan(0);

      expect(typeof entry.example).toBe("string");
      expect(entry.example.length).toBeGreaterThan(0);

      expect(Array.isArray(entry.relatedSlugs)).toBe(true);
    }
  });

  test("all slugs are unique", () => {
    const entries = getAllEntries();
    const slugs = entries.map((e) => e.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });
});

describe("getEntryBySlug", () => {
  test("returns undefined for unknown slug", () => {
    expect(getEntryBySlug("no-such-slug")).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(getEntryBySlug("")).toBeUndefined();
  });
});

describe("getAllSlugs", () => {
  test("returns an array of strings", () => {
    const slugs = getAllSlugs();
    expect(Array.isArray(slugs)).toBe(true);
    for (const slug of slugs) {
      expect(typeof slug).toBe("string");
    }
  });

  test("slugs match getAllEntries slugs", () => {
    const entrySlugs = getAllEntries().map((e) => e.slug);
    const slugs = getAllSlugs();
    expect(slugs).toEqual(entrySlugs);
  });
});
