import { expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import KanjiKanaruPage from "../page";

// Mock the GameContainer since it relies on client-side APIs
vi.mock("@/play/games/kanji-kanaru/_components/GameContainer", () => ({
  default: () => <div data-testid="game-container">GameContainer</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("KanjiKanaruPage renders without crashing", () => {
  render(<KanjiKanaruPage />);
  expect(screen.getByTestId("game-container")).toBeInTheDocument();
});

test("KanjiKanaruPage renders breadcrumb navigation", () => {
  render(<KanjiKanaruPage />);
  expect(
    screen.getByRole("navigation", { name: "パンくずリスト" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(screen.getByRole("link", { name: "遊ぶ" })).toHaveAttribute(
    "href",
    "/play",
  );
});

test("KanjiKanaruPage renders KANJIDIC2 attribution", () => {
  render(<KanjiKanaruPage />);
  expect(screen.getByRole("link", { name: "KANJIDIC2" })).toBeInTheDocument();
});
