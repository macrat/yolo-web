/**
 * src/app/layout.tsx 構造テスト
 *
 * スキップのリンク・上端・中間・下端は SiteFrame が組むので、layout はそれを置くだけにする。
 */
import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const layoutSrc = readFileSync(resolve(__dirname, "../layout.tsx"), "utf-8");

describe("app/layout.tsx の構造", () => {
  test("どのページにも共通の枠（SiteFrame）の中にページを置く", () => {
    expect(layoutSrc).toMatch(
      /import SiteFrame from ["']@\/components\/SiteFrame["']/,
    );
    expect(layoutSrc).toMatch(/<SiteFrame>\{children\}<\/SiteFrame>/);
  });

  test("theme-color を端末のテーマごとに出す viewport を持つ", () => {
    expect(layoutSrc).toMatch(
      /export const viewport: Viewport = sharedViewport/,
    );
  });
});
