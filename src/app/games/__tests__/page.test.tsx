import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import GamesPage from "../page";

test("Games page renders hero banner with challenge heading", () => {
  render(<GamesPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /毎日4つのパズルに挑戦/ }),
  ).toBeInTheDocument();
});

test("Games page renders today's date", () => {
  render(<GamesPage />);
  expect(screen.getByText(/のパズル$/)).toBeInTheDocument();
});

test("Games page renders games list", () => {
  render(<GamesPage />);
  expect(screen.getByRole("list", { name: "Games list" })).toBeInTheDocument();
});

test("Games page renders link to Kanji Kanaru", () => {
  render(<GamesPage />);
  const list = screen.getByRole("list", { name: "Games list" });
  const link = within(list).getByRole("link", { name: /漢字カナール/ });
  expect(link).toHaveAttribute("href", "/games/kanji-kanaru");
});

test("Games page renders difficulty badges", () => {
  render(<GamesPage />);
  expect(screen.getByText("初級〜中級")).toBeInTheDocument();
  expect(screen.getByText("中級〜上級")).toBeInTheDocument();
  expect(screen.getAllByText("初級〜上級")).toHaveLength(2);
});

test("Games page renders AI disclaimer", () => {
  render(<GamesPage />);
  expect(
    screen.getByRole("note", { name: "AI disclaimer" }),
  ).toBeInTheDocument();
});

test("Games page renders all-clear encouragement text", () => {
  render(<GamesPage />);
  expect(
    screen.getByText(/全ゲームクリアで今日の完全制覇/),
  ).toBeInTheDocument();
});
