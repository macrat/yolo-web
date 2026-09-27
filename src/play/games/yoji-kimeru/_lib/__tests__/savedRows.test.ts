import { describe, test, expect, beforeEach } from "vitest";
import {
  BOARD_ROWS_PROPERTY,
  HINT_LINES_PROPERTY,
  SAVED_ROWS_STYLE_ID,
  reserveSavedRows,
} from "../savedRows";

const HINT_LINES = [2, 2, 2, 3, 4, 4, 4];
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

function saveToday(difficulty: string, count: number, status: string) {
  localStorage.setItem(
    `yoji-kimeru-history-${difficulty}`,
    JSON.stringify({
      [today]: {
        guesses: [],
        feedbacks: Array.from({ length: count }, () => ({})),
        status,
        guessCount: count,
      },
    }),
  );
}

function reserve() {
  reserveSavedRows(
    SAVED_ROWS_STYLE_ID,
    BOARD_ROWS_PROPERTY,
    HINT_LINES_PROPERTY,
    "yoji-kimeru-difficulty",
    "yoji-kimeru-history-",
    HINT_LINES,
    6,
  );
  return document.getElementById(SAVED_ROWS_STYLE_ID)?.textContent ?? null;
}

beforeEach(() => {
  localStorage.clear();
  document.getElementById(SAVED_ROWS_STYLE_ID)?.remove();
});

describe("reserveSavedRows", () => {
  test("writes nothing for a first visitor", () => {
    expect(reserve()).toBeNull();
  });

  test("keeps the saved rows, the next row, and the hint lines of a game in progress", () => {
    saveToday("intermediate", 3, "playing");
    expect(reserve()).toBe(
      `:root{${BOARD_ROWS_PROPERTY}:4;${HINT_LINES_PROPERTY}:3}`,
    );
  });

  test("keeps only the used rows of a finished game", () => {
    saveToday("intermediate", 4, "won");
    expect(reserve()).toBe(
      `:root{${BOARD_ROWS_PROPERTY}:4;${HINT_LINES_PROPERTY}:4}`,
    );
  });

  test("reads the game of the saved difficulty", () => {
    localStorage.setItem("yoji-kimeru-difficulty", "advanced");
    saveToday("intermediate", 3, "playing");
    expect(reserve()).toBeNull();
    saveToday("advanced", 1, "playing");
    expect(reserve()).toBe(
      `:root{${BOARD_ROWS_PROPERTY}:2;${HINT_LINES_PROPERTY}:2}`,
    );
  });
});
