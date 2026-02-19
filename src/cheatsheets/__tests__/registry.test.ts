import { expect, test, describe } from "vitest";
import {
  cheatsheetsBySlug,
  allCheatsheetMetas,
  getAllCheatsheetSlugs,
} from "../registry";
import { toolsBySlug } from "@/tools/registry";

describe("cheatsheet registry", () => {
  test("all slugs are unique", () => {
    const slugs = getAllCheatsheetSlugs();
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  test("all meta required fields are present", () => {
    for (const meta of allCheatsheetMetas) {
      expect(meta.slug).toBeTruthy();
      expect(meta.name).toBeTruthy();
      expect(meta.nameEn).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.shortDescription).toBeTruthy();
      expect(meta.keywords.length).toBeGreaterThan(0);
      expect(meta.category).toBeTruthy();
      expect(meta.sections.length).toBeGreaterThan(0);
      expect(meta.publishedAt).toBeTruthy();
    }
  });

  test("relatedCheatsheetSlugs reference existing slugs", () => {
    const allSlugs = new Set(getAllCheatsheetSlugs());
    for (const meta of allCheatsheetMetas) {
      for (const relatedSlug of meta.relatedCheatsheetSlugs) {
        expect(allSlugs.has(relatedSlug)).toBe(true);
      }
    }
  });

  test("relatedToolSlugs reference existing tool slugs", () => {
    for (const meta of allCheatsheetMetas) {
      for (const toolSlug of meta.relatedToolSlugs) {
        expect(toolsBySlug.has(toolSlug)).toBe(true);
      }
    }
  });

  test("cheatsheetsBySlug contains all entries", () => {
    expect(cheatsheetsBySlug.size).toBe(allCheatsheetMetas.length);
  });

  test("getAllCheatsheetSlugs returns correct count", () => {
    expect(getAllCheatsheetSlugs().length).toBe(3);
  });
});
