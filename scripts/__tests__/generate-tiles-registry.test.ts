/**
 * tiles registry codegen ロジックの単体テスト（Phase 7.3）
 *
 * buildTilesRegistryContent() を直接呼び出し、
 * TileRegistryEntry 配列の増減が生成コンテンツに正しく反映されることを確認する。
 *
 * テストケース:
 *   (a) 空集合（tile 定義 0 件）入力 → 空 registry が生成される
 *   (b) 1 件（tile 定義 1 件）入力 → 1 件の registry が生成される
 *   (c) 複数件（tile 定義 3 件以上）入力 → 全件が registry に出力される
 *   (d) 3 形態混在入力（single + widget + multi の組み合わせ）→ 全件が型契約を満たして出力される
 */
import { describe, expect, test } from "vitest";
import { buildTilesRegistryContent } from "../generate-tiles-registry";
import type { TileRegistryInput } from "../generate-tiles-registry";

// ---------------------------------------------------------------------------
// buildTilesRegistryContent のテスト
// ---------------------------------------------------------------------------

describe("buildTilesRegistryContent", () => {
  // テスト用入力データ（系統 × slug × kind の組み合わせ）
  const singleEntry: TileRegistryInput = {
    domain: "tools",
    slug: "json-formatter",
    kind: "single",
  };

  const widgetEntry: TileRegistryInput = {
    domain: "play",
    slug: "irodori",
    kind: "widget",
  };

  const multiEntry: TileRegistryInput = {
    domain: "dictionary",
    slug: "kanji",
    kind: "multi",
  };

  const cheatsheetEntry: TileRegistryInput = {
    domain: "cheatsheets",
    slug: "git",
    kind: "single",
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
  test("(b) 1 件入力: 1 件のエントリが生成される", () => {
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
