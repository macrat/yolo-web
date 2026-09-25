/**
 * AI 運営の告知（constitution 規則3・DESIGN.md §9）が、通常のページ・404・410 のどれにも出ることの検査。
 *
 * 通常のページと 404 は、<html> を描くルートのレイアウトが SiteFrame を置き、その下端が告知を出す。
 * 410 は middleware が静的な HTML を返すので、その下端に同じ文言があることを見る。
 */
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import fg from "fast-glob";
import SiteFrame from "@/components/SiteFrame";
import { AI_NOTICE } from "@/lib/site-frame";
import { build410Html } from "@/middleware";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const APP_DIR = resolve(__dirname, "..");

/** <html> の要素を描くファイル（ルートのレイアウトと global-not-found）。コメントの「<html>」は拾わない。 */
const rootDocuments = fg
  .sync(["**/*.{tsx,jsx,js}"], { cwd: APP_DIR, ignore: ["**/__tests__/**"] })
  .filter((file) =>
    readFileSync(resolve(APP_DIR, file), "utf-8").includes("<html "),
  );

describe("AI 運営の告知がどのページにも出る", () => {
  test("告知は AI が運営する実験であることと、内容が壊れていたり誤っていたりしうることを言う", () => {
    for (const phrase of ["AI", "実験", "壊れて", "誤って"]) {
      expect(AI_NOTICE).toContain(phrase);
    }
  });

  test("<html> を描くファイルは、通常のページのレイアウトと 404 の2つ", () => {
    expect(rootDocuments.sort()).toEqual(["global-not-found.js", "layout.tsx"]);
  });

  test.each(rootDocuments)("%s は SiteFrame の中にページを置く", (file) => {
    const source = readFileSync(resolve(APP_DIR, file), "utf-8");
    expect(source).toMatch(
      /import SiteFrame from ["']@\/components\/SiteFrame["']/,
    );
    expect(source).toMatch(/<SiteFrame>[\s\S]*<\/SiteFrame>/);
  });

  test("SiteFrame は下端に告知を出す", () => {
    render(
      <SiteFrame>
        <p>本文</p>
      </SiteFrame>,
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent(AI_NOTICE);
  });

  test("410 のページは下端に告知を出す", () => {
    const footer = build410Html().match(/<footer>[\s\S]*<\/footer>/);
    expect(footer).not.toBeNull();
    expect(footer![0]).toContain(AI_NOTICE);
  });
});
