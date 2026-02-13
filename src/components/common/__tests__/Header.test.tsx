import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

describe("Header", () => {
  test("renders logo link to home", () => {
    render(<Header />);
    const logo = screen.getByRole("link", { name: "Yolo-Web" });
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
      { name: "ゲーム", href: "/games" },
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
