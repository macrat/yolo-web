import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import QuizListPage from "../page";

describe("QuizListPage", () => {
  it("renders the page heading", () => {
    render(<QuizListPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /クイズ・診断/ }),
    ).toBeInTheDocument();
  });

  it("renders quiz cards for each registered quiz", () => {
    render(<QuizListPage />);
    // Both kanji-level and traditional-color quizzes should be displayed
    expect(screen.getByText("漢字力診断")).toBeInTheDocument();
    expect(
      screen.getByText("あなたを日本の伝統色に例えると?"),
    ).toBeInTheDocument();
  });

  it("renders type badges", () => {
    render(<QuizListPage />);
    expect(screen.getByText("知識テスト")).toBeInTheDocument();
    expect(screen.getByText("性格診断")).toBeInTheDocument();
  });

  it("renders links to individual quiz pages", () => {
    render(<QuizListPage />);
    const links = screen.getAllByRole("link", { name: /挑戦する/ });
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});
