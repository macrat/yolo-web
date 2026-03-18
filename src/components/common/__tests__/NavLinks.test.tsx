import { expect, test, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NavLinks from "../NavLinks";

const mockLinks = [
  { href: "/", label: "ホーム" },
  { href: "/play", label: "遊ぶ" },
  { href: "/tools", label: "ツール" },
  { href: "/blog", label: "ブログ" },
] as const;

// usePathname のモック
const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("NavLinks", () => {
  test("renders all navigation links", () => {
    mockUsePathname.mockReturnValue("/");
    render(<NavLinks links={mockLinks} />);
    for (const link of mockLinks) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.href,
      );
    }
  });

  test("applies active class to home link on exact match '/'", () => {
    mockUsePathname.mockReturnValue("/");
    render(<NavLinks links={mockLinks} />);
    const homeLink = screen.getByRole("link", { name: "ホーム" });
    expect(homeLink.className).toContain("active");
  });

  test("does not apply active class to home link when path is '/play'", () => {
    mockUsePathname.mockReturnValue("/play");
    render(<NavLinks links={mockLinks} />);
    const homeLink = screen.getByRole("link", { name: "ホーム" });
    expect(homeLink.className).not.toContain("active");
  });

  test("applies active class to /play link when path startsWith '/play'", () => {
    mockUsePathname.mockReturnValue("/play/some-game");
    render(<NavLinks links={mockLinks} />);
    const playLink = screen.getByRole("link", { name: "遊ぶ" });
    expect(playLink.className).toContain("active");
  });

  test("applies active class to /tools link when path is '/tools'", () => {
    mockUsePathname.mockReturnValue("/tools");
    render(<NavLinks links={mockLinks} />);
    const toolsLink = screen.getByRole("link", { name: "ツール" });
    expect(toolsLink.className).toContain("active");
  });

  test("applies active class to /blog link when path startsWith '/blog'", () => {
    mockUsePathname.mockReturnValue("/blog/some-post");
    render(<NavLinks links={mockLinks} />);
    const blogLink = screen.getByRole("link", { name: "ブログ" });
    expect(blogLink.className).toContain("active");
  });

  test("does not apply active class to non-current link", () => {
    mockUsePathname.mockReturnValue("/tools");
    render(<NavLinks links={mockLinks} />);
    const playLink = screen.getByRole("link", { name: "遊ぶ" });
    expect(playLink.className).not.toContain("active");
    const blogLink = screen.getByRole("link", { name: "ブログ" });
    expect(blogLink.className).not.toContain("active");
  });

  test("renders links in a list", () => {
    mockUsePathname.mockReturnValue("/");
    render(<NavLinks links={mockLinks} />);
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    const items = list.querySelectorAll("li");
    expect(items.length).toBe(mockLinks.length);
  });
});
