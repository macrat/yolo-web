import { expect, test, describe } from "vitest";
import { render, screen, within } from "@testing-library/react";
import GameBoard from "@/play/games/yoji-kimeru/_components/GameBoard";
import type { YojiGuessFeedback } from "@/play/games/yoji-kimeru/_lib/types";

const guesses: YojiGuessFeedback[] = [
  {
    guess: "花鳥風月",
    charFeedbacks: ["absent", "absent", "absent", "absent"],
  },
  {
    guess: "一石二鳥",
    charFeedbacks: ["correct", "present", "absent", "correct"],
  },
];

describe("GameBoard", () => {
  test("shows only the next row before the first guess", () => {
    render(
      <GameBoard
        guesses={[]}
        pendingGuess={null}
        showNextRow={true}
        addedRow={null}
      />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(1);
    expect(screen.getAllByRole("cell", { name: "空欄" })).toHaveLength(4);
  });

  test("shows the used rows and the next row while playing", () => {
    render(
      <GameBoard
        guesses={guesses}
        pendingGuess={null}
        showNextRow={true}
        addedRow={null}
      />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  test("shows only the used rows after the game ends", () => {
    render(
      <GameBoard
        guesses={guesses}
        pendingGuess={null}
        showNextRow={false}
        addedRow={null}
      />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.queryByRole("cell", { name: "空欄" })).toBeNull();
  });

  test("puts the legend's mark under each guessed character", () => {
    render(
      <GameBoard
        guesses={guesses}
        pendingGuess={null}
        showNextRow={false}
        addedRow={null}
      />,
    );
    const secondRow = screen.getAllByRole("row")[1];
    const cells = within(secondRow).getAllByRole("cell");
    expect(cells.map((cell) => cell.textContent)).toEqual([
      "一◯",
      "石△",
      "二×",
      "鳥◯",
    ]);
  });

  test("reads each cell with the character and the legend's words", () => {
    render(
      <GameBoard
        guesses={guesses}
        pendingGuess={null}
        showNextRow={false}
        addedRow={null}
      />,
    );
    expect(
      screen.getByRole("cell", { name: "一: 正しい位置" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "石: 別の位置" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "二: 含まれない" }),
    ).toBeInTheDocument();
  });

  test("gives the appearing motion only to the row the guess just added", () => {
    render(
      <GameBoard
        guesses={guesses}
        pendingGuess={null}
        showNextRow={true}
        addedRow={1}
      />,
    );
    const rows = screen.getAllByRole("row");
    expect(rows[0].className).not.toMatch(/rowAppears/);
    expect(rows[1].className).toMatch(/rowAppears/);
  });
  test("keeps the sent guess's row before its judgment returns", () => {
    render(
      <GameBoard
        guesses={guesses}
        pendingGuess="四面楚歌"
        showNextRow={true}
        addedRow={null}
      />,
    );
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4);
    expect(
      within(rows[2]).getByRole("cell", { name: "四: 答え合わせ中" }),
    ).toBeInTheDocument();
  });
});
