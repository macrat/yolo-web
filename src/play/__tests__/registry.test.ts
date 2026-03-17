import { describe, test, expect } from "vitest";
import {
  gameMetaToPlayContentMeta,
  quizMetaToPlayContentMeta,
  fortunePlayContentMeta,
  allPlayContents,
  playContentBySlug,
  getPlayContentsByCategory,
  getAllPlaySlugs,
} from "../registry";
import { allGameMetas } from "@/play/games/registry";
import { allQuizMetas } from "@/quiz/registry";

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

describe("allPlayContents (ゲーム4種のみの旧テスト)", () => {
  test("contains all expected game slugs", () => {
    const slugs = allPlayContents.map((c) => c.slug);
    for (const slug of EXPECTED_GAME_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });
});

describe("quizMetaToPlayContentMeta", () => {
  test("converts a QuizMeta to PlayContentMeta with correct fields", () => {
    const quizMeta = allQuizMetas[0];
    const playMeta = quizMetaToPlayContentMeta(quizMeta);

    expect(playMeta.slug).toBe(quizMeta.slug);
    expect(playMeta.title).toBe(quizMeta.title);
    expect(playMeta.description).toBe(quizMeta.description);
    expect(playMeta.shortDescription).toBe(quizMeta.shortDescription);
    expect(playMeta.icon).toBe(quizMeta.icon);
    expect(playMeta.accentColor).toBe(quizMeta.accentColor);
    expect(playMeta.keywords).toBe(quizMeta.keywords);
    expect(playMeta.publishedAt).toBe(quizMeta.publishedAt);
    expect(playMeta.trustLevel).toBe(quizMeta.trustLevel);
  });

  test("sets contentType to 'quiz'", () => {
    const playMeta = quizMetaToPlayContentMeta(allQuizMetas[0]);
    expect(playMeta.contentType).toBe("quiz");
  });

  test("maps category 'knowledge' correctly", () => {
    const knowledgeQuiz = allQuizMetas.find((m) => m.category === "knowledge");
    expect(knowledgeQuiz).toBeDefined();
    const playMeta = quizMetaToPlayContentMeta(knowledgeQuiz!);
    expect(playMeta.category).toBe("knowledge");
  });

  test("maps category 'personality' correctly", () => {
    const personalityQuiz = allQuizMetas.find(
      (m) => m.category === "personality",
    );
    expect(personalityQuiz).toBeDefined();
    const playMeta = quizMetaToPlayContentMeta(personalityQuiz!);
    expect(playMeta.category).toBe("personality");
  });

  test("does not include questionCount in PlayContentMeta", () => {
    const playMeta = quizMetaToPlayContentMeta(allQuizMetas[0]);
    expect(Object.keys(playMeta)).not.toContain("questionCount");
  });
});

describe("fortunePlayContentMeta", () => {
  test("has slug 'daily'", () => {
    expect(fortunePlayContentMeta.slug).toBe("daily");
  });

  test("has contentType 'fortune'", () => {
    expect(fortunePlayContentMeta.contentType).toBe("fortune");
  });

  test("has category 'fortune'", () => {
    expect(fortunePlayContentMeta.category).toBe("fortune");
  });

  test("has correct title", () => {
    expect(fortunePlayContentMeta.title).toBe("今日のユーモア運勢");
  });

  test("has correct accentColor", () => {
    expect(fortunePlayContentMeta.accentColor).toBe("#7c3aed");
  });

  test("has trustLevel 'generated'", () => {
    expect(fortunePlayContentMeta.trustLevel).toBe("generated");
  });
});

describe("allPlayContents (19種)", () => {
  test("contains exactly 19 contents (4 games + 14 quizzes + 1 fortune)", () => {
    // タスク1完了後: ゲーム4種 + クイズ14種 + Fortune 1種 = 19種
    expect(allPlayContents).toHaveLength(19);
  });

  test("contains all 4 game slugs", () => {
    const slugs = allPlayContents.map((c) => c.slug);
    for (const slug of EXPECTED_GAME_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });

  test("contains all 14 quiz slugs", () => {
    const slugs = allPlayContents.map((c) => c.slug);
    for (const quizMeta of allQuizMetas) {
      expect(slugs).toContain(quizMeta.slug);
    }
  });

  test("contains fortune slug 'daily'", () => {
    const slugs = allPlayContents.map((c) => c.slug);
    expect(slugs).toContain("daily");
  });
});

describe("getPlayContentsByCategory (19種)", () => {
  test("returns all 4 games for category 'game'", () => {
    const results = getPlayContentsByCategory("game");
    expect(results).toHaveLength(4);
  });

  test("returns 1 fortune for category 'fortune'", () => {
    const results = getPlayContentsByCategory("fortune");
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("daily");
  });

  test("returns knowledge quizzes for category 'knowledge'", () => {
    const results = getPlayContentsByCategory("knowledge");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.contentType).toBe("quiz");
    }
  });

  test("returns personality quizzes for category 'personality'", () => {
    const results = getPlayContentsByCategory("personality");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.contentType).toBe("quiz");
    }
  });

  test("total across all categories equals 19", () => {
    const game = getPlayContentsByCategory("game").length;
    const knowledge = getPlayContentsByCategory("knowledge").length;
    const personality = getPlayContentsByCategory("personality").length;
    const fortune = getPlayContentsByCategory("fortune").length;
    expect(game + knowledge + personality + fortune).toBe(19);
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

describe("getPlayContentsByCategory (ゲームのみ旧テスト)", () => {
  test("returns all 4 games for category 'game'", () => {
    const results = getPlayContentsByCategory("game");
    expect(results).toHaveLength(4);
  });
});

describe("getAllPlaySlugs", () => {
  test("returns slugs for all 19 contents", () => {
    const slugs = getAllPlaySlugs();
    expect(slugs).toHaveLength(19);
    for (const slug of EXPECTED_GAME_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });
});
