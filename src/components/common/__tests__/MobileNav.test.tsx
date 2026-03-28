import { expect, test, describe, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MobileNav from "../MobileNav";

const mockLinks = [
  { href: "/", label: "ホーム" },
  { href: "/tools", label: "ツール" },
  { href: "/about", label: "About" },
] as const;

// usePathname のモック
const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("MobileNav", () => {
  test("renders hamburger button with correct initial aria-label", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("toggles menu open and closed on button click", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    // Open
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-label", "メニューを閉じる");

    // Close
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-label", "メニューを開く");
  });

  test("renders all navigation links in menu when open", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    // メニューを開いてからリンクを確認する（aria-hidden が解除された状態）
    fireEvent.click(button);
    for (const link of mockLinks) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.href,
      );
    }
  });

  test("closes menu when a link is clicked", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open
    expect(button).toHaveAttribute("aria-expanded", "true");

    const menuLink = screen.getByRole("link", { name: "ツール" });
    fireEvent.click(menuLink);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("closes menu on Escape key", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("menu has correct aria-controls and id", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });
    expect(button).toHaveAttribute("aria-controls", "mobile-menu");
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();
  });

  test("menu list has aria-label for identification", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const menuList = document.getElementById("mobile-menu");
    expect(menuList).toHaveAttribute("aria-label", "モバイルメニュー");
  });

  test("menu list has aria-hidden true when closed", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const menuList = document.getElementById("mobile-menu");
    expect(menuList).toHaveAttribute("aria-hidden", "true");
  });

  test("menu list does not have aria-hidden when open", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open
    const menuList = document.getElementById("mobile-menu");
    expect(menuList).not.toHaveAttribute("aria-hidden");
  });

  test("applies activeLink class to home link when path is '/'", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open to make links accessible
    const homeLink = screen.getByRole("link", { name: "ホーム" });
    expect(homeLink.className).toContain("activeLink");
  });

  test("does not apply activeLink class to home link when path is '/tools'", () => {
    mockUsePathname.mockReturnValue("/tools");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open to make links accessible
    const homeLink = screen.getByRole("link", { name: "ホーム" });
    expect(homeLink.className).not.toContain("activeLink");
  });

  test("applies activeLink class to /tools link when path is '/tools'", () => {
    mockUsePathname.mockReturnValue("/tools");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open to make links accessible
    const toolsLink = screen.getByRole("link", { name: "ツール" });
    expect(toolsLink.className).toContain("activeLink");
  });

  test("does not apply activeLink to non-active links", () => {
    mockUsePathname.mockReturnValue("/tools");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open to make links accessible
    const aboutLink = screen.getByRole("link", { name: "About" });
    expect(aboutLink.className).not.toContain("activeLink");
  });
});
