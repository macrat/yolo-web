/**
 * (new)/layout.tsx 構造テスト
 *
 * (new)/ 配下では Header の onSearchOpen prop が未設定のため、検索ボタンは
 * 表示されない設計（cycle-181 = Phase 4.1 で確立）。検索コンポーネントの結線は
 * Phase 5 = B-331 のスコープであり、Phase 5 着手時に本テストを更新すること。
 */
import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const layoutSrc = readFileSync(resolve(__dirname, "../layout.tsx"), "utf-8");

describe("(new)/layout.tsx の構造", () => {
  test("Header が import されている", () => {
    expect(layoutSrc).toMatch(
      /import Header from ["']@\/components\/Header["']/,
    );
  });

  test("Header JSX に onSearchOpen prop が渡されていない（Phase 5 で結線予定）", () => {
    // コメント内の "onSearchOpen" は除外し、<Header ... /> JSX 内のみを検査する
    const headerJsx = layoutSrc.match(/<Header\b[\s\S]*?\/>/);
    expect(headerJsx).not.toBeNull();
    expect(headerJsx![0]).not.toMatch(/onSearchOpen/);
  });
});
