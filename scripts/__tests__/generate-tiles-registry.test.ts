/**
 * tiles registry codegen ロジックの単体テスト（Phase 7.3 → R-CRIT-1 修正後）
 *
 * buildTilesRegistryContent() を直接呼び出し、
 * TileRegistryEntry 配列の増減が生成コンテンツに正しく反映されることを確認する。
 *
 * R-CRIT-1 修正により TileRegistryEntry = TileDefinition & { domain; slug } となったため、
 * テスト入力に tileComponent / recommendedSize / inputPlaceholder / outputPlaceholder /
 * detailPath も含む必要がある。形態固有フィールド（widgetSummary / variantLabel）も同様。
 *
 * テストケース:
 *   (a) 空集合（tile 定義 0 件）入力 → 空 registry が生成される
 *   (b) 1 件（tile 定義 1 件、single 形態）入力 → 1 件の registry が生成される
 *   (c) 複数件（tile 定義 3 件以上）入力 → 全件が registry に出力される
 *   (d) 3 形態混在入力（single + widget + multi の組み合わせ）→ 全件が型契約を満たして出力される
 *       widget 形態は widgetSummary が required、multi 形態は variantLabel が required であることを型レベルで確認
 */
import { describe, expect, test } from "vitest";
import { buildTilesRegistryContent } from "../generate-tiles-registry";
import type { TileRegistryEntry } from "@/tools/_constants/tile-declarations";

// ---------------------------------------------------------------------------
// テスト用モックコンポーネント
// tileComponent は ComponentType<Record<string, any>> を満たす関数参照。
// テストは生成コンテンツ（文字列）の検証のみ行うため、実際の描画は不要。
// ---------------------------------------------------------------------------
const MockComponentA = () => null;
const MockComponentB = () => null;
const MockComponentC = () => null;
const MockComponentD = () => null;

// ---------------------------------------------------------------------------
// buildTilesRegistryContent のテスト
// ---------------------------------------------------------------------------

describe("buildTilesRegistryContent", () => {
  // テスト用入力データ（TileRegistryEntry = TileDefinition & { domain; slug }）
  // 形態 A: single — TileDefinitionSingle & { domain; slug }
  const singleEntry: TileRegistryEntry = {
    domain: "tools",
    slug: "json-formatter",
    kind: "single",
    tileComponent: MockComponentA,
    recommendedSize: { cols: 2, rows: 2 },
    inputPlaceholder: "JSON を入力",
    outputPlaceholder: "整形結果",
    detailPath: "/tools/json-formatter",
  };

  // 形態 B: widget — TileDefinitionWidget & { domain; slug } (widgetSummary が required)
  const widgetEntry: TileRegistryEntry = {
    domain: "play",
    slug: "irodori",
    kind: "widget",
    tileComponent: MockComponentB,
    recommendedSize: { cols: 2, rows: 2 },
    inputPlaceholder: "",
    outputPlaceholder: "",
    detailPath: "/play/irodori",
    widgetSummary: "色彩パレット生成",
  };

  // 形態 C: multi — TileDefinitionMulti & { domain; slug } (variantLabel が required)
  const multiEntry: TileRegistryEntry = {
    domain: "dictionary",
    slug: "kanji",
    kind: "multi",
    tileComponent: MockComponentC,
    recommendedSize: { cols: 2, rows: 1 },
    inputPlaceholder: "漢字を入力",
    outputPlaceholder: "",
    detailPath: "/dictionary/kanji",
    variantLabel: "compact",
  };

  // 形態 A: single（cheatsheets 系統）
  const cheatsheetEntry: TileRegistryEntry = {
    domain: "cheatsheets",
    slug: "git",
    kind: "single",
    tileComponent: MockComponentD,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "",
    outputPlaceholder: "",
    detailPath: "/cheatsheets/git",
  };

  // (a) 空集合 → 空 registry が生成される
  test("(a) 空集合入力: AUTO-GENERATED ヘッダが含まれ registry は 0 件", () => {
    const content = buildTilesRegistryContent([]);
    expect(content).toContain("AUTO-GENERATED FILE — DO NOT EDIT MANUALLY");
    expect(content).toContain("tilesCount=0");
    expect(content).toContain("export const tilesRegistry");
  });

  test("(a) 空集合入力: registry 配列は空（エントリ行なし）", () => {
    const content = buildTilesRegistryContent([]);
    // エントリの domain フィールドが出力されていないこと
    expect(content).not.toContain('"tools"');
    expect(content).not.toContain('"play"');
    expect(content).not.toContain('"dictionary"');
    expect(content).not.toContain('"cheatsheets"');
  });

  // (b) 1 件 → 1 件の registry が生成される
  test("(b) 1 件入力: 1 件のエントリが生成される（domain / slug / kind が出力される）", () => {
    const content = buildTilesRegistryContent([singleEntry]);
    expect(content).toContain("tilesCount=1");
    expect(content).toContain('"tools"');
    expect(content).toContain('"json-formatter"');
    expect(content).toContain('"single"');
  });

  test("(b) 1 件入力: export const tilesRegistry が含まれる", () => {
    const content = buildTilesRegistryContent([singleEntry]);
    expect(content).toContain("export const tilesRegistry");
  });

  // (c) 複数件（3 件以上）→ 全件が registry に出力される
  test("(c) 3 件入力: 全 3 件のエントリが出力される", () => {
    const entries = [singleEntry, widgetEntry, multiEntry];
    const content = buildTilesRegistryContent(entries);
    expect(content).toContain("tilesCount=3");
    // tools / play / dictionary のすべてが含まれる
    expect(content).toContain('"tools"');
    expect(content).toContain('"play"');
    expect(content).toContain('"dictionary"');
  });

  test("(c) 3 件入力: 全 slug が出力される", () => {
    const entries = [singleEntry, widgetEntry, multiEntry];
    const content = buildTilesRegistryContent(entries);
    expect(content).toContain('"json-formatter"');
    expect(content).toContain('"irodori"');
    expect(content).toContain('"kanji"');
  });

  // (d) 3 形態混在（single + widget + multi）→ 全件が型契約を満たして出力される
  test("(d) 3 形態混在入力: single / widget / multi の kind が全て出力される", () => {
    const entries = [singleEntry, widgetEntry, multiEntry, cheatsheetEntry];
    const content = buildTilesRegistryContent(entries);
    expect(content).toContain('"single"');
    expect(content).toContain('"widget"');
    expect(content).toContain('"multi"');
  });

  test("(d) 3 形態混在入力: 4 系統の domain 値がすべて出力される", () => {
    const entries = [singleEntry, widgetEntry, multiEntry, cheatsheetEntry];
    const content = buildTilesRegistryContent(entries);
    expect(content).toContain('"tools"');
    expect(content).toContain('"play"');
    expect(content).toContain('"dictionary"');
    expect(content).toContain('"cheatsheets"');
  });

  test("(d) 3 形態混在入力: tilesCount が 4 件", () => {
    const entries = [singleEntry, widgetEntry, multiEntry, cheatsheetEntry];
    const content = buildTilesRegistryContent(entries);
    expect(content).toContain("tilesCount=4");
  });

  // 型契約の確認: TileRegistryEntry 型が output に含まれる
  test("生成ファイルに TileRegistryEntry 型 import が含まれる", () => {
    const content = buildTilesRegistryContent([singleEntry]);
    expect(content).toContain("TileRegistryEntry");
  });
});
