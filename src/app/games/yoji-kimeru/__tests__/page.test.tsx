import { expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import YojiKimeruPage from "../page";

// Mock the GameContainer since it relies on client-side APIs
vi.mock("@/games/yoji-kimeru/_components/GameContainer", () => ({
  default: () => <div data-testid="game-container">GameContainer</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("YojiKimeruPage renders without crashing", () => {
  render(<YojiKimeruPage />);
  expect(screen.getByTestId("game-container")).toBeInTheDocument();
});

test("YojiKimeruPage renders breadcrumb navigation", () => {
  render(<YojiKimeruPage />);
  expect(
    screen.getByRole("navigation", { name: "パンくずリスト" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(screen.getByRole("link", { name: "ゲーム" })).toHaveAttribute(
    "href",
    "/games",
  );
});
