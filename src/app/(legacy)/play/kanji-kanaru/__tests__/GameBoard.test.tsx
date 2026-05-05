import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import GameBoard from "@/play/games/kanji-kanaru/_components/GameBoard";
import type { GuessFeedback } from "@/play/games/kanji-kanaru/_lib/types";

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
    // 7 columns: empty + 部首 + 画数 + 学年 + 音読み + 意味 + 訓読み
    expect(headers).toHaveLength(7);
    expect(headers[1]).toHaveTextContent("\u90E8\u9996");
    expect(headers[2]).toHaveTextContent("\u753B\u6570");
    expect(headers[3]).toHaveTextContent("\u5B66\u5E74");
    expect(headers[4]).toHaveTextContent("\u97F3\u8AAD\u307F");
    expect(headers[5]).toHaveTextContent("\u610F\u5473");
    expect(headers[6]).toHaveTextContent("\u8A13\u8AAD\u307F");
  });

  test("renders filled row with feedback", () => {
    const guesses: GuessFeedback[] = [
      {
        guess: "\u5C71",
        radical: "correct",
        strokeCount: "close",
        grade: "wrong",
        gradeDirection: "up",
        onYomi: "correct",
        category: "close",
        kunYomiCount: "correct",
      },
    ];

    render(<GameBoard guesses={guesses} maxGuesses={6} />);

    // The guessed kanji should appear in the grid
    expect(screen.getByText("\u5C71")).toBeInTheDocument();
  });

  test("renders multiple filled rows", () => {
    const guesses: GuessFeedback[] = [
      {
        guess: "\u5C71",
        radical: "correct",
        strokeCount: "correct",
        grade: "correct",
        gradeDirection: "equal",
        onYomi: "correct",
        category: "correct",
        kunYomiCount: "correct",
      },
      {
        guess: "\u5DDD",
        radical: "wrong",
        strokeCount: "close",
        grade: "close",
        gradeDirection: "down",
        onYomi: "wrong",
        category: "wrong",
        kunYomiCount: "wrong",
      },
    ];

    render(<GameBoard guesses={guesses} maxGuesses={6} />);

    expect(screen.getByText("\u5C71")).toBeInTheDocument();
    expect(screen.getByText("\u5DDD")).toBeInTheDocument();
  });
});
