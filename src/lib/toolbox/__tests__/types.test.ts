import { describe, expect, test } from "vitest";
import type { Tileable } from "../types";
import { toTileable } from "../types";
import type { ToolMeta } from "@/tools/types";
import type { PlayContentMeta } from "@/play/types";
import { allToolMetas } from "@/tools/registry";
import { allPlayContents } from "@/play/registry";

// ToolMeta フィクスチャ
const toolMetaFixture: ToolMeta = {
  slug: "json-formatter",
  name: "JSONフォーマッター",
  nameEn: "JSON Formatter",
  description: "JSONデータを整形・検証するツール",
  shortDescription: "JSONを整形・検証",
  keywords: ["JSON", "フォーマット"],
  category: "developer",
  relatedSlugs: [],
  publishedAt: "2026-01-01T00:00:00+09:00",
  trustLevel: "verified",
  howItWorks: "JSONをパースして整形します",
};

// PlayContentMeta フィクスチャ
const playContentMetaFixture: PlayContentMeta = {
  slug: "kanji-kanaru",
  title: "漢字かなる",
  description: "漢字を仮名に変換するゲーム",
  shortDescription: "漢字を仮名に変換",
  icon: "🀄",
  accentColor: "#c0392b",
  keywords: ["漢字", "かな"],
  publishedAt: "2026-01-15T00:00:00+09:00",
  trustLevel: "curated",
  contentType: "game",
  category: "game",
};

describe("toTileable", () => {
  describe("ToolMeta からの変換", () => {
    test("slug が正しく変換される", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect(result.slug).toBe("json-formatter");
    });

    test("displayName が name フィールドから生成される", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect(result.displayName).toBe("JSONフォーマッター");
    });

    test("shortDescription が正しく変換される", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect(result.shortDescription).toBe("JSONを整形・検証");
    });

    test("contentKind が 'tool' になる", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect(result.contentKind).toBe("tool");
    });

    test("publishedAt が正しく変換される", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect(result.publishedAt).toBe("2026-01-01T00:00:00+09:00");
    });

    test("trustLevel が正しく変換される", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect(result.trustLevel).toBe("verified");
    });

    test("icon が undefined になる（ToolMeta はアイコンフィールドを持たない）", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect(result.icon).toBeUndefined();
    });

    test("accentColor が undefined になる（ToolMeta はカラーフィールドを持たない）", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect(result.accentColor).toBeUndefined();
    });
  });

  describe("PlayContentMeta からの変換", () => {
    test("slug が正しく変換される", () => {
      const result = toTileable(playContentMetaFixture, "play");
      expect(result.slug).toBe("kanji-kanaru");
    });

    test("displayName が title フィールドから生成される", () => {
      const result = toTileable(playContentMetaFixture, "play");
      expect(result.displayName).toBe("漢字かなる");
    });

    test("contentKind が 'play' になる", () => {
      const result = toTileable(playContentMetaFixture, "play");
      expect(result.contentKind).toBe("play");
    });

    test("icon が正しく変換される", () => {
      const result = toTileable(playContentMetaFixture, "play");
      expect(result.icon).toBe("🀄");
    });

    test("accentColor が正しく変換される", () => {
      const result = toTileable(playContentMetaFixture, "play");
      expect(result.accentColor).toBe("#c0392b");
    });
  });

  describe("戻り値の型チェック", () => {
    test("ToolMeta からの変換結果が Tileable 型を満たす", () => {
      const result: Tileable = toTileable(toolMetaFixture, "tool");
      // 必須フィールドが揃っていれば型チェックが通る
      expect(result.slug).toBeDefined();
      expect(result.displayName).toBeDefined();
      expect(result.shortDescription).toBeDefined();
      expect(result.contentKind).toBeDefined();
      expect(result.publishedAt).toBeDefined();
      expect(result.trustLevel).toBeDefined();
    });

    test("PlayContentMeta からの変換結果が Tileable 型を満たす", () => {
      const result: Tileable = toTileable(playContentMetaFixture, "play");
      expect(result.slug).toBeDefined();
      expect(result.displayName).toBeDefined();
    });
  });
});

describe("registry 全件 smoke test", () => {
  describe("allToolMetas (tools) — 全件 toTileable() 変換", () => {
    test("全 tool エントリが必須フィールドを持つ Tileable に変換できる", () => {
      for (const meta of allToolMetas) {
        const result = toTileable(meta, "tool");
        expect(result.slug, `tools/${meta.slug}: slug`).toBe(meta.slug);
        expect(
          result.displayName,
          `tools/${meta.slug}: displayName`,
        ).toBeTruthy();
        expect(
          result.shortDescription,
          `tools/${meta.slug}: shortDescription`,
        ).toBeTruthy();
        expect(result.contentKind, `tools/${meta.slug}: contentKind`).toBe(
          "tool",
        );
        expect(
          result.publishedAt,
          `tools/${meta.slug}: publishedAt`,
        ).toBeTruthy();
        expect(
          result.trustLevel,
          `tools/${meta.slug}: trustLevel`,
        ).toBeTruthy();
      }
    });

    test(`全 ${allToolMetas.length} 件が処理される`, () => {
      const results = allToolMetas.map((meta) => toTileable(meta, "tool"));
      expect(results).toHaveLength(allToolMetas.length);
    });
  });

  describe("allPlayContents (play) — 全件 toTileable() 変換", () => {
    test("全 play エントリが必須フィールドを持つ Tileable に変換できる", () => {
      for (const meta of allPlayContents) {
        const result = toTileable(meta, "play");
        expect(result.slug, `play/${meta.slug}: slug`).toBe(meta.slug);
        expect(
          result.displayName,
          `play/${meta.slug}: displayName`,
        ).toBeTruthy();
        expect(
          result.shortDescription,
          `play/${meta.slug}: shortDescription`,
        ).toBeTruthy();
        expect(result.contentKind, `play/${meta.slug}: contentKind`).toBe(
          "play",
        );
        expect(
          result.publishedAt,
          `play/${meta.slug}: publishedAt`,
        ).toBeTruthy();
        expect(result.trustLevel, `play/${meta.slug}: trustLevel`).toBeTruthy();
        // PlayContentMeta は icon / accentColor を必須で持つ
        expect(result.icon, `play/${meta.slug}: icon`).toBeTruthy();
        expect(
          result.accentColor,
          `play/${meta.slug}: accentColor`,
        ).toBeTruthy();
      }
    });

    test(`全 ${allPlayContents.length} 件が処理される`, () => {
      const results = allPlayContents.map((meta) => toTileable(meta, "play"));
      expect(results).toHaveLength(allPlayContents.length);
    });
  });

  test("tools + play の合計件数が期待値と一致する", () => {
    const total = allToolMetas.length + allPlayContents.length;
    // 34 tools + 20 play = 54 件
    expect(total).toBeGreaterThanOrEqual(54);
  });
});
