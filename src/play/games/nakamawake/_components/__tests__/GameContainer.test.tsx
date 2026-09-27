import { describe, test, expect, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import GameContainer from "../GameContainer";
import type { NakamawakePuzzle } from "@/play/games/nakamawake/_lib/types";
import { revealControl } from "@/play/games/shared/_lib/revealControl";
import { canSetInZenAntique } from "@/lib/zen-antique-charset";

vi.mock("@/play/games/shared/_lib/revealControl", () => ({
  revealControl: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({
  trackContentEnd: vi.fn(),
  trackShare: vi.fn(),
}));

const puzzle: NakamawakePuzzle = {
  groups: [
    {
      name: "果物",
      words: ["りんご", "みかん", "ぶどう", "もも"],
      difficulty: 1,
    },
    { name: "動物", words: ["いぬ", "ねこ", "うさぎ", "くま"], difficulty: 2 },
    { name: "色", words: ["あか", "あお", "きいろ", "みどり"], difficulty: 3 },
    { name: "季節", words: ["はる", "なつ", "あき", "ふゆ"], difficulty: 4 },
  ],
};

const TODAY = "2026-09-27";

function renderGame() {
  return render(
    <GameContainer
      puzzle={puzzle}
      puzzleNumber={226}
      todayStr={TODAY}
      dateDisplayString="2026年9月27日"
      crossCategoryItems={[]}
    />,
  );
}

function choose(words: string[]) {
  const grid = screen.getByRole("group", { name: "言葉の格子" });
  for (const word of words) {
    fireEvent.click(within(grid).getByRole("button", { name: word }));
  }
}

function check() {
  fireEvent.click(screen.getByRole("button", { name: "チェック" }));
}

// jsdom は字を組まないので、Range の矩形を持たない（量の帯が字の幅を測る）。
beforeAll(() => {
  Range.prototype.getBoundingClientRect = function (this: Range) {
    const width = (this.startContainer.textContent ?? "").length * 10;
    return { width } as DOMRect;
  };
});

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(revealControl).mockClear();
});

describe("遊んでいるあいだ", () => {
  test("残りのミスの数を字で言い、問題の日付と番号を補助情報で言う", () => {
    renderGame();
    expect(screen.getByRole("status")).toHaveTextContent(
      "あと4回間違えると終わり",
    );
    expect(screen.getByText("2026年9月27日の問題 #226")).toBeInTheDocument();
  });

  test("くわしい遊び方を閉じたアコーディオンで持つ", () => {
    renderGame();
    const details = screen.getByText("くわしい遊び方").closest("details");
    expect(details).not.toHaveAttribute("open");
  });

  test("4つ目の語を選ぶと、チェックのボタンと選んだ語を画面に入れる", () => {
    renderGame();
    choose(["りんご", "みかん", "ぶどう"]);
    expect(revealControl).not.toHaveBeenCalled();
    choose(["もも"]);
    const checkButton = screen.getByRole("button", { name: "チェック" });
    expect(revealControl).toHaveBeenCalledTimes(1);
    const [control, context] = vi.mocked(revealControl).mock.calls[0];
    expect(control).toBe(checkButton);
    expect(context).toHaveAttribute("aria-pressed", "true");
  });

  test("当てた組を、難易度の字と一緒に盤の上に出す", () => {
    renderGame();
    choose(["りんご", "みかん", "ぶどう", "もも"]);
    check();
    const solved = screen.getByRole("list", { name: "当てた組" });
    expect(solved).toHaveTextContent("果物");
    expect(solved).toHaveTextContent("難易度1");
    expect(solved).toHaveTextContent("りんご、みかん、ぶどう、もも");
    expect(screen.getByRole("status")).toHaveTextContent("正解です");
  });

  test("間違えると残りの数が減り、3つが同じ組ならそう知らせる", () => {
    renderGame();
    choose(["りんご", "みかん", "ぶどう", "いぬ"]);
    check();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("あと3回間違えると終わり");
    expect(status).toHaveTextContent("おしい。4つのうち3つは同じ組です");
  });

  test("チェックのあと、残りのミスの字と語の格子の最初の行を画面に入れる", () => {
    renderGame();
    choose(["りんご", "いぬ", "あか", "はる"]);
    vi.mocked(revealControl).mockClear();
    check();
    const [control, context] = vi.mocked(revealControl).mock.calls[0];
    expect(control).toBe(screen.getByRole("status"));
    const grid = screen.getByRole("group", { name: "言葉の格子" });
    expect(context).toBe(within(grid).getAllByRole("button")[0]);
  });
});

describe("解き終えたとき", () => {
  function winWithOneMistake() {
    renderGame();
    choose(["りんご", "いぬ", "あか", "はる"]);
    check();
    for (const group of puzzle.groups) {
      choose(group.words);
      check();
    }
  }

  test("語の格子と操作の所に結果のボックスが来て、フォーカスがボックスへ移る", () => {
    winWithOneMistake();
    expect(screen.queryByRole("group", { name: "言葉の格子" })).toBeNull();
    expect(screen.queryByRole("button", { name: "チェック" })).toBeNull();
    const result = screen.getByRole("region", { name: "4組すべて正解" });
    expect(result).toHaveTextContent("ナカマワケ #226 の結果");
    expect(result).toHaveTextContent("ミス1回");
    expect(result).toHaveFocus();
  });

  test("成績の分布をミスの数ごとに並べ、今回の行に「今回」を置く", () => {
    winWithOneMistake();
    const distribution = screen.getByRole("list", {
      name: "ミスの数ごとの回数",
    });
    const rows = within(distribution).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      "0ミス0",
      "1ミス1今回",
      "2ミス0",
      "3ミス0",
      "4ミス0",
    ]);
  });

  test("負けた回は当てられなかった組を難易度と一緒に見せ、4ミスの行が今回になる", () => {
    renderGame();
    choose(["りんご", "みかん", "ぶどう", "もも"]);
    check();
    for (let i = 0; i < 4; i++) {
      choose(["いぬ", "あか", "はる", i % 2 === 0 ? "ねこ" : "あお"]);
      check();
    }
    const result = screen.getByRole("region", { name: "4回間違えて終了" });
    const missed = within(result).getByRole("region", {
      name: "当てられなかった組",
    });
    expect(missed).toHaveTextContent("動物難易度2");
    expect(missed).not.toHaveTextContent("果物");
    const distribution = screen.getByRole("list", {
      name: "ミスの数ごとの回数",
    });
    expect(within(distribution).getAllByRole("listitem")[4]).toHaveTextContent(
      "4ミス1今回",
    );
  });

  test("開き直したときは、保存した回の結果を登場の動き無しで出す", () => {
    window.localStorage.setItem(
      "nakamawake-history",
      JSON.stringify({
        [TODAY]: {
          solvedGroups: [1, 2, 3, 4],
          mistakes: 0,
          status: "won",
          guessHistory: puzzle.groups.map((g) => ({
            words: g.words,
            correct: true,
          })),
        },
      }),
    );
    renderGame();
    const result = screen.getByRole("region", { name: "4組すべて正解" });
    expect(result.className).not.toMatch(/appears/);
    expect(result).not.toHaveFocus();
    expect(screen.getByRole("list", { name: "当てた組" })).toHaveTextContent(
      "難易度4",
    );
  });
});

test("見出しの書体で組む決まった字が、どれも Zen Antique にある", () => {
  for (const text of [
    "4組すべて正解",
    "4回間違えて終了",
    "当てられなかった組",
    "これまでの成績",
    "ミスの数ごとの回数",
    "この結果を共有",
    "ミス0回",
  ]) {
    expect(canSetInZenAntique(text), text).toBe(true);
  }
});
