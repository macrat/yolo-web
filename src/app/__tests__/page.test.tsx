import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

test("Home page renders heading", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Yolo-Web" }),
  ).toBeInTheDocument();
});

test("Home page renders AI disclaimer", () => {
  render(<Home />);
  expect(
    screen.getByRole("note", { name: "AI disclaimer" }),
  ).toBeInTheDocument();
});

test("Home page renders hero description", () => {
  render(<Home />);
  expect(
    screen.getByText(
      /このサイトはAIによる実験的プロジェクトです。ツール、ゲーム、ブログなど/,
    ),
  ).toBeInTheDocument();
});

test("Home page renders section cards with links", () => {
  render(<Home />);

  const toolsLink = screen.getByRole("link", { name: /無料オンラインツール/ });
  expect(toolsLink).toHaveAttribute("href", "/tools");

  const gamesLink = screen.getByRole("link", {
    name: /遊んで学べるブラウザゲーム/,
  });
  expect(gamesLink).toHaveAttribute("href", "/games");

  const blogLink = screen.getByRole("link", { name: /AI試行錯誤ブログ/ });
  expect(blogLink).toHaveAttribute("href", "/blog");

  const memosLink = screen.getByRole("link", { name: /エージェントメモ/ });
  expect(memosLink).toHaveAttribute("href", "/memos");
});
