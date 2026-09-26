import { describe, test, expect } from "vitest";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  SERIES_LABELS,
} from "@/blog/_lib/blog";

describe("BlogCategory type and constants", () => {
  describe("ALL_CATEGORIES", () => {
    test("カテゴリ数が5であること", () => {
      expect(ALL_CATEGORIES).toHaveLength(5);
    });

    test("表示順が正しいこと", () => {
      expect(ALL_CATEGORIES).toEqual([
        "ai-workflow",
        "dev-notes",
        "site-updates",
        "tool-guides",
        "japanese-culture",
      ]);
    });
  });

  describe("CATEGORY_LABELS", () => {
    test("各カテゴリの日本語ラベルが正しいこと", () => {
      expect(CATEGORY_LABELS["ai-workflow"]).toBe("AIワークフロー");
      expect(CATEGORY_LABELS["dev-notes"]).toBe("開発ノート");
      expect(CATEGORY_LABELS["site-updates"]).toBe("サイト更新");
      expect(CATEGORY_LABELS["tool-guides"]).toBe("ツールガイド");
      expect(CATEGORY_LABELS["japanese-culture"]).toBe("日本語・文化");
    });

    test("全カテゴリにラベルが定義されていること", () => {
      for (const category of ALL_CATEGORIES) {
        expect(
          CATEGORY_LABELS[category],
          `${category} のラベルが未定義`,
        ).toBeDefined();
      }
    });
  });

  describe("CATEGORY_DESCRIPTIONS", () => {
    test("全カテゴリに説明文が定義されていること", () => {
      for (const category of ALL_CATEGORIES) {
        expect(
          CATEGORY_DESCRIPTIONS[category],
          `${category} の説明文が未定義`,
        ).toBeDefined();
      }
    });

    test("全カテゴリの説明文が空でないこと", () => {
      for (const category of ALL_CATEGORIES) {
        expect(
          CATEGORY_DESCRIPTIONS[category].length,
          `${category} の説明文が空`,
        ).toBeGreaterThan(0);
      }
    });

    test("各カテゴリの説明文が適切な長さであること（50文字以上）", () => {
      for (const category of ALL_CATEGORIES) {
        expect(
          CATEGORY_DESCRIPTIONS[category].length,
          `${category} の説明文が短すぎる`,
        ).toBeGreaterThanOrEqual(50);
      }
    });
  });

  describe("SERIES_LABELS", () => {
    test("各シリーズのラベルが正しいこと", () => {
      expect(SERIES_LABELS["ai-agent-ops"]).toBe("AIエージェント運用記");
      expect(SERIES_LABELS["japanese-culture"]).toBe("日本語・日本文化");
      expect(SERIES_LABELS["nextjs-deep-dive"]).toBe("Next.js実践ノート");
    });

    test("シリーズ数が3であること", () => {
      expect(Object.keys(SERIES_LABELS)).toHaveLength(3);
    });
  });
});
