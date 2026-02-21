import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

// Mock next/navigation for SearchModal (rendered via SearchTrigger)
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
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
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
  });

  test("renders all navigation links", () => {
    render(<Header />);
    const expectedLinks = [
      { name: "ホーム", href: "/" },
      { name: "ツール", href: "/tools" },
      { name: "チートシート", href: "/cheatsheets" },
      { name: "ゲーム", href: "/games" },
      { name: "クイズ", href: "/quiz" },
      { name: "辞典", href: "/dictionary" },
      { name: "ブログ", href: "/blog" },
      { name: "メモ", href: "/memos" },
      { name: "About", href: "/about" },
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

  test("renders hamburger button", () => {
    render(<Header />);
    expect(
      screen.getByRole("button", { name: "メニューを開く" }),
    ).toBeInTheDocument();
  });
});
