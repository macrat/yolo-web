import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import GamesPage from "../page";

test("Games page renders heading", () => {
  render(<GamesPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /ゲーム一覧/ }),
  ).toBeInTheDocument();
});

test("Games page renders games list", () => {
  render(<GamesPage />);
  expect(screen.getByRole("list", { name: "Games list" })).toBeInTheDocument();
});

test("Games page renders link to Kanji Kanaru", () => {
  render(<GamesPage />);
  const link = screen.getByRole("link", { name: /漢字カナール/ });
  expect(link).toHaveAttribute("href", "/games/kanji-kanaru");
});

test("Games page renders AI disclaimer", () => {
  render(<GamesPage />);
  expect(
    screen.getByRole("note", { name: "AI disclaimer" }),
  ).toBeInTheDocument();
});

test("Games page renders description", () => {
  render(<GamesPage />);
  expect(
    screen.getByText(/ブラウザで遊べる無料ゲーム集です/),
  ).toBeInTheDocument();
});
