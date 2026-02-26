import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import GameBoard from "@/games/yoji-kimeru/_components/GameBoard";
import type { YojiGuessFeedback } from "@/games/yoji-kimeru/_lib/types";

describe("GameBoard", () => {
  test("renders empty board with correct number of rows", () => {
    render(<GameBoard guesses={[]} maxGuesses={6} />);
    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();

    // 6 guess rows (no header row for yoji-kimeru)
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(6);
  });

  test("renders empty cells in each row", () => {
    render(<GameBoard guesses={[]} maxGuesses={6} />);
    // 6 rows x 4 empty cells = 24 cells
    const cells = screen.getAllByRole("cell");
    expect(cells).toHaveLength(24);
  });

  test("renders filled row with feedback", () => {
    const guesses: YojiGuessFeedback[] = [
      {
        guess: "花鳥風月",
        charFeedbacks: ["correct", "correct", "correct", "correct"],
      },
    ];

    render(<GameBoard guesses={guesses} maxGuesses={6} />);

    // The guessed characters should appear in the grid
    expect(screen.getByText("花")).toBeInTheDocument();
    expect(screen.getByText("鳥")).toBeInTheDocument();
    expect(screen.getByText("風")).toBeInTheDocument();
    expect(screen.getByText("月")).toBeInTheDocument();
  });

  test("renders multiple filled rows", () => {
    const guesses: YojiGuessFeedback[] = [
      {
        guess: "花鳥風月",
        charFeedbacks: ["absent", "absent", "absent", "absent"],
      },
      {
        guess: "一期一会",
        charFeedbacks: ["correct", "present", "correct", "absent"],
      },
    ];

    render(<GameBoard guesses={guesses} maxGuesses={6} />);

    expect(screen.getByText("花")).toBeInTheDocument();
    expect(screen.getByText("鳥")).toBeInTheDocument();
    expect(screen.getByText("期")).toBeInTheDocument();
  });
});
