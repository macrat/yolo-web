/**
 * src/app/layout.tsx 構造テスト
 *
 * Header の onSearchOpen prop が未設定のため、検索ボタンは
 * 表示されない設計（cycle-181 = Phase 4.1 で確立）。検索コンポーネントの結線は
 * Phase 5 = B-331 のスコープであり、Phase 5 着手時に本テストを更新すること。
 */
import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const layoutSrc = readFileSync(resolve(__dirname, "../layout.tsx"), "utf-8");

describe("app/layout.tsx の構造", () => {
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

  // cycle-279 C1 で (legacy)/__tests__/metadata.test.ts から移設。
  // playLinks は Footer.tsx の DEFAULT_PLAY_LINKS をデフォルト値として使うため、
  // layout.tsx 側で二重定義・prop 渡しをしないことを回帰ガードする。
  test("layout.tsx does not define a local playLinks constant (no duplicate with Footer.tsx)", () => {
    expect(layoutSrc).not.toMatch(/const\s+playLinks\s*=/);
  });

  test("layout.tsx passes no playLinks prop to Footer (uses Footer default)", () => {
    expect(layoutSrc).not.toMatch(/<Footer\s[^>]*playLinks=/);
  });
});
