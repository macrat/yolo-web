import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import GameBoard from "@/games/kanji-kanaru/_components/GameBoard";
import type { GuessFeedback } from "@/games/kanji-kanaru/_lib/types";

describe("GameBoard", () => {
  test("renders empty board with correct number of rows", () => {
    render(<GameBoard guesses={[]} maxGuesses={6} />);
    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();

    // 1 header row + 6 guess rows = 7 rows
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(7);
  });

  test("renders column headers", () => {
    render(<GameBoard guesses={[]} maxGuesses={6} />);
    const headers = screen.getAllByRole("columnheader");
    // 6 columns: empty + 部首 + 画数 + 学年 + 音読み + 意味
    expect(headers).toHaveLength(6);
    expect(headers[1]).toHaveTextContent("部首");
    expect(headers[2]).toHaveTextContent("画数");
    expect(headers[3]).toHaveTextContent("学年");
    expect(headers[4]).toHaveTextContent("音読み");
    expect(headers[5]).toHaveTextContent("意味");
  });

  test("renders filled row with feedback", () => {
    const guesses: GuessFeedback[] = [
      {
        guess: "山",
        radical: "correct",
        strokeCount: "close",
        grade: "wrong",
        onYomi: "correct",
        category: "close",
      },
    ];

    render(<GameBoard guesses={guesses} maxGuesses={6} />);

    // The guessed kanji should appear in the grid
    expect(screen.getByText("山")).toBeInTheDocument();
  });

  test("renders multiple filled rows", () => {
    const guesses: GuessFeedback[] = [
      {
        guess: "山",
        radical: "correct",
        strokeCount: "correct",
        grade: "correct",
        onYomi: "correct",
        category: "correct",
      },
      {
        guess: "川",
        radical: "wrong",
        strokeCount: "close",
        grade: "close",
        onYomi: "wrong",
        category: "wrong",
      },
    ];

    render(<GameBoard guesses={guesses} maxGuesses={6} />);

    expect(screen.getByText("山")).toBeInTheDocument();
    expect(screen.getByText("川")).toBeInTheDocument();
  });
});
