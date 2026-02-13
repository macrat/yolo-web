import { describe, test, expect } from "vitest";
import sitemap from "../sitemap";

describe("sitemap", () => {
  test("sitemap includes /games", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toEqual(
      expect.arrayContaining([expect.stringContaining("/games")]),
    );
  });

  test("sitemap includes /games/kanji-kanaru with daily frequency", () => {
    const entries = sitemap();
    const kanjiEntry = entries.find((e) =>
      e.url.includes("/games/kanji-kanaru"),
    );
    expect(kanjiEntry?.changeFrequency).toBe("daily");
  });
});
