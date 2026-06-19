/**
 * toolbox-catalog の整合テスト（cycle-230 T-6）
 *
 * 検証観点:
 * - エントリ40件（35ツール full ＋ 形ファミリー代表の固定 variant 5枚）
 * - id の一意性と `${slug}:${variant}` 形式
 * - セル数（cols/rows）が正の整数
 * - 全エントリにコンポーネントが結線されている（renderTile が有効な要素を返す）
 * - 表示名・カテゴリがレジストリ（ToolMeta）とドリフトしていない
 *   （カタログはバンドルサイズ対策で name をリテラル保持するため、
 *     一致はこのテストが機械的に保証する。toolbox-catalog.tsx 冒頭コメント参照）
 * - displayLabel の一意性（同名ツールの full / 固定 variant の区別）
 * - 並び順がカテゴリ単位（TOOLBOX_CATEGORY_ORDER）でまとまっている
 */
import { isValidElement } from "react";
import { describe, expect, it } from "vitest";

import { getAllToolSlugs, toolsBySlug } from "@/tools/registry";

import {
  TOOLBOX_CATALOG,
  TOOLBOX_CATALOG_BY_ID,
  TOOLBOX_CATALOG_IDS,
  TOOLBOX_CATEGORY_ORDER,
} from "../toolbox-catalog";

/** 形ファミリー代表として恒久配置されている固定 variant 5枚 */
const FIXED_VARIANT_IDS = [
  "json-formatter:format-only",
  "number-base-converter:bin-hex",
  "kana-converter:hiragana-to-katakana",
  "image-base64:encode",
  "url-encode:encode",
];

describe("toolbox-catalog: エントリ数と id", () => {
  it("エントリは41件（36ツール full ＋ 固定 variant 5枚）", () => {
    expect(TOOLBOX_CATALOG).toHaveLength(41);
    expect(
      TOOLBOX_CATALOG.filter((entry) => entry.variant === "full"),
    ).toHaveLength(36);
    for (const id of FIXED_VARIANT_IDS) {
      expect(TOOLBOX_CATALOG_IDS.has(id)).toBe(true);
    }
  });

  it("全36ツール（レジストリの全 slug）の full エントリが存在する", () => {
    const fullSlugs = new Set(
      TOOLBOX_CATALOG.filter((entry) => entry.variant === "full").map(
        (entry) => entry.slug,
      ),
    );
    for (const slug of getAllToolSlugs()) {
      expect(fullSlugs.has(slug)).toBe(true);
    }
  });

  it("id は一意で `${slug}:${variant}` 形式", () => {
    const ids = TOOLBOX_CATALOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of TOOLBOX_CATALOG) {
      expect(entry.id).toBe(`${entry.slug}:${entry.variant}`);
    }
  });

  it("派生エクスポート（索引・id 集合）がカタログと一致する", () => {
    // デフォルト構成は cycle-232 からカタログ全量ではなく daily-life
    // プリセット（toolbox-presets.ts）になった。デフォルト構成の整合検証は
    // toolbox-presets.test.ts の「デフォルト構成」describe が担う
    expect(TOOLBOX_CATALOG_IDS.size).toBe(TOOLBOX_CATALOG.length);
    for (const entry of TOOLBOX_CATALOG) {
      expect(TOOLBOX_CATALOG_BY_ID.get(entry.id)).toBe(entry);
    }
  });
});

describe("toolbox-catalog: 寸法とコンポーネント結線", () => {
  it("セル数（cols/rows）は正の整数", () => {
    for (const entry of TOOLBOX_CATALOG) {
      expect(Number.isInteger(entry.cols), `${entry.id} cols`).toBe(true);
      expect(Number.isInteger(entry.rows), `${entry.id} rows`).toBe(true);
      expect(entry.cols).toBeGreaterThan(0);
      expect(entry.rows).toBeGreaterThan(0);
    }
  });

  it("全エントリの renderTile が className を受け取って有効な要素を返す", () => {
    for (const entry of TOOLBOX_CATALOG) {
      const element = entry.renderTile("tile-class");
      expect(isValidElement(element), `${entry.id} renderTile`).toBe(true);
      const props = element.props as { className?: string; variant?: string };
      expect(props.className).toBe("tile-class");
      expect(props.variant).toBe(entry.variant);
    }
  });
});

describe("toolbox-catalog: レジストリ（ToolMeta）とのドリフト防止", () => {
  it("name / category が ToolMeta と一致する", () => {
    for (const entry of TOOLBOX_CATALOG) {
      const definition = toolsBySlug.get(entry.slug);
      expect(definition, `${entry.slug} はレジストリに存在する`).toBeDefined();
      expect(entry.name, `${entry.id} の name`).toBe(definition?.meta.name);
      expect(entry.category, `${entry.id} の category`).toBe(
        definition?.meta.category,
      );
    }
  });
});

describe("toolbox-catalog: 表示ラベルと並び順", () => {
  it("displayLabel は一意（同名ツールの full と固定 variant を区別できる）", () => {
    const labels = TOOLBOX_CATALOG.map((entry) => entry.displayLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("固定 variant には variantLabel があり、full には付かない", () => {
    for (const entry of TOOLBOX_CATALOG) {
      if (FIXED_VARIANT_IDS.includes(entry.id)) {
        expect(entry.variantLabel, entry.id).toBeTruthy();
        expect(entry.displayLabel).toBe(
          `${entry.name}（${entry.variantLabel}）`,
        );
      } else {
        expect(entry.variantLabel, entry.id).toBeUndefined();
        expect(entry.displayLabel).toBe(entry.name);
      }
    }
  });

  it("カタログ定義順はカテゴリ単位（TOOLBOX_CATEGORY_ORDER 順）でまとまっている", () => {
    const categoryRank = TOOLBOX_CATALOG.map((entry) =>
      TOOLBOX_CATEGORY_ORDER.indexOf(entry.category),
    );
    for (const rank of categoryRank) {
      expect(rank).toBeGreaterThanOrEqual(0);
    }
    for (let i = 1; i < categoryRank.length; i++) {
      // カテゴリのまとまりが崩れていない（並びが順序リストに対して単調非減少）
      expect(categoryRank[i], `index ${i}`).toBeGreaterThanOrEqual(
        categoryRank[i - 1],
      );
    }
  });
});
