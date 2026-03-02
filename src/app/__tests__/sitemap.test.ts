import { describe, test, expect } from "vitest";
import sitemap from "../sitemap";
import { allGameMetas } from "@/games/registry";
import { allQuizMetas } from "@/quiz/registry";
import { allCheatsheetMetas } from "@/cheatsheets/registry";
import { BASE_URL } from "@/lib/constants";

describe("sitemap", () => {
  test("sitemap includes /games", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toEqual(
      expect.arrayContaining([expect.stringContaining("/games")]),
    );
  });

  test("sitemap includes /games/kanji-kanaru with monthly frequency", () => {
    const entries = sitemap();
    const kanjiEntry = entries.find((e) =>
      e.url.includes("/games/kanji-kanaru"),
    );
    expect(kanjiEntry?.changeFrequency).toBe("monthly");
  });

  test("sitemap includes /games/yoji-kimeru with monthly frequency", () => {
    const entries = sitemap();
    const yojiEntry = entries.find((e) => e.url.includes("/games/yoji-kimeru"));
    expect(yojiEntry).toBeDefined();
    expect(yojiEntry?.changeFrequency).toBe("monthly");
  });

  test("no entry uses current build time as lastModified", () => {
    const before = Date.now();
    const entries = sitemap();
    // All lastModified values should be well before the test execution time
    // (fixed dates in the past, not new Date() at build time)
    for (const entry of entries) {
      if (entry.lastModified instanceof Date) {
        expect(entry.lastModified.getTime()).toBeLessThan(before);
      }
    }
  });

  test("blog post lastModified reflects actual post date", () => {
    const entries = sitemap();
    const blogEntries = entries.filter(
      (e) =>
        typeof e.url === "string" &&
        e.url.includes("/blog/") &&
        !e.url.includes("/category/") &&
        !e.url.includes("/page/"),
    );
    // Blog entries should exist and have lastModified in the past
    expect(blogEntries.length).toBeGreaterThan(0);
    const now = Date.now();
    for (const entry of blogEntries) {
      if (entry.lastModified instanceof Date) {
        expect(entry.lastModified.getTime()).toBeLessThan(now);
      }
    }
  });

  test("quiz page lastModified matches each quiz updatedAt or publishedAt", () => {
    const entries = sitemap();
    for (const meta of allQuizMetas) {
      const quizEntry = entries.find(
        (e) =>
          typeof e.url === "string" && e.url.endsWith(`/quiz/${meta.slug}`),
      );
      expect(quizEntry).toBeDefined();
      expect(quizEntry?.lastModified).toEqual(
        new Date(meta.updatedAt || meta.publishedAt),
      );
    }
  });

  test("cheatsheet page lastModified matches each cheatsheet updatedAt or publishedAt", () => {
    const entries = sitemap();
    for (const meta of allCheatsheetMetas) {
      const csEntry = entries.find(
        (e) =>
          typeof e.url === "string" &&
          e.url.endsWith(`/cheatsheets/${meta.slug}`),
      );
      expect(csEntry).toBeDefined();
      expect(csEntry?.lastModified).toEqual(
        new Date(meta.updatedAt || meta.publishedAt),
      );
    }
  });

  test("game page lastModified matches each game updatedAt or publishedAt", () => {
    const entries = sitemap();
    for (const game of allGameMetas) {
      const gameEntry = entries.find(
        (e) =>
          typeof e.url === "string" && e.url.endsWith(`/games/${game.slug}`),
      );
      expect(gameEntry).toBeDefined();
      expect(gameEntry?.lastModified).toEqual(
        new Date(game.updatedAt || game.publishedAt),
      );
    }
  });

  test("homepage lastModified is >= all content type list page lastModified dates", () => {
    const entries = sitemap();

    // Find the homepage entry (URL is exactly BASE_URL)
    const homepageEntry = entries.find((e) => e.url === BASE_URL);
    expect(homepageEntry).toBeDefined();
    expect(homepageEntry?.lastModified).toBeInstanceOf(Date);
    const homepageTime = (homepageEntry!.lastModified as Date).getTime();

    // All content type list pages whose lastModified should be reflected in homepage
    const contentListPaths = [
      "/blog",
      "/tools",
      "/games",
      "/memos",
      "/quiz",
      "/cheatsheets",
      "/dictionary",
    ];

    for (const path of contentListPaths) {
      const listEntry = entries.find((e) => e.url === `${BASE_URL}${path}`);
      expect(listEntry).toBeDefined();
      if (listEntry?.lastModified instanceof Date) {
        expect(homepageTime).toBeGreaterThanOrEqual(
          listEntry.lastModified.getTime(),
        );
      }
    }
  });
});
