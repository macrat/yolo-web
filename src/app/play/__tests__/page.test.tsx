import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import PlayPage from "../page";

describe("PlayPage", () => {
  it("renders the page heading", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /遊ぶ/ }),
    ).toBeInTheDocument();
  });

  it("renders the play content list", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("list", { name: "Play contents list" }),
    ).toBeInTheDocument();
  });

  it("renders all 4 game cards", () => {
    render(<PlayPage />);
    const list = screen.getByRole("list", { name: "Play contents list" });
    const links = within(list).getAllByRole("link");
    expect(links.length).toBe(4);
  });

  it("renders links with /play/ path", () => {
    render(<PlayPage />);
    const list = screen.getByRole("list", { name: "Play contents list" });
    const links = within(list).getAllByRole("link");
    links.forEach((link) => {
      expect(link.getAttribute("href")).toMatch(/^\/play\//);
    });
  });

  it("renders quiz guidance section", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("link", { name: /クイズ・診断/ }),
    ).toBeInTheDocument();
  });

  it("quiz guidance links to /quiz", () => {
    render(<PlayPage />);
    const quizLink = screen.getByRole("link", { name: /クイズ・診断/ });
    expect(quizLink).toHaveAttribute("href", "/quiz");
  });

  it("renders breadcrumb navigation", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("navigation", { name: "パンくずリスト" }),
    ).toBeInTheDocument();
  });

  it("renders home link in breadcrumb", () => {
    render(<PlayPage />);
    const breadcrumb = screen.getByRole("navigation", {
      name: "パンくずリスト",
    });
    expect(
      within(breadcrumb).getByRole("link", { name: "ホーム" }),
    ).toBeInTheDocument();
  });
});
