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
    // All registered quizzes should be displayed
    expect(screen.getByText("漢字力診断")).toBeInTheDocument();
    expect(screen.getByText("ことわざ・慣用句力診断")).toBeInTheDocument();
    expect(
      screen.getByText("あなたを日本の伝統色に例えると?"),
    ).toBeInTheDocument();
    expect(screen.getByText("四字熟語力診断")).toBeInTheDocument();
    expect(screen.getByText("あなたを四字熟語に例えると?")).toBeInTheDocument();
  });

  it("renders type badges", () => {
    render(<QuizListPage />);
    const knowledgeBadges = screen.getAllByText("知識テスト");
    const personalityBadges = screen.getAllByText("性格診断");
    expect(knowledgeBadges.length).toBe(3);
    expect(personalityBadges.length).toBe(2);
  });

  it("renders links to individual quiz pages", () => {
    render(<QuizListPage />);
    const links = screen.getAllByRole("link", { name: /挑戦する/ });
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});
