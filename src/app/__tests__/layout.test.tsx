/**
 * src/app/layout.tsx 構造テスト
 *
 * 上端・下端は全ページで同じ内容なので、layout から何も渡さない。
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

  test("Header と Footer に props を渡さない", () => {
    expect(layoutSrc).toMatch(/<Header\s*\/>/);
    expect(layoutSrc).toMatch(/<Footer\s*\/>/);
  });

  test("theme-color を端末のテーマごとに出す viewport を持つ", () => {
    expect(layoutSrc).toMatch(
      /export const viewport: Viewport = sharedViewport/,
    );
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
