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

  test("renders all navigation links in menu", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    for (const link of mockLinks) {
      expect(
        screen.getByRole("menuitem", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }
  });

  test("closes menu when a link is clicked", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open
    expect(button).toHaveAttribute("aria-expanded", "true");

    const menuItem = screen.getByRole("menuitem", { name: "ツール" });
    fireEvent.click(menuItem);
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

  test("applies activeLink class to home link when path is '/'", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNav links={mockLinks} />);
    const homeLink = screen.getByRole("menuitem", { name: "ホーム" });
    expect(homeLink.className).toContain("activeLink");
  });

  test("does not apply activeLink class to home link when path is '/tools'", () => {
    mockUsePathname.mockReturnValue("/tools");
    render(<MobileNav links={mockLinks} />);
    const homeLink = screen.getByRole("menuitem", { name: "ホーム" });
    expect(homeLink.className).not.toContain("activeLink");
  });

  test("applies activeLink class to /tools link when path is '/tools'", () => {
    mockUsePathname.mockReturnValue("/tools");
    render(<MobileNav links={mockLinks} />);
    const toolsLink = screen.getByRole("menuitem", { name: "ツール" });
    expect(toolsLink.className).toContain("activeLink");
  });

  test("does not apply activeLink to non-active links", () => {
    mockUsePathname.mockReturnValue("/tools");
    render(<MobileNav links={mockLinks} />);
    const aboutLink = screen.getByRole("menuitem", { name: "About" });
    expect(aboutLink.className).not.toContain("activeLink");
  });
});
