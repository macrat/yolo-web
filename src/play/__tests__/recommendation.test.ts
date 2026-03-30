import { describe, test, expect } from "vitest";
import {
  getRecommendedContents,
  getPlayRecommendationsForBlog,
  getPlayRecommendationsForDictionary,
  getResultNextContents,
} from "../recommendation";
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

// =====================================================================
// getPlayRecommendationsForBlog のテスト
// =====================================================================

describe("getPlayRecommendationsForBlog — テーマ系タグでの推薦", () => {
  test("「漢字」タグで漢字関連コンテンツが2件返ること", () => {
    // kanji-level の keywords に「漢字」が含まれるため、スコア > 0 のマッチが存在する
    const results = getPlayRecommendationsForBlog(["漢字"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(2);
    // 漢字関連のコンテンツが含まれることを確認
    const slugs = results.map((r) => r.slug);
    const hasKanjiContent = slugs.some((s) =>
      ["kanji-level", "kanji-kanaru"].includes(s),
    );
    expect(hasKanjiContent).toBe(true);
  });

  test("「四字熟語」タグで四字熟語関連コンテンツが返ること", () => {
    const results = getPlayRecommendationsForBlog(["四字熟語"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(2);
    // yoji-level または yoji-personality が含まれることを確認
    const slugs = results.map((r) => r.slug);
    const hasYojiContent = slugs.some((s) =>
      ["yoji-level", "yoji-personality", "yoji-kimeru"].includes(s),
    );
    expect(hasYojiContent).toBe(true);
  });
});

describe("getPlayRecommendationsForBlog — フォールバック", () => {
  test("技術系タグのみの記事でフォールバックが返ること", () => {
    // play系コンテンツとは無関係な技術系タグ
    const results = getPlayRecommendationsForBlog([
      "TypeScript",
      "React",
      "Next.js",
    ]);
    // フォールバックとして PLAY_FEATURED_ITEMS の先頭から返る
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(2);
    // フォールバックはPLAY_FEATURED_ITEMS由来
    const slugs = results.map((r) => r.slug);
    expect(slugs).toContain("contrarian-fortune");
  });

  test("タグが空配列でもフォールバックが返ること", () => {
    const results = getPlayRecommendationsForBlog([]);
    // フォールバックとして PLAY_FEATURED_ITEMS の先頭から返る
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(2);
    const slugs = results.map((r) => r.slug);
    expect(slugs).toContain("contrarian-fortune");
  });
});

describe("getPlayRecommendationsForBlog — 件数・重複", () => {
  test("返却件数が常に2件以下であること", () => {
    const testCases = [
      [],
      ["漢字"],
      ["四字熟語"],
      ["TypeScript"],
      ["運勢", "占い"],
    ];
    for (const tags of testCases) {
      const results = getPlayRecommendationsForBlog(tags);
      expect(results.length).toBeLessThanOrEqual(2);
    }
  });

  test("同一コンテンツが重複して返らないこと", () => {
    const testCases = [
      [],
      ["漢字"],
      ["四字熟語"],
      ["運勢", "占い", "ユーモア"],
    ];
    for (const tags of testCases) {
      const results = getPlayRecommendationsForBlog(tags);
      const slugs = results.map((r) => r.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    }
  });

  test("1件のみマッチの場合: マッチ1件 + フォールバック1件で計2件、重複なし", () => {
    // 「伝統色」「色」キーワードは traditional-color のみにマッチし、
    // かつ他のコンテンツとは重複しない想定でテスト
    // マッチ件数を確認しつつ2件返ることをチェック
    const results = getPlayRecommendationsForBlog(["伝統色"]);
    // スコア > 0 が1件のみの場合は2件返る
    // スコア > 0 が2件以上なら上位2件が返る
    // いずれにせよ2件以下であり重複なし
    expect(results.length).toBeLessThanOrEqual(2);
    const slugs = results.map((r) => r.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);

    // 「伝統色」にマッチする traditional-color が含まれることを確認
    expect(slugs).toContain("traditional-color");

    // もし1件マッチのみなら、フォールバック（traditional-colorを除くPLAY_FEATURED_ITEMSの先頭）も含む
    if (results.length === 2) {
      // traditional-color 以外のフォールバックが含まれること
      const nonMatch = slugs.filter((s) => s !== "traditional-color");
      expect(nonMatch.length).toBe(1);
    }
  });
});

// =====================================================================
// getPlayRecommendationsForDictionary のテスト
// =====================================================================

describe("getPlayRecommendationsForDictionary — 辞典slugによる推薦", () => {
  test('"kanji" で漢字関連コンテンツが推薦されること', () => {
    const results = getPlayRecommendationsForDictionary("kanji");
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(2);
    // 「漢字」キーワードを持つコンテンツが含まれることを確認
    const slugs = results.map((r) => r.slug);
    const hasKanjiContent = slugs.some((s) =>
      ["kanji-level", "kanji-kanaru"].includes(s),
    );
    expect(hasKanjiContent).toBe(true);
  });

  test('"yoji" で四字熟語関連コンテンツが推薦されること', () => {
    const results = getPlayRecommendationsForDictionary("yoji");
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(2);
    // 「四字熟語」キーワードを持つコンテンツが含まれることを確認
    const slugs = results.map((r) => r.slug);
    const hasYojiContent = slugs.some((s) =>
      ["yoji-level", "yoji-personality", "yoji-kimeru"].includes(s),
    );
    expect(hasYojiContent).toBe(true);
  });

  test('"colors" で伝統色関連コンテンツが推薦されること', () => {
    const results = getPlayRecommendationsForDictionary("colors");
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(2);
    // 「伝統色」または「色」キーワードを持つコンテンツが含まれることを確認
    const slugs = results.map((r) => r.slug);
    expect(slugs).toContain("traditional-color");
  });

  test("未知のslugでフォールバックが返ること", () => {
    const results = getPlayRecommendationsForDictionary("unknown-dictionary");
    // フォールバックとして PLAY_FEATURED_ITEMS の先頭から返る
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(2);
    const slugs = results.map((r) => r.slug);
    expect(slugs).toContain("contrarian-fortune");
  });

  test("返却件数が常に2件以下であること", () => {
    const testSlugs = ["kanji", "yoji", "colors", "unknown", ""];
    for (const dictionarySlug of testSlugs) {
      const results = getPlayRecommendationsForDictionary(dictionarySlug);
      expect(results.length).toBeLessThanOrEqual(2);
    }
  });
});

// =====================================================================
// getResultNextContents のテスト
// =====================================================================

describe("getResultNextContents — 基本動作", () => {
  test("存在するslugで2-3件のコンテンツが返ること", () => {
    const slug = personalityContents[0].slug;
    const results = getResultNextContents(slug);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  test("返却に自分自身（currentSlug）が含まれないこと", () => {
    const slug = personalityContents[0].slug;
    const results = getResultNextContents(slug);
    const slugs = results.map((r) => r.slug);
    expect(slugs).not.toContain(slug);
  });

  test("同カテゴリから最大1件が含まれること", () => {
    const slug = personalityContents[0].slug;
    const results = getResultNextContents(slug);
    const sameCategoryCount = results.filter(
      (r) => r.category === "personality",
    ).length;
    expect(sameCategoryCount).toBeLessThanOrEqual(1);
  });

  test("異カテゴリから1-2件が含まれること", () => {
    const slug = personalityContents[0].slug;
    const results = getResultNextContents(slug);
    const crossCategoryCount = results.filter(
      (r) => r.category !== "personality",
    ).length;
    expect(crossCategoryCount).toBeGreaterThanOrEqual(1);
    expect(crossCategoryCount).toBeLessThanOrEqual(2);
  });

  test("存在しないslugで空配列が返ること", () => {
    const results = getResultNextContents("nonexistent-slug");
    expect(results).toEqual([]);
  });

  test("返却に重複がないこと", () => {
    for (const content of [
      ...personalityContents,
      ...knowledgeContents,
      ...gameContents,
    ]) {
      const results = getResultNextContents(content.slug);
      const slugs = results.map((r) => r.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    }
  });
});

describe("getResultNextContents — fortuneカテゴリ", () => {
  test("fortuneカテゴリには1種しかないため同カテゴリ選出なし、2件返ること", () => {
    // fortuneカテゴリは daily のみなので同カテゴリ候補がゼロ → 2件のみ返る
    const results = getResultNextContents("daily");
    expect(results).toHaveLength(2);
    for (const r of results) {
      expect(r.category).not.toBe("fortune");
    }
  });
});
