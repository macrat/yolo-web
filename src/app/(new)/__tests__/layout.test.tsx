/**
 * (new)/layout.tsx 検索ボタン結線テスト
 *
 * cycle-185 B-334-4-5 致命的 UI 退行への対処として、
 * SearchTrigger が (new)/layout.tsx の actions スロット経由で
 * Header にレンダリングされることを確認する。
 *
 * Phase 5 (B-331) で新検索コンポーネントに置き換える際は本テストも更新すること。
 */
import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// layout.tsx のソースコードを読み込んで SearchTrigger の import と使用を確認する。
// Server Component である layout は jsdom でレンダリングできないため、
// ソースコード解析で構造を検証する。
const layoutSrc = readFileSync(resolve(__dirname, "../layout.tsx"), "utf-8");

describe("(new)/layout.tsx に SearchTrigger が結線されている", () => {
  test("SearchTrigger が import されている", () => {
    // import 文に SearchTrigger が含まれていること
    expect(layoutSrc).toMatch(/import.*SearchTrigger/);
  });

  test("SearchTrigger が JSX 内で使用されている", () => {
    // JSX 内に <SearchTrigger が存在すること
    expect(layoutSrc).toMatch(/<SearchTrigger/);
  });

  test("SearchTrigger が Header の actions スロット内にある構造になっている", () => {
    // actions prop の中に SearchTrigger が含まれている
    // actions={...} ブロック内に <SearchTrigger が存在すること
    const actionsMatch = layoutSrc.match(/actions=\{([\s\S]*?)\}/);
    expect(actionsMatch).not.toBeNull();
    expect(actionsMatch![0]).toContain("SearchTrigger");
  });
});
