import { describe, expect, test } from "vitest";
import { buildSearchIndex } from "../build-index";
import { getAllGameSlugs } from "@/lib/games/registry";
import type { ContentType } from "../types";

describe("buildSearchIndex", () => {
  const index = buildSearchIndex();

  test("returns a non-empty array", () => {
    expect(index.length).toBeGreaterThan(0);
  });

  test("includes all 8 content types", () => {
    const types = new Set(index.map((doc) => doc.type));
    const expectedTypes: ContentType[] = [
      "tool",
      "game",
      "cheatsheet",
      "kanji",
      "yoji",
      "color",
      "blog",
      "quiz",
    ];
    for (const type of expectedTypes) {
      expect(types.has(type)).toBe(true);
    }
  });

  test("every document has required fields", () => {
    for (const doc of index) {
      expect(doc.id).toBeTruthy();
      expect(doc.type).toBeTruthy();
      expect(doc.title).toBeTruthy();
      expect(doc.url).toBeTruthy();
      expect(doc.url).toMatch(/^\//);
    }
  });

  test("all document ids are unique", () => {
    const ids = index.map((doc) => doc.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("URLs match the correct pattern for each content type", () => {
    for (const doc of index) {
      switch (doc.type) {
        case "tool":
          expect(doc.url).toMatch(/^\/tools\//);
          break;
        case "game":
          expect(doc.url).toMatch(/^\/games\//);
          break;
        case "cheatsheet":
          expect(doc.url).toMatch(/^\/cheatsheets\//);
          break;
        case "kanji":
          expect(doc.url).toMatch(/^\/dictionary\/kanji\//);
          break;
        case "yoji":
          expect(doc.url).toMatch(/^\/dictionary\/yoji\//);
          break;
        case "color":
          expect(doc.url).toMatch(/^\/dictionary\/colors\//);
          break;
        case "blog":
          expect(doc.url).toMatch(/^\/blog\//);
          break;
        case "quiz":
          expect(doc.url).toMatch(/^\/quiz\//);
          break;
      }
    }
  });

  test("game slugs match known game page slugs", () => {
    // Validates that search index is in sync with the game registry
    const gameDocsInIndex = index.filter((doc) => doc.type === "game");
    const gameSlugsInIndex = gameDocsInIndex.map((doc) =>
      doc.id.replace("game:", ""),
    );

    expect(gameSlugsInIndex.sort()).toEqual([...getAllGameSlugs()].sort());

    // All game slugs should be valid URL-safe strings
    for (const slug of gameSlugsInIndex) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  test("keywords are arrays for all documents", () => {
    for (const doc of index) {
      expect(Array.isArray(doc.keywords)).toBe(true);
    }
  });
});
