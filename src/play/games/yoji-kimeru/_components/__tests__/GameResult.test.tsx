import { describe, test, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import GameResult from "@/play/games/yoji-kimeru/_components/GameResult";
import type {
  YojiEntry,
  YojiGameState,
  YojiGameStats,
} from "@/play/games/yoji-kimeru/_lib/types";

vi.mock("@/lib/reveal", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/reveal")>()),
  revealControl: vi.fn(),
}));

const answer: YojiEntry = {
  yoji: "一石二鳥",
  reading: "いっせきにちょう",
  meaning: "一つの行為で二つの利益を得ること",
  difficulty: 1,
  category: "change",
  origin: "中国",
  structure: "組合せ",
  sourceUrl: "",
};

const stats: YojiGameStats = {
  gamesPlayed: 5,
  gamesWon: 4,
  currentStreak: 2,
  maxStreak: 3,
  guessDistribution: [0, 1, 3, 0, 0, 0],
  lastPlayedDate: "2026-09-27",
};

function state(status: "won" | "lost", count: number): YojiGameState {
  return {
    puzzleDate: "2026-09-27",
    puzzleNumber: 42,
    targetYoji: answer,
    status,
    guesses: Array.from({ length: count }, (_, i) => ({
      guess: i === count - 1 && status === "won" ? "一石二鳥" : `花鳥風${i}`,
      charFeedbacks:
        i === count - 1 && status === "won"
          ? ["correct", "correct", "correct", "correct"]
          : ["absent", "absent", "present", "correct"],
    })),
  };
}

function renderResult(status: "won" | "lost", count: number, appear = false) {
  return render(
    <GameResult
      gameState={state(status, count)}
      answer={answer}
      difficulty="intermediate"
      stats={stats}
      crossCategoryItems={[]}
      appear={appear}
    />,
  );
}

beforeAll(() => {
  // jsdom は字の幅を測れない。量の帯の組みを決める測りに、幅0の矩形を返す。
  Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GameResult", () => {
  test("names the result box with the answer and says how it went", () => {
    renderResult("won", 3);
    const box = screen.getByRole("region", { name: "一石二鳥" });
    expect(within(box).getByText("3回目で正解")).toBeInTheDocument();
    expect(within(box).getByText("いっせきにちょう")).toBeInTheDocument();
    expect(
      within(box).getByText("一つの行為で二つの利益を得ること"),
    ).toBeInTheDocument();
  });

  test("says that the answer was not found when the game is lost", () => {
    renderResult("lost", 6);
    expect(
      screen.getByText("6回のうちに当てられませんでした"),
    ).toBeInTheDocument();
  });

  test("puts the updated record in the result box", () => {
    renderResult("won", 3);
    const table = screen.getByRole("table", { name: "中級のこれまでの成績" });
    const rows = within(table)
      .getAllByRole("row")
      .map((row) => row.textContent);
    expect(rows).toEqual([
      "遊んだ回数5回",
      "正解した割合80%",
      "続けて正解した日数2日",
      "いちばん長く続けて正解した日数3日",
    ]);
  });

  test("heads the record and the distribution with h2 subheadings", () => {
    renderResult("won", 3);
    const box = screen.getByRole("region", { name: "一石二鳥" });
    for (const name of ["中級のこれまでの成績", "何回目で正解したか（日数）"]) {
      expect(
        within(box).getByRole("heading", { level: 2, name }),
      ).toBeInTheDocument();
    }
  });

  test("lines up the distribution with 今回 on this game's row", () => {
    renderResult("won", 3);
    const list = screen.getByRole("list", {
      name: "何回目で正解したか（日数）",
    });
    const items = within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(items).toEqual([
      "1回目0",
      "2回目1",
      "3回目3今回",
      "4回目0",
      "5回目0",
      "6回目0",
    ]);
  });

  test("puts no 今回 in the distribution when the answer was not found", () => {
    renderResult("lost", 6);
    expect(screen.queryByText("今回")).toBeNull();
  });

  test("puts the result's share right below the box", () => {
    renderResult("won", 3);
    const share = screen.getByRole("region", { name: "この結果を共有" });
    expect(within(share).getAllByRole("button").length).toBeGreaterThan(0);
  });

  test("moves the focus to the box only when it appears for the last guess", async () => {
    const { revealControl } = await import("@/lib/reveal");
    const { unmount } = renderResult("won", 3, false);
    expect(document.activeElement).toBe(document.body);
    expect(revealControl).not.toHaveBeenCalled();
    unmount();

    renderResult("won", 3, true);
    expect(document.activeElement).toBe(
      screen.getByRole("region", { name: "一石二鳥" }),
    );
    expect(revealControl).toHaveBeenCalledTimes(1);
  });
});
