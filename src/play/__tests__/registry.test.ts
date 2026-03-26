import { describe, test, expect } from "vitest";
import {
  gameMetaToPlayContentMeta,
  quizMetaToPlayContentMeta,
  fortunePlayContentMeta,
  allPlayContents,
  playContentBySlug,
  getPlayContentsByCategory,
  getAllPlaySlugs,
  FEATURED_SLUGS,
  DAILY_UPDATE_SLUGS,
  DIAGNOSIS_SLUGS,
  getDiagnosisContents,
  PLAY_FEATURED_ITEMS,
  getPlayFeaturedContents,
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

describe("FEATURED_SLUGS (共有定数)", () => {
  test("is exported from registry", () => {
    expect(FEATURED_SLUGS).toBeDefined();
  });

  test("contains exactly 3 slugs (占いカテゴリは FortunePreview で表示するため除外)", () => {
    expect(FEATURED_SLUGS).toHaveLength(3);
  });

  test("does NOT include 'daily' (占いカテゴリは FortunePreview セクションで表示するため除外)", () => {
    expect(FEATURED_SLUGS).not.toContain("daily");
  });

  test("includes 'animal-personality' (性格診断カテゴリ代表)", () => {
    expect(FEATURED_SLUGS).toContain("animal-personality");
  });

  test("includes 'kanji-level' (知識テストカテゴリ代表)", () => {
    expect(FEATURED_SLUGS).toContain("kanji-level");
  });

  test("includes 'character-personality' (性格診断カテゴリ追加代表)", () => {
    expect(FEATURED_SLUGS).toContain("character-personality");
  });

  test("does NOT include 'irodori' (ゲームカテゴリはデイリーパズルセクションで表示するため除外)", () => {
    expect(FEATURED_SLUGS).not.toContain("irodori");
  });

  test("each slug exists in playContentBySlug", () => {
    for (const slug of FEATURED_SLUGS) {
      expect(playContentBySlug.has(slug)).toBe(true);
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

describe("DIAGNOSIS_SLUGS (7-8: 診断セクション4件統一)", () => {
  test("is exported from registry", () => {
    expect(DIAGNOSIS_SLUGS).toBeDefined();
  });

  test("contains exactly 4 slugs (4件×4列に統一)", () => {
    expect(DIAGNOSIS_SLUGS).toHaveLength(4);
  });

  test("contains 'music-personality'", () => {
    expect(DIAGNOSIS_SLUGS).toContain("music-personality");
  });

  test("contains 'yoji-personality'", () => {
    expect(DIAGNOSIS_SLUGS).toContain("yoji-personality");
  });

  test("contains 'kotowaza-level'", () => {
    expect(DIAGNOSIS_SLUGS).toContain("kotowaza-level");
  });

  test("contains 'yoji-level'", () => {
    expect(DIAGNOSIS_SLUGS).toContain("yoji-level");
  });

  test("does NOT contain 'character-personality' (ゲームよりcharacter-personalityはキャラクター多く処理重いため除外)", () => {
    expect(DIAGNOSIS_SLUGS).not.toContain("character-personality");
  });

  test("does NOT contain 'science-thinking' (20問と問数が多くトップページには不向きなため除外)", () => {
    expect(DIAGNOSIS_SLUGS).not.toContain("science-thinking");
  });

  test("each slug exists in playContentBySlug", () => {
    for (const slug of DIAGNOSIS_SLUGS) {
      expect(playContentBySlug.has(slug)).toBe(true);
    }
  });
});

describe("getDiagnosisContents (7-8: 診断セクション4件統一)", () => {
  test("returns exactly 4 contents", () => {
    const contents = getDiagnosisContents();
    expect(contents).toHaveLength(4);
  });

  test("all returned contents exist in playContentBySlug", () => {
    const contents = getDiagnosisContents();
    for (const content of contents) {
      expect(playContentBySlug.has(content.slug)).toBe(true);
    }
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

describe("PLAY_FEATURED_ITEMS — トップページの FEATURED_SLUGS/DIAGNOSIS_SLUGS との重複なし (B-209レビュー修正4)", () => {
  test("PLAY_FEATURED_ITEMS の各 slug が FEATURED_SLUGS に含まれていない", () => {
    for (const item of PLAY_FEATURED_ITEMS) {
      expect(FEATURED_SLUGS).not.toContain(item.slug);
    }
  });

  test("PLAY_FEATURED_ITEMS の各 slug が DIAGNOSIS_SLUGS に含まれていない", () => {
    for (const item of PLAY_FEATURED_ITEMS) {
      expect(DIAGNOSIS_SLUGS).not.toContain(item.slug);
    }
  });
});
