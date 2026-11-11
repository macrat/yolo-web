/**
 * SkipLink コンポーネントテスト（F1 / WCAG 2.4.1 Bypass Blocks）。
 * スキップリンクが存在し、SiteFrame の <main id="main-content"> を指すことを検証する。
 */
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SkipLink from "..";
import { MAIN_CONTENT_ID } from "@/lib/site-frame";

describe("SkipLink", () => {
  test("メインコンテンツを指すスキップリンクをレンダリングする", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", {
      name: "メインコンテンツへスキップ",
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", `#${MAIN_CONTENT_ID}`);
  });

  test("スキップ先 id は main-content である", () => {
    // href と main の id を束ねる単一の定数（SiteFrame と 410 のページが同じ値を <main> に付ける）。
    expect(MAIN_CONTENT_ID).toBe("main-content");
  });
});
