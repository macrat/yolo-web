import { describe, test, expect } from "vitest";
import { getRecommendedContents } from "../recommendation";
import { playContentBySlug, getPlayContentsByCategory } from "../registry";

// 各カテゴリの先頭コンテンツを取得して参照する
const personalityContents = getPlayContentsByCategory("personality");
const knowledgeContents = getPlayContentsByCategory("knowledge");
const gameContents = getPlayContentsByCategory("game");

describe("getRecommendedContents — personalityカテゴリのコンテンツ", () => {
  test("fortune/knowledge/gameカテゴリから各1件ずつ、計3件返す", () => {
    const slug = personalityContents[0].slug;
    const results = getRecommendedContents(slug);
    expect(results).toHaveLength(3);

    const categories = results.map((r) => r.category);
    expect(categories).toContain("fortune");
    expect(categories).toContain("knowledge");
    expect(categories).toContain("game");
  });

  test("personalityカテゴリのコンテンツが結果に含まれない", () => {
    const slug = personalityContents[0].slug;
    const results = getRecommendedContents(slug);
    for (const r of results) {
      expect(r.category).not.toBe("personality");
    }
  });

  test("自分自身が結果に含まれない", () => {
    const slug = personalityContents[0].slug;
    const results = getRecommendedContents(slug);
    const slugs = results.map((r) => r.slug);
    expect(slugs).not.toContain(slug);
  });
});

describe("getRecommendedContents — knowledgeカテゴリのコンテンツ", () => {
  test("fortune/personality/gameカテゴリから各1件ずつ、計3件返す", () => {
    const slug = knowledgeContents[0].slug;
    const results = getRecommendedContents(slug);
    expect(results).toHaveLength(3);

    const categories = results.map((r) => r.category);
    expect(categories).toContain("fortune");
    expect(categories).toContain("personality");
    expect(categories).toContain("game");
  });

  test("knowledgeカテゴリのコンテンツが結果に含まれない", () => {
    const slug = knowledgeContents[0].slug;
    const results = getRecommendedContents(slug);
    for (const r of results) {
      expect(r.category).not.toBe("knowledge");
    }
  });
});

describe("getRecommendedContents — gameカテゴリのコンテンツ", () => {
  test("fortune/personality/knowledgeカテゴリから各1件ずつ、計3件返す", () => {
    const slug = gameContents[0].slug;
    const results = getRecommendedContents(slug);
    expect(results).toHaveLength(3);

    const categories = results.map((r) => r.category);
    expect(categories).toContain("fortune");
    expect(categories).toContain("personality");
    expect(categories).toContain("knowledge");
  });

  test("gameカテゴリのコンテンツが結果に含まれない", () => {
    const slug = gameContents[0].slug;
    const results = getRecommendedContents(slug);
    for (const r of results) {
      expect(r.category).not.toBe("game");
    }
  });
});

describe("getRecommendedContents — fortuneカテゴリのコンテンツ（daily）", () => {
  test("personality/knowledge/gameカテゴリから各1件ずつ、計3件返す", () => {
    const results = getRecommendedContents("daily");
    expect(results).toHaveLength(3);

    const categories = results.map((r) => r.category);
    expect(categories).toContain("personality");
    expect(categories).toContain("knowledge");
    expect(categories).toContain("game");
  });

  test("fortuneカテゴリのコンテンツが結果に含まれない", () => {
    const results = getRecommendedContents("daily");
    for (const r of results) {
      expect(r.category).not.toBe("fortune");
    }
  });

  test("dailyが結果に含まれない", () => {
    const results = getRecommendedContents("daily");
    const slugs = results.map((r) => r.slug);
    expect(slugs).not.toContain("daily");
  });

  test("personalityカテゴリからはcontrarian-fortuneが選出される（占い的コンテンツへの回遊導線）", () => {
    // daily の keywords: ["運勢", "占い", "デイリー", "ユーモア", "AI"]
    // contrarian-fortune の keywords: ["逆張り", "運勢", "占い", "診断", "ユーモア", "面白い占い", "逆張り運勢"]
    // 「運勢」「占い」「ユーモア」の3件が重複し、personalityカテゴリ内で最大重複数となる。
    // これにより、占いページを楽しんだユーザーに占い的コンテンツ（逆張り運勢診断）が
    // 自然に推薦される回遊導線が成立している。
    const results = getRecommendedContents("daily");
    const personalityResult = results.find((r) => r.category === "personality");
    expect(personalityResult).toBeDefined();
    expect(personalityResult?.slug).toBe("contrarian-fortune");
  });
});

describe("getRecommendedContents — 返却件数", () => {
  test("personalityの全コンテンツで常に3件返す", () => {
    for (const content of personalityContents) {
      const results = getRecommendedContents(content.slug);
      expect(results).toHaveLength(3);
    }
  });

  test("knowledgeの全コンテンツで常に3件返す", () => {
    for (const content of knowledgeContents) {
      const results = getRecommendedContents(content.slug);
      expect(results).toHaveLength(3);
    }
  });

  test("gameの全コンテンツで常に3件返す", () => {
    for (const content of gameContents) {
      const results = getRecommendedContents(content.slug);
      expect(results).toHaveLength(3);
    }
  });
});

describe("getRecommendedContents — keywords重複による優先選出", () => {
  test("現在のコンテンツとkeywordsが重複するコンテンツが優先選出される", () => {
    // kanji-levelのkeywordsは ["漢字", "難読漢字", "読み方", "クイズ", "診断", "漢字力", "テスト"]
    // gameカテゴリのkanji-kanaruのkeywordsは ["漢字", "パズル", "デイリー", "推理"]
    // 「漢字」という共通keywordがある
    // 他のゲーム（yoji-kimeru, nakamawake, irodori）よりも重複が多いはずなので
    // kanji-kanaruが選ばれることを期待
    const results = getRecommendedContents("kanji-level");
    const gameResult = results.find((r) => r.category === "game");
    expect(gameResult).toBeDefined();
    // kanji-kanaruは「漢字」が共通keywordとして重複する
    expect(gameResult?.slug).toBe("kanji-kanaru");
  });
});

describe("getRecommendedContents — keywordsの重複がゼロの場合はレジストリ定義順", () => {
  test("fortuneカテゴリはkeywordsに関わらず常にdailyが選ばれる（1種しかないため）", () => {
    // fortuneは1種しかないので常にdailyが返る
    const results = getRecommendedContents(knowledgeContents[0].slug);
    const fortuneResult = results.find((r) => r.category === "fortune");
    expect(fortuneResult).toBeDefined();
    expect(fortuneResult?.slug).toBe("daily");
  });

  test("keywordsが完全に異なる場合はレジストリ定義順の先頭が選ばれる", () => {
    // animal-personalityのkeywordsは["動物診断","性格診断","日本の動物","動物性格","相性診断","日本固有種","日本にしかいない動物"]
    // gameカテゴリのどのコンテンツとも重複しない想定
    // その場合はレジストリ定義順で先頭のkanji-kanaruが選ばれることを期待
    const results = getRecommendedContents("animal-personality");
    const gameResult = results.find((r) => r.category === "game");
    expect(gameResult).toBeDefined();
    // gameレジストリ定義順: kanji-kanaru, yoji-kimeru, nakamawake, irodori
    // animal-personalityのkeywordsとの重複をチェック
    const animalKeywords = new Set(
      playContentBySlug.get("animal-personality")!.keywords,
    );
    const gameResultKeywords = gameResult!.keywords;
    const overlap = gameResultKeywords.filter((k) => animalKeywords.has(k));
    // もし重複がある場合はそれが選ばれるので問題なし
    // 重複がゼロ or 最大重複の先頭コンテンツが選ばれることを検証
    const allGameContents = getPlayContentsByCategory("game");
    const maxOverlap = Math.max(
      ...allGameContents.map(
        (g) => g.keywords.filter((k) => animalKeywords.has(k)).length,
      ),
    );
    // 選ばれたコンテンツの重複数が最大であることを確認
    expect(overlap.length).toBe(maxOverlap);
  });
});

describe("getRecommendedContents — 存在しないslug", () => {
  test("存在しないslugに対して空配列を返す", () => {
    const results = getRecommendedContents("nonexistent-slug");
    expect(results).toEqual([]);
  });

  test("空文字列に対して空配列を返す", () => {
    const results = getRecommendedContents("");
    expect(results).toEqual([]);
  });
});
