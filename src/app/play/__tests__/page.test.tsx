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

  it("renders all 4 category section headings", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: "占い" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "性格診断" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "知識テスト" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "ゲーム" }),
    ).toBeInTheDocument();
  });

  it("renders all 19 content cards", () => {
    render(<PlayPage />);
    // すべてのカテゴリリストを取得してリンク合計数が19であることを確認
    const links = screen
      .getAllByRole("list", { name: /category/ })
      .flatMap((list) => within(list).getAllByRole("link"));
    expect(links.length).toBe(19);
  });

  it("renders links with /play/ path", () => {
    render(<PlayPage />);
    const links = screen
      .getAllByRole("list", { name: /category/ })
      .flatMap((list) => within(list).getAllByRole("link"));
    links.forEach((link) => {
      expect(link.getAttribute("href")).toMatch(/^\/play\//);
    });
  });

  it("does not render quiz guidance section linking to /quiz", () => {
    render(<PlayPage />);
    const quizLink = screen.queryByRole("link", { name: /クイズ・診断/ });
    expect(quizLink).toBeNull();
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

  it("category sections display correct number of items (fortune:1, personality:11, knowledge:3, game:4)", () => {
    render(<PlayPage />);
    const [fortuneList, personalityList, knowledgeList, gameList] =
      screen.getAllByRole("list", { name: /category/ });
    expect(within(fortuneList).getAllByRole("link").length).toBe(1);
    expect(within(personalityList).getAllByRole("link").length).toBe(11);
    expect(within(knowledgeList).getAllByRole("link").length).toBe(3);
    expect(within(gameList).getAllByRole("link").length).toBe(4);
  });
});
