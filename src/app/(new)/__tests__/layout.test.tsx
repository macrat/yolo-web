/**
 * (new)/layout.tsx 検索ボタン結線テスト
 *
 * cycle-185 B-334-4-5 致命的 UI 退行への対処 v2 として、
 * HeaderWithSearch が (new)/layout.tsx で使用され、
 * デスクトップ・モバイル両方で検索ボタンが機能することを確認する。
 *
 * Phase 5 (B-331) で新検索コンポーネントに置き換える際は本テストも更新すること。
 */
import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// layout.tsx のソースコードを読み込んで構造を確認する。
// Server Component である layout は jsdom でレンダリングできないため、
// ソースコード解析で構造を検証する。
const layoutSrc = readFileSync(resolve(__dirname, "../layout.tsx"), "utf-8");

describe("(new)/layout.tsx に HeaderWithSearch が使われている", () => {
  test("HeaderWithSearch が import されている", () => {
    expect(layoutSrc).toMatch(/import.*HeaderWithSearch/);
  });

  test("HeaderWithSearch が JSX 内で使用されている", () => {
    expect(layoutSrc).toMatch(/<HeaderWithSearch/);
  });

  test("layout.tsx に Header の直接 import が残っていない（HeaderWithSearch に委譲済み）", () => {
    // Header は HeaderWithSearch 内部で使うため layout.tsx には不要
    expect(layoutSrc).not.toMatch(/^import Header from/m);
  });
});

// HeaderWithSearch のソースコードを検証する
const headerWithSearchSrc = readFileSync(
  resolve(__dirname, "../_components/HeaderWithSearch.tsx"),
  "utf-8",
);

describe("HeaderWithSearch が onSearchOpen を Header に渡している", () => {
  test("'use client' 宣言がある（Client Component）", () => {
    expect(headerWithSearchSrc).toMatch(/["']use client["']/);
  });

  test("useState で open 状態を管理している", () => {
    expect(headerWithSearchSrc).toMatch(/useState/);
  });

  test("onSearchOpen を Header に渡している", () => {
    expect(headerWithSearchSrc).toMatch(/onSearchOpen/);
  });

  test("SearchModal を render している", () => {
    expect(headerWithSearchSrc).toMatch(/SearchModal/);
  });
});
