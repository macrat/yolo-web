import { describe, test, expect } from "vitest";
import sitemap from "../sitemap";
import { allGameMetas } from "@/play/games/registry";
import { allQuizMetas } from "@/play/quiz/registry";
import { allCheatsheetMetas } from "@/cheatsheets/registry";
import { BASE_URL } from "@/lib/constants";
import { getAllBlogPosts } from "@/blog/_lib/blog";
import { ABOUT_LAST_MODIFIED } from "@/app/about/meta";

describe("sitemap", () => {
  test("sitemap includes /play list page", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${BASE_URL}/play`);
  });

  test("sitemap does not include /games list page", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).not.toContain(`${BASE_URL}/games`);
  });

  test("sitemap includes /play/kanji-kanaru with monthly frequency", () => {
    const entries = sitemap();
    const kanjiEntry = entries.find((e) =>
      e.url.includes("/play/kanji-kanaru"),
    );
    expect(kanjiEntry?.changeFrequency).toBe("monthly");
  });

  test("sitemap includes /play/yoji-kimeru with monthly frequency", () => {
    const entries = sitemap();
    const yojiEntry = entries.find((e) => e.url.includes("/play/yoji-kimeru"));
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

  test("/about lastModified uses about page meta definition", () => {
    const entries = sitemap();
    const aboutEntry = entries.find((e) => e.url === `${BASE_URL}/about`);

    expect(aboutEntry).toBeDefined();
    expect(aboutEntry?.lastModified).toEqual(new Date(ABOUT_LAST_MODIFIED));
  });

  test("/blog lastModified is the latest blog post date", () => {
    const entries = sitemap();
    const blogListEntry = entries.find((e) => e.url === `${BASE_URL}/blog`);
    expect(blogListEntry).toBeDefined();
    expect(blogListEntry?.lastModified).toBeInstanceOf(Date);

    const allPosts = getAllBlogPosts();
    const expectedLatestTime = Math.max(
      ...allPosts.map((post) =>
        new Date(post.updated_at || post.published_at).getTime(),
      ),
    );

    expect((blogListEntry!.lastModified as Date).getTime()).toBe(
      expectedLatestTime,
    );
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
          typeof e.url === "string" && e.url.endsWith(`/play/${meta.slug}`),
      );
      expect(quizEntry).toBeDefined();
      expect(quizEntry?.lastModified).toEqual(
        new Date(meta.updatedAt || meta.publishedAt),
      );
    }
  });

  test("sitemap does not include /quiz list page", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).not.toContain(`${BASE_URL}/quiz`);
  });

  test("sitemap does not include /quiz/:slug entries", () => {
    const entries = sitemap();
    const quizEntries = entries.filter(
      (e) => typeof e.url === "string" && e.url.includes(`${BASE_URL}/quiz/`),
    );
    expect(quizEntries).toHaveLength(0);
  });

  test("sitemap includes /play/daily entry", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${BASE_URL}/play/daily`);
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

  test("sitemap does not include quiz result pages", () => {
    const entries = sitemap();
    const resultEntries = entries.filter(
      (e) =>
        typeof e.url === "string" &&
        e.url.includes("/play/") &&
        e.url.includes("/result/"),
    );
    expect(resultEntries).toHaveLength(0);
  });

  test("sitemap does not include kanji detail pages", () => {
    const entries = sitemap();
    const kanjiDetailEntries = entries.filter(
      (e) => typeof e.url === "string" && /\/dictionary\/kanji\/.+/.test(e.url),
    );
    expect(kanjiDetailEntries).toHaveLength(0);
  });

  test("sitemap does not include yoji detail pages", () => {
    const entries = sitemap();
    const yojiDetailEntries = entries.filter(
      (e) => typeof e.url === "string" && /\/dictionary\/yoji\/.+/.test(e.url),
    );
    expect(yojiDetailEntries).toHaveLength(0);
  });

  test("sitemap includes kanji and yoji list pages", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${BASE_URL}/dictionary/kanji`);
    expect(urls).toContain(`${BASE_URL}/dictionary/yoji`);
  });

  test("sitemap includes humor dictionary list page", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${BASE_URL}/dictionary/humor`);
  });

  test("sitemap includes humor dictionary entry pages", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    // 少なくとも1つのエントリページが含まれることを確認
    const humorEntries = urls.filter((url) =>
      url.startsWith(`${BASE_URL}/dictionary/humor/`),
    );
    expect(humorEntries.length).toBeGreaterThan(0);
  });

  test("sitemap does not include paginated list pages", () => {
    const entries = sitemap();
    const paginatedListPathPattern =
      /^https?:\/\/[^/]+\/(tools\/page\/\d+|blog\/page\/\d+|blog\/category\/[^/]+\/page\/\d+)$/;

    const paginatedListEntries = entries.filter(
      (e) => typeof e.url === "string" && paginatedListPathPattern.test(e.url),
    );

    expect(paginatedListEntries).toHaveLength(0);
  });

  test("game page lastModified matches each game updatedAt or publishedAt", () => {
    const entries = sitemap();
    for (const game of allGameMetas) {
      const gameEntry = entries.find(
        (e) =>
          typeof e.url === "string" && e.url.endsWith(`/play/${game.slug}`),
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
      "/play",
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
