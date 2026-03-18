import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import Header from "../Header";

// Mock next/navigation for SearchModal (rendered via SearchTrigger) and NavLinks / MobileNav (usePathname)
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock useAchievements for StreakBadge (renders inside Header)
vi.mock("@/lib/achievements/useAchievements", () => ({
  useAchievements: () => ({
    store: null,
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }),
  );
});

describe("Header", () => {
  test("renders logo link to home", () => {
    render(<Header />);
    const logo = screen.getByRole("link", { name: "yolos.net" });
    expect(logo).toHaveAttribute("href", "/");
  });

  test("renders navigation with correct aria-label", () => {
    render(<Header />);
    expect(
      screen.getByRole("navigation", { name: "メインナビゲーション" }),
    ).toBeInTheDocument();
  });

  test("renders all navigation links", () => {
    render(<Header />);
    const expectedLinks = [
      { name: "ホーム", href: "/" },
      { name: "ツール", href: "/tools" },
      { name: "遊ぶ", href: "/play" },
      { name: "辞典", href: "/dictionary" },
      { name: "ブログ", href: "/blog" },
      { name: "サイト紹介", href: "/about" },
    ];
    for (const { name, href } of expectedLinks) {
      // getAllByRole because both desktop and mobile links exist
      const links = screen.getAllByRole("link", { name });
      const hasCorrectHref = links.some(
        (link) => link.getAttribute("href") === href,
      );
      expect(hasCorrectHref).toBe(true);
    }
  });

  test("renders navigation links in correct order: ホーム / 遊ぶ / ツール / 辞典 / ブログ / サイト紹介", () => {
    render(<Header />);
    // デスクトップ用 ul 内のリンク順序を検証する
    const navList = screen
      .getByRole("navigation", { name: "メインナビゲーション" })
      .querySelector("ul");
    expect(navList).not.toBeNull();
    const items = Array.from(navList!.querySelectorAll("li a")).map(
      (a) => a.textContent,
    );
    expect(items).toEqual([
      "ホーム",
      "遊ぶ",
      "ツール",
      "辞典",
      "ブログ",
      "サイト紹介",
    ]);
  });

  test("does not render クイズ navigation link", () => {
    render(<Header />);
    const quizLinks = screen.queryAllByRole("link", { name: "クイズ" });
    expect(quizLinks.length).toBe(0);
  });

  test("renders hamburger button", () => {
    render(<Header />);
    expect(
      screen.getByRole("button", { name: "メニューを開く" }),
    ).toBeInTheDocument();
  });

  // WCAG タップターゲット44px保証
  test(".logo has min-height: 44px for WCAG tap target", () => {
    const cssPath = resolve(__dirname, "../Header.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // .logo ブロック内に min-height: 44px が含まれているかを検証
    const logoBlock = css.match(/\.logo\s*\{[^}]+\}/)?.[0] ?? "";
    expect(logoBlock).toContain("min-height: 44px");
  });
});
