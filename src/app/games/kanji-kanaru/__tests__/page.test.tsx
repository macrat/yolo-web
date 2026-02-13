import { expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import KanjiKanaruPage from "../page";

// Mock the GameContainer since it relies on client-side APIs
vi.mock("@/components/games/kanji-kanaru/GameContainer", () => ({
  default: () => <div data-testid="game-container">GameContainer</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("KanjiKanaruPage renders without crashing", () => {
  render(<KanjiKanaruPage />);
  expect(screen.getByTestId("game-container")).toBeInTheDocument();
});

test("KanjiKanaruPage renders a main element", () => {
  render(<KanjiKanaruPage />);
  expect(screen.getByRole("main")).toBeInTheDocument();
});
