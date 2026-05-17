/**
 * storage-keys.ts — 共有 localStorage キー定数の機械検証テスト
 *
 * 検証項目:
 * 1. STORAGE_KEY_SEARCH / STORAGE_KEY_CATEGORY の値が命名規約に合致する
 * 2. Tile.tsx と Component.tsx のソースに検索・カテゴリキーの生文字列リテラルが残っていない
 *    （共有定数を import して使用していることを担保、タイル⇄詳細ページ状態連動に必須）
 *
 * 注意: Component.tsx の "yolos-tool-keigo-reference-tab" は Component.tsx 専用キーであり
 * Tile.tsx との共有が不要なため、このテストの検出対象外とする。
 */

import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { STORAGE_KEY_SEARCH, STORAGE_KEY_CATEGORY } from "../storage-keys";

describe("storage-keys 定数値の命名規約確認", () => {
  // 命名規約: yolos-tool-<slug>-<purpose>
  const NAMING_PATTERN = /^yolos-tool-keigo-reference-[a-z-]+$/;

  test("STORAGE_KEY_SEARCH が命名規約に合致する", () => {
    expect(STORAGE_KEY_SEARCH).toMatch(NAMING_PATTERN);
  });

  test("STORAGE_KEY_CATEGORY が命名規約に合致する", () => {
    expect(STORAGE_KEY_CATEGORY).toMatch(NAMING_PATTERN);
  });

  test("STORAGE_KEY_SEARCH の値が正しい", () => {
    expect(STORAGE_KEY_SEARCH).toBe("yolos-tool-keigo-reference-search");
  });

  test("STORAGE_KEY_CATEGORY の値が設計書通りである（-category-filter）", () => {
    // docs/tile-and-detail-design.md §4 案 19-A 指定値
    expect(STORAGE_KEY_CATEGORY).toBe(
      "yolos-tool-keigo-reference-category-filter",
    );
  });
});

describe("Tile.tsx / Component.tsx に検索・カテゴリの生文字列リテラルが残っていない", () => {
  const BASE_DIR = path.resolve(__dirname, "..");
  // -search キーの生文字列使用を検出するパターン
  const SEARCH_RAW_PATTERN = /["']yolos-tool-keigo-reference-search["']/;
  // -category 系キーの生文字列使用を検出するパターン（-category / -category-filter 両方を検出）
  const CATEGORY_RAW_PATTERN = /["']yolos-tool-keigo-reference-category/;

  test("Tile.tsx に検索キーの生文字列リテラルがない", () => {
    const content = fs.readFileSync(path.join(BASE_DIR, "Tile.tsx"), "utf-8");
    expect(content).not.toMatch(SEARCH_RAW_PATTERN);
  });

  test("Tile.tsx にカテゴリキーの生文字列リテラルがない", () => {
    const content = fs.readFileSync(path.join(BASE_DIR, "Tile.tsx"), "utf-8");
    expect(content).not.toMatch(CATEGORY_RAW_PATTERN);
  });

  test("Component.tsx に検索キーの生文字列リテラルがない", () => {
    const content = fs.readFileSync(
      path.join(BASE_DIR, "Component.tsx"),
      "utf-8",
    );
    expect(content).not.toMatch(SEARCH_RAW_PATTERN);
  });

  test("Component.tsx にカテゴリキーの生文字列リテラルがない", () => {
    const content = fs.readFileSync(
      path.join(BASE_DIR, "Component.tsx"),
      "utf-8",
    );
    expect(content).not.toMatch(CATEGORY_RAW_PATTERN);
  });
});
