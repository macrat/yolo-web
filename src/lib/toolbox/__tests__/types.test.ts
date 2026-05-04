import { describe, expect, test } from "vitest";
import type { Tileable } from "../types";
import { toTileable } from "../types";
import type { ToolMeta } from "@/tools/types";
import type { PlayContentMeta } from "@/play/types";
import type { CheatsheetMeta } from "@/cheatsheets/types";
import { allToolMetas } from "@/tools/registry";
import { allPlayContents } from "@/play/registry";
import { allCheatsheetMetas } from "@/cheatsheets/registry";

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

// CheatsheetMeta フィクスチャ
const cheatsheetMetaFixture: CheatsheetMeta = {
  slug: "git",
  name: "Git チートシート",
  nameEn: "Git Cheatsheet",
  description: "Gitコマンドのリファレンス",
  shortDescription: "Gitコマンド早見表",
  keywords: ["Git", "コマンド"],
  category: "developer",
  relatedToolSlugs: [],
  relatedCheatsheetSlugs: [],
  sections: [],
  publishedAt: "2026-02-01T00:00:00+09:00",
  trustLevel: "curated",
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

    test("tile キーが存在しない（omit）", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect("tile" in result).toBe(false);
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

  describe("CheatsheetMeta からの変換", () => {
    test("slug が正しく変換される", () => {
      const result = toTileable(cheatsheetMetaFixture, "cheatsheet");
      expect(result.slug).toBe("git");
    });

    test("displayName が name フィールドから生成される（CheatsheetMeta は title フィールドを持たない）", () => {
      const result = toTileable(cheatsheetMetaFixture, "cheatsheet");
      expect(result.displayName).toBe("Git チートシート");
    });

    test("contentKind が 'cheatsheet' になる", () => {
      const result = toTileable(cheatsheetMetaFixture, "cheatsheet");
      expect(result.contentKind).toBe("cheatsheet");
    });
  });

  describe("href 生成（CRIT-F1v2-1）", () => {
    test("tool: href が /tools/{slug} で生成される", () => {
      const result = toTileable(toolMetaFixture, "tool");
      expect(result.href).toBe("/tools/json-formatter");
    });

    test("play: href が /play/{slug} で生成される", () => {
      const result = toTileable(playContentMetaFixture, "play");
      expect(result.href).toBe("/play/kanji-kanaru");
    });

    test("cheatsheet: href が /cheatsheets/{slug} で生成される", () => {
      const result = toTileable(cheatsheetMetaFixture, "cheatsheet");
      expect(result.href).toBe("/cheatsheets/git");
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

    test("CheatsheetMeta からの変換結果が Tileable 型を満たす", () => {
      const result: Tileable = toTileable(cheatsheetMetaFixture, "cheatsheet");
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
        expect(
          "tile" in result,
          `tools/${meta.slug}: tile キーは omit される`,
        ).toBe(false);
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
        expect(
          "tile" in result,
          `play/${meta.slug}: tile キーは omit される`,
        ).toBe(false);
      }
    });

    test(`全 ${allPlayContents.length} 件が処理される`, () => {
      const results = allPlayContents.map((meta) => toTileable(meta, "play"));
      expect(results).toHaveLength(allPlayContents.length);
    });
  });

  describe("allCheatsheetMetas (cheatsheets) — 全件 toTileable() 変換", () => {
    test("全 cheatsheet エントリが必須フィールドを持つ Tileable に変換できる", () => {
      for (const meta of allCheatsheetMetas) {
        const result = toTileable(meta, "cheatsheet");
        expect(result.slug, `cheatsheets/${meta.slug}: slug`).toBe(meta.slug);
        expect(
          result.displayName,
          `cheatsheets/${meta.slug}: displayName`,
        ).toBeTruthy();
        expect(
          result.shortDescription,
          `cheatsheets/${meta.slug}: shortDescription`,
        ).toBeTruthy();
        expect(
          result.contentKind,
          `cheatsheets/${meta.slug}: contentKind`,
        ).toBe("cheatsheet");
        expect(
          result.publishedAt,
          `cheatsheets/${meta.slug}: publishedAt`,
        ).toBeTruthy();
        expect(
          result.trustLevel,
          `cheatsheets/${meta.slug}: trustLevel`,
        ).toBeTruthy();
        expect(
          "tile" in result,
          `cheatsheets/${meta.slug}: tile キーは omit される`,
        ).toBe(false);
      }
    });

    test(`全 ${allCheatsheetMetas.length} 件が処理される`, () => {
      const results = allCheatsheetMetas.map((meta) =>
        toTileable(meta, "cheatsheet"),
      );
      expect(results).toHaveLength(allCheatsheetMetas.length);
    });
  });

  test("tools + play + cheatsheets の合計件数が期待値と一致する", () => {
    const total =
      allToolMetas.length + allPlayContents.length + allCheatsheetMetas.length;
    // 34 tools + 20 play + 7 cheatsheets = 61 件（計画書概算 60 件）
    expect(total).toBeGreaterThanOrEqual(60);
  });
});
