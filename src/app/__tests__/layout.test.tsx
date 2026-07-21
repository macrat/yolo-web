/**
 * src/app/layout.tsx 構造テスト
 *
 * Header は actions スロット（ThemeToggle）のみを受け取る。
 * サイト内検索機能は恒久撤去済みで、Header にも検索関連の prop は存在しない。
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

  test("Header JSX が actions スロットを受け取る", () => {
    const headerJsx = layoutSrc.match(/<Header\b[\s\S]*?\/>/);
    expect(headerJsx).not.toBeNull();
    expect(headerJsx![0]).toMatch(/actions=/);
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

  // F1 / WCAG 2.4.1 Bypass Blocks: スキップリンクとスキップ先 main の回帰ガード。
  test("SkipLink が import され Header より前に描画される", () => {
    expect(layoutSrc).toMatch(
      /import SkipLink,\s*\{\s*MAIN_CONTENT_ID\s*\}\s*from ["']@\/components\/SkipLink["']/,
    );
    // body 直下の最初の focusable 要素であるため、JSX 上で Header より前に現れる。
    const skipIndex = layoutSrc.indexOf("<SkipLink");
    const headerIndex = layoutSrc.indexOf("<Header");
    expect(skipIndex).toBeGreaterThanOrEqual(0);
    expect(headerIndex).toBeGreaterThanOrEqual(0);
    expect(skipIndex).toBeLessThan(headerIndex);
  });

  test("main がスキップ先の id と tabIndex={-1} を持つ", () => {
    const mainTag = layoutSrc.match(/<main\b[\s\S]*?>/);
    expect(mainTag).not.toBeNull();
    expect(mainTag![0]).toMatch(/id=\{MAIN_CONTENT_ID\}/);
    expect(mainTag![0]).toMatch(/tabIndex=\{-1\}/);
  });
});
