import { describe, test, expect } from "vitest";
import {
  gameMetaToPlayContentMeta,
  quizMetaToPlayContentMeta,
  fortunePlayContentMeta,
  allPlayContents,
  playContentBySlug,
  getPlayContentsByCategory,
  getAllPlaySlugs,
  DAILY_UPDATE_SLUGS,
  PLAY_FEATURED_ITEMS,
  getPlayFeaturedContents,
  getHeroPickupContents,
  getDefaultTabContents,
  getNonFortuneContents,
} from "../registry";
import { allGameMetas } from "@/play/games/registry";
import { allQuizMetas } from "@/play/quiz/registry";

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

describe("allPlayContents (20種)", () => {
  test("contains exactly 20 contents (4 games + 15 quizzes + 1 fortune)", () => {
    // ゲーム4種 + クイズ15種 + Fortune 1種 = 20種
    expect(allPlayContents).toHaveLength(20);
  });

  test("contains all 4 game slugs", () => {
    const slugs = allPlayContents.map((c) => c.slug);
    for (const slug of EXPECTED_GAME_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });

  test("contains all 15 quiz slugs", () => {
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

describe("getPlayContentsByCategory (20種)", () => {
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

  test("total across all categories equals 20", () => {
    const game = getPlayContentsByCategory("game").length;
    const knowledge = getPlayContentsByCategory("knowledge").length;
    const personality = getPlayContentsByCategory("personality").length;
    const fortune = getPlayContentsByCategory("fortune").length;
    expect(game + knowledge + personality + fortune).toBe(20);
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
  test("returns slugs for all 20 contents", () => {
    const slugs = getAllPlaySlugs();
    expect(slugs).toHaveLength(20);
    for (const slug of EXPECTED_GAME_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });
});

describe("quizMetaToPlayContentMeta - shortTitle フィールド (7-10)", () => {
  test("maps shortTitle from QuizMeta when present", () => {
    const quizMetaWithShortTitle = {
      ...allQuizMetas[0],
      shortTitle: "短縮タイトル",
    };
    const playMeta = quizMetaToPlayContentMeta(quizMetaWithShortTitle);
    expect(playMeta.shortTitle).toBe("短縮タイトル");
  });

  test("shortTitle is undefined when not set in QuizMeta", () => {
    const quizMetaWithoutShortTitle = { ...allQuizMetas[0] };
    delete (quizMetaWithoutShortTitle as { shortTitle?: string }).shortTitle;
    const playMeta = quizMetaToPlayContentMeta(quizMetaWithoutShortTitle);
    expect(playMeta.shortTitle).toBeUndefined();
  });

  test("science-thinking has shortTitle set in its data", () => {
    const scienceThinkingContent = playContentBySlug.get("science-thinking");
    expect(scienceThinkingContent).toBeDefined();
    expect(scienceThinkingContent?.shortTitle).toBe("理系思考タイプ診断");
  });

  test("traditional-color has shortTitle set in its data", () => {
    const traditionalColorContent = playContentBySlug.get("traditional-color");
    expect(traditionalColorContent).toBeDefined();
    expect(traditionalColorContent?.shortTitle).toBe("日本の伝統色診断");
  });

  test("kotowaza-level has shortTitle set in its data", () => {
    const content = playContentBySlug.get("kotowaza-level");
    expect(content).toBeDefined();
    expect(content?.shortTitle).toBe("ことわざ力診断");
  });

  test("yoji-personality has shortTitle set in its data", () => {
    const content = playContentBySlug.get("yoji-personality");
    expect(content).toBeDefined();
    expect(content?.shortTitle).toBe("四字熟語で性格診断");
  });
});

describe("DAILY_UPDATE_SLUGS (共有定数)", () => {
  test("is exported from registry", () => {
    expect(DAILY_UPDATE_SLUGS).toBeDefined();
  });

  test("contains 'daily'", () => {
    expect(DAILY_UPDATE_SLUGS.has("daily")).toBe(true);
  });

  test("contains 'kanji-kanaru'", () => {
    expect(DAILY_UPDATE_SLUGS.has("kanji-kanaru")).toBe(true);
  });

  test("contains 'yoji-kimeru'", () => {
    expect(DAILY_UPDATE_SLUGS.has("yoji-kimeru")).toBe(true);
  });

  test("contains 'nakamawake'", () => {
    expect(DAILY_UPDATE_SLUGS.has("nakamawake")).toBe(true);
  });

  test("contains 'irodori'", () => {
    expect(DAILY_UPDATE_SLUGS.has("irodori")).toBe(true);
  });

  test("is a Set", () => {
    expect(DAILY_UPDATE_SLUGS).toBeInstanceOf(Set);
  });
});

describe("PLAY_FEATURED_ITEMS (B-209: /playページイチオシセクション)", () => {
  test("is exported from registry", () => {
    expect(PLAY_FEATURED_ITEMS).toBeDefined();
  });

  test("contains exactly 3 items", () => {
    expect(PLAY_FEATURED_ITEMS).toHaveLength(3);
  });

  test("contains 'contrarian-fortune' with recommendReason", () => {
    const item = PLAY_FEATURED_ITEMS.find(
      (i) => i.slug === "contrarian-fortune",
    );
    expect(item).toBeDefined();
    expect(item?.recommendReason).toBe("ひと味違う運勢診断");
  });

  test("contains 'unexpected-compatibility' with recommendReason", () => {
    const item = PLAY_FEATURED_ITEMS.find(
      (i) => i.slug === "unexpected-compatibility",
    );
    expect(item).toBeDefined();
    expect(item?.recommendReason).toBe("友達にシェアしたくなる");
  });

  test("contains 'traditional-color' with recommendReason", () => {
    const item = PLAY_FEATURED_ITEMS.find(
      (i) => i.slug === "traditional-color",
    );
    expect(item).toBeDefined();
    expect(item?.recommendReason).toBe("和の色であなたを表現");
  });

  test("each slug exists in playContentBySlug", () => {
    for (const item of PLAY_FEATURED_ITEMS) {
      expect(playContentBySlug.has(item.slug)).toBe(true);
    }
  });
});

describe("getPlayFeaturedContents (B-209: /playページイチオシセクション)", () => {
  test("returns exactly 3 contents", () => {
    const contents = getPlayFeaturedContents();
    expect(contents).toHaveLength(3);
  });

  test("each content has recommendReason field", () => {
    const contents = getPlayFeaturedContents();
    for (const content of contents) {
      expect(content.recommendReason).toBeDefined();
      expect(typeof content.recommendReason).toBe("string");
      expect(content.recommendReason.length).toBeGreaterThan(0);
    }
  });

  test("content for 'contrarian-fortune' has correct recommendReason", () => {
    const contents = getPlayFeaturedContents();
    const item = contents.find((c) => c.slug === "contrarian-fortune");
    expect(item).toBeDefined();
    expect(item?.recommendReason).toBe("ひと味違う運勢診断");
  });

  test("content for 'unexpected-compatibility' has correct recommendReason", () => {
    const contents = getPlayFeaturedContents();
    const item = contents.find((c) => c.slug === "unexpected-compatibility");
    expect(item).toBeDefined();
    expect(item?.recommendReason).toBe("友達にシェアしたくなる");
  });

  test("content for 'traditional-color' has correct recommendReason", () => {
    const contents = getPlayFeaturedContents();
    const item = contents.find((c) => c.slug === "traditional-color");
    expect(item).toBeDefined();
    expect(item?.recommendReason).toBe("和の色であなたを表現");
  });

  test("each returned content has base PlayContentMeta fields (slug, title, icon, etc.)", () => {
    const contents = getPlayFeaturedContents();
    for (const content of contents) {
      expect(content.slug).toBeDefined();
      expect(content.title).toBeDefined();
      expect(content.icon).toBeDefined();
      expect(content.accentColor).toBeDefined();
      expect(content.category).toBeDefined();
    }
  });
});

describe("getHeroPickupContents (カテゴリベース自動選出)", () => {
  test("returns exactly 3 contents", () => {
    const contents = getHeroPickupContents();
    expect(contents).toHaveLength(3);
  });

  test("contains one content from each of personality, knowledge, game categories", () => {
    const contents = getHeroPickupContents();
    const categories = contents.map((c) => c.category);
    expect(categories).toContain("personality");
    expect(categories).toContain("knowledge");
    expect(categories).toContain("game");
  });

  test("does NOT include any fortune category content", () => {
    const contents = getHeroPickupContents();
    for (const content of contents) {
      expect(content.category).not.toBe("fortune");
    }
  });

  test("returns the newest content by publishedAt for each category", () => {
    const contents = getHeroPickupContents();

    for (const content of contents) {
      const categoryItems = getPlayContentsByCategory(content.category);
      const sorted = [...categoryItems].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt),
      );
      expect(content.slug).toBe(sorted[0].slug);
    }
  });

  test("each returned content exists in playContentBySlug", () => {
    const contents = getHeroPickupContents();
    for (const content of contents) {
      expect(playContentBySlug.has(content.slug)).toBe(true);
    }
  });

  test("returned contents are in the order: personality, knowledge, game", () => {
    const contents = getHeroPickupContents();
    expect(contents[0].category).toBe("personality");
    expect(contents[1].category).toBe("knowledge");
    expect(contents[2].category).toBe("game");
  });
});

describe("getDefaultTabContents (タブUI用デフォルト6件)", () => {
  test("returns exactly 6 contents", () => {
    const contents = getDefaultTabContents();
    expect(contents).toHaveLength(6);
  });

  test("does NOT include any fortune category content", () => {
    const contents = getDefaultTabContents();
    for (const content of contents) {
      expect(content.category).not.toBe("fortune");
    }
  });

  test("includes exactly 4 personality contents", () => {
    const contents = getDefaultTabContents();
    const personalityContents = contents.filter(
      (c) => c.category === "personality",
    );
    expect(personalityContents).toHaveLength(4);
  });

  test("includes exactly 1 knowledge content", () => {
    const contents = getDefaultTabContents();
    const knowledgeContents = contents.filter(
      (c) => c.category === "knowledge",
    );
    expect(knowledgeContents).toHaveLength(1);
  });

  test("includes exactly 1 game content", () => {
    const contents = getDefaultTabContents();
    const gameContents = contents.filter((c) => c.category === "game");
    expect(gameContents).toHaveLength(1);
  });

  test("personality contents are the 4 newest by publishedAt", () => {
    const contents = getDefaultTabContents();
    const personalityContents = contents.filter(
      (c) => c.category === "personality",
    );
    const allPersonality = getPlayContentsByCategory("personality");
    const sorted = [...allPersonality].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
    const expectedSlugs = sorted.slice(0, 4).map((c) => c.slug);
    for (const content of personalityContents) {
      expect(expectedSlugs).toContain(content.slug);
    }
  });

  test("knowledge content is the newest by publishedAt", () => {
    const contents = getDefaultTabContents();
    const knowledgeContent = contents.find((c) => c.category === "knowledge");
    expect(knowledgeContent).toBeDefined();
    const allKnowledge = getPlayContentsByCategory("knowledge");
    const sorted = [...allKnowledge].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
    expect(knowledgeContent!.slug).toBe(sorted[0].slug);
  });

  test("game content is the newest by publishedAt", () => {
    const contents = getDefaultTabContents();
    const gameContent = contents.find((c) => c.category === "game");
    expect(gameContent).toBeDefined();
    const allGame = getPlayContentsByCategory("game");
    const sorted = [...allGame].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
    expect(gameContent!.slug).toBe(sorted[0].slug);
  });

  test("each returned content exists in playContentBySlug", () => {
    const contents = getDefaultTabContents();
    for (const content of contents) {
      expect(playContentBySlug.has(content.slug)).toBe(true);
    }
  });
});

describe("getNonFortuneContents (タブUI用 fortune 除外全件)", () => {
  test("returns 19 contents (20 total minus 1 fortune)", () => {
    const contents = getNonFortuneContents();
    expect(contents).toHaveLength(19);
  });

  test("does NOT include any fortune category content", () => {
    const contents = getNonFortuneContents();
    for (const content of contents) {
      expect(content.category).not.toBe("fortune");
    }
  });

  test("does NOT include slug 'daily'", () => {
    const contents = getNonFortuneContents();
    const slugs = contents.map((c) => c.slug);
    expect(slugs).not.toContain("daily");
  });

  test("includes all 4 game slugs", () => {
    const contents = getNonFortuneContents();
    const slugs = contents.map((c) => c.slug);
    for (const slug of EXPECTED_GAME_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });

  test("includes all quiz slugs", () => {
    const contents = getNonFortuneContents();
    const slugs = contents.map((c) => c.slug);
    for (const quizMeta of allQuizMetas) {
      expect(slugs).toContain(quizMeta.slug);
    }
  });
});
