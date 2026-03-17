import { describe, test, expect } from "vitest";
import {
  gameMetaToPlayContentMeta,
  allPlayContents,
  playContentBySlug,
  getPlayContentsByCategory,
  getAllPlaySlugs,
} from "../registry";
import { allGameMetas } from "@/games/registry";

const EXPECTED_GAME_SLUGS = [
  "kanji-kanaru",
  "yoji-kimeru",
  "nakamawake",
  "irodori",
];

describe("gameMetaToPlayContentMeta", () => {
  test("converts a GameMeta to PlayContentMeta with correct fields", () => {
    const gameMeta = allGameMetas[0];
    const playMeta = gameMetaToPlayContentMeta(gameMeta);

    expect(playMeta.slug).toBe(gameMeta.slug);
    expect(playMeta.title).toBe(gameMeta.title);
    expect(playMeta.description).toBe(gameMeta.description);
    expect(playMeta.shortDescription).toBe(gameMeta.shortDescription);
    expect(playMeta.icon).toBe(gameMeta.icon);
    expect(playMeta.accentColor).toBe(gameMeta.accentColor);
    expect(playMeta.keywords).toBe(gameMeta.keywords);
    expect(playMeta.publishedAt).toBe(gameMeta.publishedAt);
    expect(playMeta.trustLevel).toBe(gameMeta.trustLevel);
  });

  test("sets contentType to 'game'", () => {
    const playMeta = gameMetaToPlayContentMeta(allGameMetas[0]);
    expect(playMeta.contentType).toBe("game");
  });

  test("sets category to 'game'", () => {
    const playMeta = gameMetaToPlayContentMeta(allGameMetas[0]);
    expect(playMeta.category).toBe("game");
  });

  test("preserves optional updatedAt when present", () => {
    const gameMeta = allGameMetas.find((m) => m.updatedAt !== undefined);
    expect(gameMeta).toBeDefined();
    const playMeta = gameMetaToPlayContentMeta(gameMeta!);
    expect(playMeta.updatedAt).toBe(gameMeta!.updatedAt);
  });

  test("preserves optional trustNote when present", () => {
    const gameMeta = allGameMetas.find((m) => m.trustNote !== undefined);
    expect(gameMeta).toBeDefined();
    const playMeta = gameMetaToPlayContentMeta(gameMeta!);
    expect(playMeta.trustNote).toBe(gameMeta!.trustNote);
  });

  test("description is the top-level description, not seo.description", () => {
    const gameMeta = allGameMetas[0];
    const playMeta = gameMetaToPlayContentMeta(gameMeta);
    // Top-level description and seo.description are different values
    expect(playMeta.description).toBe(gameMeta.description);
    expect(playMeta.description).not.toBe(gameMeta.seo.description);
  });
});

describe("allPlayContents", () => {
  test("contains exactly 4 games", () => {
    expect(allPlayContents).toHaveLength(4);
  });

  test("contains all expected game slugs", () => {
    const slugs = allPlayContents.map((c) => c.slug);
    for (const slug of EXPECTED_GAME_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });

  test("all entries have contentType 'game'", () => {
    for (const content of allPlayContents) {
      expect(content.contentType).toBe("game");
    }
  });
});

describe("playContentBySlug", () => {
  test("can look up each game by slug", () => {
    for (const slug of EXPECTED_GAME_SLUGS) {
      expect(playContentBySlug.has(slug)).toBe(true);
      expect(playContentBySlug.get(slug)?.slug).toBe(slug);
    }
  });

  test("returns undefined for an unknown slug", () => {
    expect(playContentBySlug.get("nonexistent-content")).toBeUndefined();
  });
});

describe("getPlayContentsByCategory", () => {
  test("returns all 4 games for category 'game'", () => {
    const results = getPlayContentsByCategory("game");
    expect(results).toHaveLength(4);
  });

  test("returns empty array for a category with no matching contents", () => {
    // "fortune" は有効な category 値だが、現在コンテンツは存在しないため 0 件になる
    expect(getPlayContentsByCategory("fortune")).toHaveLength(0);
  });
});

describe("getAllPlaySlugs", () => {
  test("returns slugs for all 4 games", () => {
    const slugs = getAllPlaySlugs();
    expect(slugs).toHaveLength(4);
    for (const slug of EXPECTED_GAME_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });
});
