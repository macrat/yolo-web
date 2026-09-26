import { describe, test, expect } from "vitest";
import { computeCrossCategoryItems } from "../crossCategoryItems";
import { getPlayContentsByCategory } from "@/play/registry";

const gameContents = getPlayContentsByCategory("game");

describe("computeCrossCategoryItems — 基本動作", () => {
  test("指定したゲームslugで2件のアイテムが返ること", () => {
    const slug = gameContents[0].slug; // "kanji-kanaru"
    const items = computeCrossCategoryItems(slug);
    expect(items).toHaveLength(2);
  });

  test("fortune（daily）が必ず含まれること", () => {
    const slug = gameContents[0].slug;
    const items = computeCrossCategoryItems(slug);
    const hrefs = items.map((item) => item.href);
    expect(hrefs).toContain("/play/daily");
  });

  test("gameカテゴリのコンテンツが含まれないこと", () => {
    const slug = gameContents[0].slug;
    const items = computeCrossCategoryItems(slug);
    for (const item of items) {
      expect(item.kind).not.toBe("パズル");
    }
  });

  test("各行は名前・リンク先・種別を持ち、説明と補助情報を持たないこと", () => {
    const slug = gameContents[0].slug;
    const items = computeCrossCategoryItems(slug);
    for (const item of items) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.href.length).toBeGreaterThan(0);
      expect(item.kind).toBeDefined();
      expect(item.description).toBeUndefined();
      expect(item.facts).toBeUndefined();
    }
  });

  test("存在しないslugでもfortune（daily）1件は返ること", () => {
    const items = computeCrossCategoryItems("nonexistent-slug");
    // fortune は固定枠なので必ず含まれる
    // personality/knowledge 候補は currentGame が存在しないが candidates は空でないため2件返る
    expect(items.length).toBeGreaterThanOrEqual(1);
    const hrefs = items.map((item) => item.href);
    expect(hrefs).toContain("/play/daily");
  });
});

describe("computeCrossCategoryItems — 全ゲームslugでの動作", () => {
  test("全ゲームコンテンツで常に2件返ること", () => {
    for (const content of gameContents) {
      const items = computeCrossCategoryItems(content.slug);
      expect(items).toHaveLength(2);
    }
  });

  test("全ゲームコンテンツで結果にgameカテゴリが含まれないこと", () => {
    for (const content of gameContents) {
      const items = computeCrossCategoryItems(content.slug);
      for (const item of items) {
        expect(item.kind).not.toBe("パズル");
      }
    }
  });

  test("全ゲームコンテンツで結果に重複がないこと", () => {
    for (const content of gameContents) {
      const items = computeCrossCategoryItems(content.slug);
      const hrefs = items.map((item) => item.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });
});

describe("computeCrossCategoryItems — personality/knowledgeカテゴリからの選出", () => {
  test("fortune以外の1件がpersonalityまたはknowledgeカテゴリであること", () => {
    const slug = gameContents[0].slug;
    const items = computeCrossCategoryItems(slug);
    const nonFortune = items.filter((item) => item.href !== "/play/daily");
    expect(nonFortune).toHaveLength(1);
    expect(["診断", "クイズ"]).toContain(nonFortune[0].kind);
  });

  test("リンク先が/play/から始まる有効なパスであること", () => {
    const slug = gameContents[0].slug;
    const items = computeCrossCategoryItems(slug);
    for (const item of items) {
      expect(item.href).toMatch(/^\/play\//);
    }
  });
});
