import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GuessRow from "@/play/games/kanji-kanaru/_components/GuessRow";
import type { GuessFeedback } from "@/play/games/kanji-kanaru/_lib/types";
import { FEEDBACK_MARKS } from "@/play/games/kanji-kanaru/_lib/marks";
import { gameBySlug } from "@/play/games/registry";

function makeFeedback(overrides: Partial<GuessFeedback> = {}): GuessFeedback {
  return {
    guess: "水",
    radical: "wrong",
    strokeCount: "close",
    grade: "close",
    gradeDirection: "equal",
    onYomi: "wrong",
    category: "correct",
    kunYomiCount: "wrong",
    ...overrides,
  };
}

describe("GuessRow", () => {
  test("the marks and their meanings are the same as the legend above the board", () => {
    const legend = gameBySlug.get("kanji-kanaru")!.legend!.entries;
    expect(
      Object.values(FEEDBACK_MARKS).map(({ mark, meaning }) => ({
        mark,
        meaning,
      })),
    ).toEqual(legend.map(({ mark, meaning }) => ({ mark, meaning })));
  });

  test("each square shows the legend mark and is read with the legend's meaning", () => {
    render(<GuessRow feedback={makeFeedback()} />);
    const radical = screen.getByRole("cell", { name: "部首: 不一致" });
    expect(radical).toHaveTextContent("×");
    expect(screen.getByRole("cell", { name: "画数: 近い" })).toHaveTextContent(
      "△",
    );
    expect(screen.getByRole("cell", { name: "意味: 一致" })).toHaveTextContent(
      "◯",
    );
    expect(screen.getByRole("cell", { name: "音読み: 不一致" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "訓読み: 不一致" })).toBeVisible();
  });

  test("the guessed kanji is in its square's name", () => {
    render(<GuessRow feedback={makeFeedback({ guess: "水" })} />);
    expect(
      screen.getByRole("cell", { name: "推測した漢字 水" }),
    ).toHaveTextContent("水");
  });

  test("the grade direction is an arrow on screen and words when read", () => {
    render(
      <GuessRow
        feedback={makeFeedback({ grade: "close", gradeDirection: "up" })}
      />,
    );
    expect(
      screen.getByRole("cell", { name: "学年: 近い（対象はより上の学年）" }),
    ).toHaveTextContent("△↑");
  });

  test("the grade direction for a lower target grade", () => {
    render(
      <GuessRow
        feedback={makeFeedback({ grade: "wrong", gradeDirection: "down" })}
      />,
    );
    expect(
      screen.getByRole("cell", { name: "学年: 不一致（対象はより下の学年）" }),
    ).toHaveTextContent("×↓");
  });

  test("no direction when the grades match", () => {
    render(
      <GuessRow
        feedback={makeFeedback({ grade: "correct", gradeDirection: "equal" })}
      />,
    );
    const cell = screen.getByRole("cell", { name: "学年: 一致" });
    expect(cell).toHaveTextContent(/^◯$/);
  });

  test("hits are set on the --paper-2 ground and misses on the --paper ground", () => {
    render(<GuessRow feedback={makeFeedback()} />);
    expect(screen.getByRole("cell", { name: "意味: 一致" }).className).toMatch(
      /hit/,
    );
    expect(screen.getByRole("cell", { name: "画数: 近い" }).className).toMatch(
      /hit/,
    );
    expect(
      screen.getByRole("cell", { name: "部首: 不一致" }).className,
    ).toMatch(/miss/);
  });
});
