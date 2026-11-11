import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

/**
 * Footer のテストは「機能・整合性の安全装置」のみ。
 * 純粋なスタイリングや DOM 構造のチェックは `.claude/rules/testing.md` の
 * 方針に従って書かない。
 */
describe("Footer", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  test("AI 運営の告知が描画される（constitution 規則3の安全装置）", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    // AI が運営する実験であることと、内容が壊れていたり誤っていたりしうることを伝える。
    expect(footer.textContent).toContain("AI");
    expect(footer.textContent).toContain("実験");
    expect(footer.textContent).toContain("壊れて");
    expect(footer.textContent).toContain("誤って");
  });

  test("サイト紹介とプライバシーへのリンクを持つ", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "サイト紹介" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByRole("link", { name: "プライバシー" })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });

  test("いま開いているページを指すリンクは現在地になる", () => {
    mockPathname = "/privacy";
    render(<Footer />);
    expect(screen.getByRole("link", { name: "プライバシー" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "サイト紹介" }),
    ).not.toHaveAttribute("aria-current");
  });
});
