/**
 * SkipLink コンポーネントテスト（F1 / WCAG 2.4.1 Bypass Blocks）。
 * スキップリンクが存在し、layout.tsx の <main id="main-content"> を指すことを検証する。
 */
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SkipLink, { MAIN_CONTENT_ID } from "..";

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
    // href と main の id を束ねる単一の定数（layout.tsx が同じ値を <main> に付与する）。
    expect(MAIN_CONTENT_ID).toBe("main-content");
  });
});
