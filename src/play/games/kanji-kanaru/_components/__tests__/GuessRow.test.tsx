import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GuessRow from "@/play/games/kanji-kanaru/_components/GuessRow";
import type { GuessFeedback } from "@/play/games/kanji-kanaru/_lib/types";

/** Helper to build a GuessFeedback with sensible defaults. */
function makeFeedback(overrides: Partial<GuessFeedback> = {}): GuessFeedback {
  return {
    guess: "水",
    radical: "wrong",
    strokeCount: "close",
    grade: "close",
    gradeDirection: "equal",
    onYomi: "wrong",
    category: "wrong",
    kunYomiCount: "wrong",
    ...overrides,
  };
}

describe("GuessRow accessibility", () => {
  test("guessed kanji cell exposes the actual kanji in its accessible name", () => {
    render(<GuessRow feedback={makeFeedback({ guess: "水" })} />);

    // Accessible name must contain the real kanji, not a generic fixed label.
    const cell = screen.getByRole("cell", { name: /推測した漢字 水/ });
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent("水");
  });

  test("grade cell accessible name states direction in words when target grade is higher (up)", () => {
    render(
      <GuessRow
        feedback={makeFeedback({ grade: "close", gradeDirection: "up" })}
      />,
    );

    const cell = screen.getByRole("cell", {
      name: /学年: 近い（対象はより上の学年）/,
    });
    expect(cell).toBeInTheDocument();
    // Visual arrow is preserved.
    expect(cell).toHaveTextContent("近い↑");
  });

  test("grade cell accessible name states direction in words when target grade is lower (down)", () => {
    render(
      <GuessRow
        feedback={makeFeedback({ grade: "close", gradeDirection: "down" })}
      />,
    );

    const cell = screen.getByRole("cell", {
      name: /学年: 近い（対象はより下の学年）/,
    });
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent("近い↓");
  });

  test("grade cell accessible name has no direction words when grades match (equal)", () => {
    render(
      <GuessRow
        feedback={makeFeedback({ grade: "correct", gradeDirection: "equal" })}
      />,
    );

    const cell = screen.getByRole("cell", { name: "学年: 一致" });
    expect(cell).toBeInTheDocument();
    // No arrow and no direction words appended.
    expect(cell).toHaveTextContent("一致");
    expect(cell.getAttribute("aria-label")).toBe("学年: 一致");
    expect(cell.getAttribute("aria-label")).not.toMatch(/対象/);
  });
});
