import { expect, test, describe } from "vitest";
import { render, screen, within } from "@testing-library/react";
import GameBoard from "@/play/games/kanji-kanaru/_components/GameBoard";
import type { GuessFeedback } from "@/play/games/kanji-kanaru/_lib/types";

const GUESS: GuessFeedback = {
  guess: "山",
  radical: "correct",
  strokeCount: "close",
  grade: "wrong",
  gradeDirection: "up",
  onYomi: "correct",
  category: "close",
  kunYomiCount: "correct",
};

describe("GameBoard", () => {
  test("shows only the used rows and the next row while playing", () => {
    render(<GameBoard guesses={[GUESS]} showNextRow />);
    // 見出しの行・使った1行・次の1行
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  test("shows no empty row after the game ends", () => {
    render(<GameBoard guesses={[GUESS]} showNextRow={false} />);
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  test("column headers are two characters or fewer and read as the full names", () => {
    render(<GameBoard guesses={[]} showNextRow />);
    const headers = screen.getAllByRole("columnheader").slice(1);
    expect(headers.map((h) => h.textContent)).toEqual([
      "部首",
      "画数",
      "学年",
      "音",
      "意味",
      "訓",
    ]);
    for (const header of headers) {
      expect([...(header.textContent ?? "")].length).toBeLessThanOrEqual(2);
    }
    expect(
      screen.getByRole("columnheader", { name: "音読み" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "訓読み" }),
    ).toBeInTheDocument();
  });

  test("tells the next row is loading", () => {
    render(
      <GameBoard
        guesses={[]}
        showNextRow
        pendingText="読み込んでいます"
        pendingTextId="loading"
      />,
    );
    expect(screen.getByText("読み込んでいます")).toHaveAttribute(
      "id",
      "loading",
    );
  });

  test("the row answered by a guess carries the appearing motion; restored rows do not", () => {
    render(<GameBoard guesses={[GUESS, GUESS]} showNextRow appearingRow={1} />);
    const rows = screen.getAllByRole("row");
    expect(rows[1].className).not.toMatch(/appears/);
    expect(rows[2].className).toMatch(/appears/);
    expect(within(rows[2]).getByText("山")).toBeInTheDocument();
  });
});
