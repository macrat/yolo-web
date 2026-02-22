import { describe, test, expect } from "vitest";
import {
  allGameMetas,
  gameBySlug,
  getAllGameSlugs,
  getGamePath,
} from "../registry";

describe("allGameMetas", () => {
  test("is not empty", () => {
    expect(allGameMetas.length).toBeGreaterThan(0);
  });

  test("all slugs are URL-safe strings", () => {
    for (const meta of allGameMetas) {
      expect(meta.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  test("slugs are unique", () => {
    const slugs = allGameMetas.map((m) => m.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  test("all required string fields are non-empty", () => {
    for (const meta of allGameMetas) {
      expect(meta.slug).toBeTruthy();
      expect(meta.title).toBeTruthy();
      expect(meta.shortDescription).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.icon).toBeTruthy();
      expect(meta.accentColor).toBeTruthy();
      expect(meta.difficulty).toBeTruthy();
      expect(meta.statsKey).toBeTruthy();
      expect(meta.ogpSubtitle).toBeTruthy();
    }
  });

  test("accentColor is a valid hex color", () => {
    for (const meta of allGameMetas) {
      expect(meta.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  test("statsKey follows the slug-stats pattern", () => {
    for (const meta of allGameMetas) {
      expect(meta.statsKey).toBe(`${meta.slug}-stats`);
    }
  });

  test("keywords is a non-empty array", () => {
    for (const meta of allGameMetas) {
      expect(Array.isArray(meta.keywords)).toBe(true);
      expect(meta.keywords.length).toBeGreaterThan(0);
    }
  });

  test("sitemap has valid changeFrequency and priority", () => {
    const validFrequencies = ["daily", "weekly", "monthly"];
    for (const meta of allGameMetas) {
      expect(validFrequencies).toContain(meta.sitemap.changeFrequency);
      expect(meta.sitemap.priority).toBeGreaterThanOrEqual(0);
      expect(meta.sitemap.priority).toBeLessThanOrEqual(1);
    }
  });
});

describe("gameBySlug", () => {
  test("all slugs are lookupable", () => {
    for (const meta of allGameMetas) {
      const found = gameBySlug.get(meta.slug);
      expect(found).toBeDefined();
      expect(found).toBe(meta);
    }
  });

  test("returns undefined for unknown slug", () => {
    expect(gameBySlug.get("nonexistent-game")).toBeUndefined();
  });
});

describe("getAllGameSlugs", () => {
  test("returns all slugs", () => {
    const slugs = getAllGameSlugs();
    expect(slugs).toHaveLength(allGameMetas.length);
    for (const meta of allGameMetas) {
      expect(slugs).toContain(meta.slug);
    }
  });
});

describe("getGamePath", () => {
  test("returns correct path", () => {
    expect(getGamePath("kanji-kanaru")).toBe("/games/kanji-kanaru");
    expect(getGamePath("irodori")).toBe("/games/irodori");
  });
});
