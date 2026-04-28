import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import SiteHeader from "../SiteHeader";

const NAV_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/tools", label: "ツール" },
];

describe("SiteHeader", () => {
  // --- レンダリング ---

  test("renders header landmark", () => {
    render(<SiteHeader navLinks={NAV_LINKS} siteName="yolos.net" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  test("renders navigation landmark", () => {
    render(<SiteHeader navLinks={NAV_LINKS} siteName="yolos.net" />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("renders site name as link to root", () => {
    render(<SiteHeader navLinks={NAV_LINKS} siteName="yolos.net" />);
    const link = screen.getByRole("link", { name: /yolos\.net/i });
    expect(link).toHaveAttribute("href", "/");
  });

  test("renders all nav links with correct href", () => {
    render(<SiteHeader navLinks={NAV_LINKS} siteName="yolos.net" />);
    const toolsLink = screen.getByRole("link", { name: "ツール" });
    expect(toolsLink).toHaveAttribute("href", "/tools");
  });

  test("renders each navLink label as text", () => {
    render(<SiteHeader navLinks={NAV_LINKS} siteName="yolos.net" />);
    expect(screen.getByText("ホーム")).toBeInTheDocument();
    expect(screen.getByText("ツール")).toBeInTheDocument();
  });

  // --- アクセシビリティ ---

  test("navigation has accessible label", () => {
    render(<SiteHeader navLinks={NAV_LINKS} siteName="yolos.net" />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label");
  });

  // --- データバリエーション ---

  test("renders with minimal single nav link", () => {
    render(
      <SiteHeader
        navLinks={[{ href: "/", label: "トップ" }]}
        siteName="yolos.net"
      />,
    );
    expect(screen.getByRole("link", { name: "トップ" })).toBeInTheDocument();
  });

  test("renders with custom siteName", () => {
    render(<SiteHeader navLinks={NAV_LINKS} siteName="test site" />);
    expect(screen.getByText("test site")).toBeInTheDocument();
  });

  // --- E-1: モバイル幅レイアウト（CSS 構造テスト） ---

  test("SiteHeader.module.css contains @media (min-width: query for responsive layout", () => {
    // モバイルファースト設計: モバイル幅でナビが収まるよう min-width メディアクエリが必要。
    const cssPath = resolve(__dirname, "../SiteHeader.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/@media\s*\(min-width:/);
  });

  test("SiteHeader.module.css navList has mobile-safe layout (overflow or wrap)", () => {
    // モバイル幅でナビリンクが見切れないよう、flex-wrap または display:none での対応が必要。
    // - モバイル基準として .navList に display:none を設定するか
    // - .navList に flex-wrap: wrap を設定するか、のどちらかであればよい。
    const cssPath = resolve(__dirname, "../SiteHeader.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // .navList ブロックを抽出（コメント含む可能性を考慮して幅広くマッチ）
    const navListBlock = css.match(/\.navList\s*\{[^}]*\}/)?.[0] ?? "";
    const hasMobileNavSafety =
      /flex-wrap:\s*wrap/.test(navListBlock) ||
      /display:\s*none/.test(navListBlock);
    expect(hasMobileNavSafety).toBe(true);
  });
});
