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
    const slugs = items.map((item) => item.slug);
    expect(slugs).toContain("daily");
  });

  test("gameカテゴリのコンテンツが含まれないこと", () => {
    const slug = gameContents[0].slug;
    const items = computeCrossCategoryItems(slug);
    for (const item of items) {
      expect(item.category).not.toBe("game");
    }
  });

  test("各アイテムにslug, title, icon, contentPath, categoryLabelが含まれること", () => {
    const slug = gameContents[0].slug;
    const items = computeCrossCategoryItems(slug);
    for (const item of items) {
      expect(item.slug).toBeDefined();
      expect(typeof item.slug).toBe("string");
      expect(item.slug.length).toBeGreaterThan(0);

      expect(item.title).toBeDefined();
      expect(typeof item.title).toBe("string");
      expect(item.title.length).toBeGreaterThan(0);

      expect(item.icon).toBeDefined();
      expect(typeof item.icon).toBe("string");
      expect(item.icon.length).toBeGreaterThan(0);

      expect(item.contentPath).toBeDefined();
      expect(typeof item.contentPath).toBe("string");
      expect(item.contentPath.length).toBeGreaterThan(0);

      expect(item.categoryLabel).toBeDefined();
      expect(typeof item.categoryLabel).toBe("string");
      expect(item.categoryLabel.length).toBeGreaterThan(0);
    }
  });

  test("存在しないslugでもfortune（daily）1件は返ること", () => {
    const items = computeCrossCategoryItems("nonexistent-slug");
    // fortune は固定枠なので必ず含まれる
    // personality/knowledge 候補は currentGame が存在しないが candidates は空でないため2件返る
    expect(items.length).toBeGreaterThanOrEqual(1);
    const slugs = items.map((item) => item.slug);
    expect(slugs).toContain("daily");
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
        expect(item.category).not.toBe("game");
      }
    }
  });

  test("全ゲームコンテンツで結果に重複がないこと", () => {
    for (const content of gameContents) {
      const items = computeCrossCategoryItems(content.slug);
      const slugs = items.map((item) => item.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    }
  });
});

describe("computeCrossCategoryItems — personality/knowledgeカテゴリからの選出", () => {
  test("fortune以外の1件がpersonalityまたはknowledgeカテゴリであること", () => {
    const slug = gameContents[0].slug;
    const items = computeCrossCategoryItems(slug);
    const nonFortune = items.filter((item) => item.slug !== "daily");
    expect(nonFortune).toHaveLength(1);
    const category = nonFortune[0].category;
    expect(["personality", "knowledge"]).toContain(category);
  });

  test("contentPathが/play/から始まる有効なパスであること", () => {
    const slug = gameContents[0].slug;
    const items = computeCrossCategoryItems(slug);
    for (const item of items) {
      expect(item.contentPath).toMatch(/^\/play\//);
    }
  });
});
