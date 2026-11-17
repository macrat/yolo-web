import { describe, test, expect, beforeAll } from "vitest";
import { render, screen, within } from "@testing-library/react";
import GameResult from "@/play/games/kanji-kanaru/_components/GameResult";
import type {
  GameState,
  GameStats,
  GuessFeedback,
} from "@/play/games/kanji-kanaru/_lib/types";

const MISS: GuessFeedback = {
  guess: "川",
  radical: "wrong",
  strokeCount: "close",
  grade: "correct",
  gradeDirection: "equal",
  onYomi: "wrong",
  category: "close",
  kunYomiCount: "wrong",
};
const HIT: GuessFeedback = {
  guess: "山",
  radical: "correct",
  strokeCount: "correct",
  grade: "correct",
  gradeDirection: "equal",
  onYomi: "correct",
  category: "correct",
  kunYomiCount: "correct",
};

function state(status: "won" | "lost", guesses: GuessFeedback[]): GameState {
  return {
    puzzleDate: "2026-09-27",
    puzzleNumber: 226,
    targetKanji: {
      character: "山",
      radical: "山",
      radicalGroup: 46,
      strokeCount: 3,
      grade: 1,
      onYomi: ["サン", "セン"],
      kunYomi: ["やま"],
      meanings: ["mountain"],
      examples: ["山脈", "登山"],
    },
    guesses,
    status,
  };
}

// 量の帯の組みは字の幅を Range で測る。jsdom は測れないので、幅0を返す。
beforeAll(() => {
  Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
});

const STATS: GameStats = {
  gamesPlayed: 8,
  gamesWon: 7,
  currentStreak: 3,
  maxStreak: 4,
  guessDistribution: [0, 1, 3, 2, 1, 0],
  lastPlayedDate: "2026-09-27",
};

function renderResult(s: GameState, stats = STATS) {
  return render(
    <GameResult
      gameState={s}
      difficulty="intermediate"
      stats={stats}
      appear={false}
      crossCategoryItems={[]}
    />,
  );
}

describe("GameResult", () => {
  test("the result box holds the answer, how many guesses it took, and the records", () => {
    renderResult(state("won", [MISS, MISS, HIT]));
    const box = screen.getByRole("region", { name: "今日の中級の答え" });
    expect(within(box).getByText("山")).toBeInTheDocument();
    expect(within(box).getByText("3回目で当てました。")).toBeInTheDocument();
    expect(
      within(box).getByRole("rowheader", { name: "音読み" }),
    ).toBeVisible();
    expect(within(box).getByText("88%")).toBeInTheDocument();
    expect(
      within(box).getByRole("heading", { name: "中級のこれまでの成績" }),
    ).toBeInTheDocument();
  });

  test("the reading table and the records table share one group so their row headers line up", () => {
    renderResult(state("won", [MISS, MISS, HIT]));
    const readings = screen.getByRole("table", { name: "「山」の読みと意味" });
    const records = screen.getByRole("table", { name: "中級のこれまでの成績" });
    const group = readings.closest("[data-table-group]");
    expect(group).not.toBeNull();
    expect(records.closest("[data-table-group]")).toBe(group);
  });

  test("the distribution marks this time's row with 今回 in words", () => {
    renderResult(state("won", [MISS, MISS, HIT]));
    const list = screen.getByRole("list", {
      name: "何回目で当てたか（当てた日の数）",
    });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(6);
    expect(items[2]).toHaveTextContent("3回目3今回");
    expect(
      items.filter((item) => item.textContent?.includes("今回")),
    ).toHaveLength(1);
  });

  test("a lost game has no 今回 row", () => {
    renderResult(state("lost", [MISS, MISS, MISS, MISS, MISS, MISS]), {
      ...STATS,
      gamesWon: 6,
      currentStreak: 0,
    });
    expect(
      screen.getByText("6回のうちに当てられませんでした。"),
    ).toBeInTheDocument();
    expect(screen.queryByText("今回")).not.toBeInTheDocument();
  });

  test("sharing sits right below the result box under its own heading", () => {
    renderResult(state("won", [HIT]));
    const share = screen.getByRole("region", { name: "この結果を共有" });
    const box = screen.getByRole("region", { name: "今日の中級の答え" });
    expect(box.nextElementSibling).toBe(share);
  });
});
