import { expect, test, describe } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MobileNav from "../MobileNav";

const mockLinks = [
  { href: "/", label: "ホーム" },
  { href: "/tools", label: "ツール" },
  { href: "/about", label: "About" },
] as const;

describe("MobileNav", () => {
  test("renders hamburger button with correct initial aria-label", () => {
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("toggles menu open and closed on button click", () => {
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
    render(<MobileNav links={mockLinks} />);
    for (const link of mockLinks) {
      expect(
        screen.getByRole("menuitem", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }
  });

  test("closes menu when a link is clicked", () => {
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open
    expect(button).toHaveAttribute("aria-expanded", "true");

    const menuItem = screen.getByRole("menuitem", { name: "ツール" });
    fireEvent.click(menuItem);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("closes menu on Escape key", () => {
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("menu has correct aria-controls and id", () => {
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });
    expect(button).toHaveAttribute("aria-controls", "mobile-menu");
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();
  });
});
