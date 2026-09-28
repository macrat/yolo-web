import { describe, test, expect, beforeEach } from "vitest";
import {
  releaseSavedLayout,
  reserveSavedLayout,
  resultAreaNames,
  saveResultHeight,
  savedLayoutScript,
  type SavedLayoutOptions,
} from "../savedLayout";

const STYLE_ID = "game-saved-layout";
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

/** 四字キメルの形: 盤の行と、推測の回数ごとのヒントの行の数。 */
const YOJI: SavedLayoutOptions = {
  styleId: STYLE_ID,
  difficultyKey: "game-difficulty",
  historyKeyPrefix: "game-history-",
  maxGuesses: 6,
  boardRowsProperty: "--board-rows",
  byGuessCount: [{ property: "--hint-lines", values: [2, 2, 2, 3, 4, 4, 4] }],
};

/** 漢字カナールの形: 盤の行と、解き終えた回の結果の区画。 */
const KANJI: SavedLayoutOptions = {
  styleId: STYLE_ID,
  difficultyKey: "game-difficulty",
  historyKeyPrefix: "game-history-",
  maxGuesses: 6,
  boardRowsProperty: "--board-rows",
  resultArea: resultAreaNames("game"),
};

/** ナカマワケの形: 難易度も推測の行も無く、解き終えた回の結果の区画だけ。 */
const NAKAMA: SavedLayoutOptions = {
  styleId: STYLE_ID,
  historyKeyPrefix: "game-history",
  resultArea: resultAreaNames("game"),
};

function saveTodayWithoutDifficulty(status: string) {
  localStorage.setItem(
    "game-history",
    JSON.stringify({ [today]: { solvedGroups: [2], mistakes: 4, status } }),
  );
}

function saveToday(difficulty: string, count: number, status: string) {
  localStorage.setItem(
    `game-history-${difficulty}`,
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

function reserve(options: SavedLayoutOptions) {
  releaseSavedLayout(STYLE_ID);
  reserveSavedLayout(options);
  return document.getElementById(STYLE_ID)?.textContent ?? null;
}

beforeEach(() => {
  localStorage.clear();
  releaseSavedLayout(STYLE_ID);
});

describe("reserveSavedLayout", () => {
  test("writes nothing for a first visitor", () => {
    expect(reserve(YOJI)).toBeNull();
    expect(reserve(KANJI)).toBeNull();
  });

  test("keeps the saved rows, the next row, and the values by guess count of a game in progress", () => {
    saveToday("intermediate", 3, "playing");
    expect(reserve(YOJI)).toBe(":root{--board-rows:4;--hint-lines:3}");
    expect(reserve(KANJI)).toBe(":root{--board-rows:4}");
  });

  test("keeps only the used rows of a finished game, with the values for a finished game", () => {
    saveToday("intermediate", 4, "won");
    expect(reserve(YOJI)).toBe(":root{--board-rows:4;--hint-lines:4}");
    expect(reserve(KANJI)).toBe(
      ":root{--board-rows:4;--game-input-visibility:hidden}",
    );
  });

  test("keeps the result area measured on the same day, difficulty and screen", () => {
    saveToday("intermediate", 2, "won");
    saveResultHeight("game-result-height", today, "intermediate", 1233.4);
    expect(reserve(KANJI)).toBe(
      ":root{--board-rows:2;--game-input-visibility:hidden;--game-result-height:1234px}",
    );
  });

  test("does not use a result height measured on another screen, day or difficulty", () => {
    saveToday("intermediate", 6, "lost");
    const measured = { date: today, difficulty: "intermediate" };
    for (const other of [
      { viewportWidth: 1 },
      { fontSize: "32px" },
      { date: "2000-01-01" },
      { difficulty: "advanced" },
    ]) {
      localStorage.setItem(
        "game-result-height",
        JSON.stringify({
          ...measured,
          viewportWidth: window.innerWidth,
          fontSize: getComputedStyle(document.documentElement).fontSize,
          height: 900,
          ...other,
        }),
      );
      expect(reserve(KANJI)).toBe(
        ":root{--board-rows:6;--game-input-visibility:hidden}",
      );
    }
  });

  test("names the result area values after the game", () => {
    expect(resultAreaNames("nakamawake")).toEqual({
      heightProperty: "--nakamawake-result-height",
      inputVisibilityProperty: "--nakamawake-input-visibility",
      storageKey: "nakamawake-result-height",
    });
  });

  test("reads the game of the saved difficulty", () => {
    localStorage.setItem("game-difficulty", "advanced");
    saveToday("intermediate", 3, "playing");
    expect(reserve(YOJI)).toBeNull();
    saveToday("advanced", 1, "playing");
    expect(reserve(YOJI)).toBe(":root{--board-rows:2;--hint-lines:2}");
  });

  test("a short 'lost' record from an old version counts as a game in progress", () => {
    saveToday("intermediate", 2, "lost");
    expect(reserve(KANJI)).toBe(":root{--board-rows:3}");
  });

  test("a game without difficulty or guess rows reserves only the result area of a finished game", () => {
    expect(reserve(NAKAMA)).toBeNull();
    saveTodayWithoutDifficulty("playing");
    expect(reserve(NAKAMA)).toBeNull();
    saveTodayWithoutDifficulty("lost");
    expect(reserve(NAKAMA)).toBe(":root{--game-input-visibility:hidden}");
    saveResultHeight("game-result-height", today, "", 980.2);
    expect(reserve(NAKAMA)).toBe(
      ":root{--game-input-visibility:hidden;--game-result-height:981px}",
    );
    saveResultHeight("game-result-height", today, "intermediate", 980.2);
    expect(reserve(NAKAMA)).toBe(":root{--game-input-visibility:hidden}");
  });

  test("a game with its own finished status reserves the result area only for that status", () => {
    const IRODORI: SavedLayoutOptions = {
      ...NAKAMA,
      finishedStatuses: ["completed"],
    };
    saveTodayWithoutDifficulty("playing");
    expect(reserve(IRODORI)).toBeNull();
    saveTodayWithoutDifficulty("won");
    expect(reserve(IRODORI)).toBeNull();
    saveTodayWithoutDifficulty("completed");
    saveResultHeight("game-result-height", today, "", 1320);
    expect(reserve(IRODORI)).toBe(
      ":root{--game-input-visibility:hidden;--game-result-height:1320px}",
    );
  });

  test("writes a value for each item of a list in the record", () => {
    const options: SavedLayoutOptions = {
      ...NAKAMA,
      byRecordItem: [
        { field: "solvedGroups", propertyPrefix: "--group-", value: "block" },
        { field: "solvedGroups", propertyPrefix: "--word-", value: "none" },
        { field: "missing", propertyPrefix: "--missing-", value: "none" },
      ],
    };
    saveTodayWithoutDifficulty("playing");
    expect(reserve(options)).toBe(":root{--group-2:block;--word-2:none}");
  });

  test("writes a value by the number of items of a list in the record", () => {
    const options: SavedLayoutOptions = {
      ...NAKAMA,
      byRecordLength: [
        { field: "solvedGroups", property: "--list", values: ["none", "flex"] },
      ],
    };
    saveTodayWithoutDifficulty("playing");
    expect(reserve(options)).toBe(":root{--list:flex}");
    localStorage.setItem(
      "game-history",
      JSON.stringify({
        [today]: { solvedGroups: [], mistakes: 1, status: "playing" },
      }),
    );
    expect(reserve(options)).toBe(":root{--list:none}");
  });

  test("the script runs the same function on its own, without outer names", () => {
    saveToday("intermediate", 3, "playing");
    new Function(savedLayoutScript(YOJI))();
    expect(document.getElementById(STYLE_ID)?.textContent).toBe(
      ":root{--board-rows:4;--hint-lines:3}",
    );
  });

  test("writes a remembered height measured on the same day, difficulty and screen, playing or finished", () => {
    const options: SavedLayoutOptions = {
      styleId: STYLE_ID,
      difficultyKey: "game-difficulty",
      historyKeyPrefix: "game-history-",
      maxGuesses: 6,
      boardRowsProperty: "--board-rows",
      rememberedHeights: [
        { property: "--hint-height", storageKey: "game-hint-height" },
      ],
    };
    saveToday("intermediate", 3, "playing");
    saveResultHeight("game-hint-height", today, "intermediate", 99.2);
    expect(reserve(options)).toBe(":root{--board-rows:4;--hint-height:100px}");
    saveResultHeight("game-hint-height", "2000-01-01", "intermediate", 99);
    expect(reserve(options)).toBe(":root{--board-rows:4}");
  });

  test("uses the finished values by guess count for a finished game", () => {
    const options: SavedLayoutOptions = {
      ...YOJI,
      byGuessCount: [
        {
          property: "--hint-lines",
          values: [2, 2, 2, 3, 4, 4, 4],
          finishedValues: [1, 1, 1, 2, 3, 4, 4],
        },
      ],
    };
    saveToday("intermediate", 3, "won");
    expect(reserve(options)).toBe(":root{--board-rows:3;--hint-lines:2}");
  });

  test("the script cannot close its <script> element, whatever the strings hold", () => {
    const script = savedLayoutScript({
      ...YOJI,
      styleId: "</script><script>alert(1)</script>",
    });
    expect(script).not.toContain("<");
    saveToday("intermediate", 3, "playing");
    new Function(script)();
    expect(
      document.getElementById("</script><script>alert(1)</script>"),
    ).not.toBeNull();
  });
});
