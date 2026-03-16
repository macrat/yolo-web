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

describe("entry count", () => {
  test("has at least 20 entries", () => {
    expect(getAllEntries().length).toBeGreaterThanOrEqual(20);
  });

  test("has exactly 30 entries", () => {
    expect(getAllEntries().length).toBe(30);
  });
});

describe("relatedSlugs coverage", () => {
  test("each relatedSlug in any entry must refer to an existing slug", () => {
    const allSlugs = new Set(getAllEntries().map((e) => e.slug));
    for (const entry of getAllEntries()) {
      for (const related of entry.relatedSlugs) {
        expect(allSlugs.has(related)).toBe(true);
      }
    }
  });

  test("each entry is referenced by at least one other entry's relatedSlugs", () => {
    const entries = getAllEntries();
    const allSlugs = entries.map((e) => e.slug);
    const referenced = new Set<string>();
    for (const entry of entries) {
      for (const related of entry.relatedSlugs) {
        referenced.add(related);
      }
    }
    for (const slug of allSlugs) {
      expect(referenced.has(slug)).toBe(true);
    }
  });

  test("each entry has 2 to 3 relatedSlugs", () => {
    for (const entry of getAllEntries()) {
      expect(entry.relatedSlugs.length).toBeGreaterThanOrEqual(2);
      expect(entry.relatedSlugs.length).toBeLessThanOrEqual(3);
    }
  });
});

describe("entry content quality", () => {
  test("definition is 50-150 characters", () => {
    for (const entry of getAllEntries()) {
      expect(entry.definition.length).toBeGreaterThanOrEqual(50);
      expect(entry.definition.length).toBeLessThanOrEqual(150);
    }
  });

  test("explanation is 150-350 characters", () => {
    for (const entry of getAllEntries()) {
      expect(entry.explanation.length).toBeGreaterThanOrEqual(150);
      expect(entry.explanation.length).toBeLessThanOrEqual(350);
    }
  });

  test("example is 50-150 characters", () => {
    for (const entry of getAllEntries()) {
      expect(entry.example.length).toBeGreaterThanOrEqual(50);
      expect(entry.example.length).toBeLessThanOrEqual(150);
    }
  });

  test("each entry has at least one relatedSlug", () => {
    for (const entry of getAllEntries()) {
      expect(entry.relatedSlugs.length).toBeGreaterThanOrEqual(1);
    }
  });

  test("slug contains only lowercase alphanumeric and hyphens", () => {
    for (const entry of getAllEntries()) {
      expect(entry.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
