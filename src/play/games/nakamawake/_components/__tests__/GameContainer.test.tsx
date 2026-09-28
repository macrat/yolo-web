import { describe, test, expect, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import GameContainer from "../GameContainer";
import type { NakamawakePuzzle } from "@/play/games/nakamawake/_lib/types";
import { revealControl } from "@/lib/reveal";
import { trackContentEnd } from "@/lib/analytics";
import { canSetInZenAntique } from "@/lib/zen-antique-charset";

vi.mock("@/lib/reveal", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/reveal")>()),
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
      wordPhrases={{}}
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
  vi.mocked(trackContentEnd).mockClear();
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

  test("当てた組を難易度の字と一緒に語の格子の上に出し、その組の名前と難易度を知らせる", () => {
    renderGame();
    choose(["りんご", "みかん", "ぶどう", "もも"]);
    check();
    const solved = screen.getByRole("list", { name: "当てた組" });
    expect(solved).toHaveTextContent("果物");
    expect(solved).toHaveTextContent("難易度1");
    expect(solved).toHaveTextContent("りんご、みかん、ぶどう、もも");
    expect(screen.getByRole("status")).toHaveTextContent(
      "正解です。果物（難易度1）",
    );
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

  // キーボードで押したときと、Chromium でマウスで押したときは、押したチェックのボタンにフォーカスがある。
  test("チェックのボタンにフォーカスがあったときは、押したあと語の格子の最初の語へ移す", () => {
    renderGame();
    choose(["りんご", "いぬ", "あか", "はる"]);
    const checkButton = screen.getByRole("button", { name: "チェック" });
    checkButton.focus();
    fireEvent.click(checkButton);
    const grid = screen.getByRole("group", { name: "言葉の格子" });
    expect(within(grid).getAllByRole("button")[0]).toHaveFocus();
  });

  test("フォーカスを受け取った語が画面の上に出ていれば、その語まで送り戻す", () => {
    renderGame();
    choose(["りんご", "いぬ", "あか", "はる"]);
    const checkButton = screen.getByRole("button", { name: "チェック" });
    checkButton.focus();
    const scrollBy = vi.fn();
    window.scrollBy = scrollBy;
    const rect = vi
      .spyOn(HTMLButtonElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ top: -200, bottom: -120 } as DOMRect);
    fireEvent.click(checkButton);
    rect.mockRestore();
    expect(scrollBy).toHaveBeenCalledWith({ top: -216, behavior: "instant" });
  });

  test("文節を持つ語は、文節の切れ目で折れるようにする", () => {
    render(
      <GameContainer
        puzzle={puzzle}
        puzzleNumber={226}
        todayStr={TODAY}
        dateDisplayString="2026年9月27日"
        crossCategoryItems={[]}
        wordPhrases={{ うさぎ: ["うさ", "ぎ"] }}
      />,
    );
    expect(screen.getByRole("button", { name: "うさぎ" }).innerHTML).toContain(
      "うさ<wbr>ぎ",
    );
  });

  // Safari のマウスのように、押したボタンにフォーカスを移さないブラウザでは、フォーカスは元の所にある。
  test("チェックのボタンにフォーカスが無いまま押されたときは、フォーカスを動かさない", () => {
    renderGame();
    choose(["りんご", "いぬ", "あか", "はる"]);
    const before = document.activeElement;
    check();
    expect(document.activeElement).toBe(before);
  });
});

describe("途中まで遊んだ回を開き直したとき", () => {
  test("当てた組・残りの語・残りのミスの数を戻す", () => {
    window.localStorage.setItem(
      "nakamawake-history",
      JSON.stringify({
        [TODAY]: {
          solvedGroups: [2],
          mistakes: 2,
          status: "playing",
        },
      }),
    );
    renderGame();
    const solved = screen.getByRole("list", { name: "当てた組" });
    expect(within(solved).getAllByRole("listitem")).toHaveLength(1);
    expect(solved).toHaveTextContent("動物難易度2");
    const grid = screen.getByRole("group", { name: "言葉の格子" });
    const words = within(grid)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(words).toHaveLength(12);
    expect(words).not.toContain("いぬ");
    expect(words).toContain("りんご");
    expect(screen.getByRole("status")).toHaveTextContent(
      "あと2回間違えると終わり",
    );
    expect(trackContentEnd).not.toHaveBeenCalled();
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

  test("成績の名前は文節の切れ目で、組の語の並びは語の切れ目で折れるようにする", () => {
    winWithOneMistake();
    const table = screen.getByRole("table");
    const longest = within(table).getByRole("rowheader", {
      name: "いちばん長く続けて勝った日数",
    });
    expect(longest.innerHTML).toBe(
      "いちばん<wbr>長く<wbr>続けて<wbr>勝った<wbr>日数",
    );
    const solved = screen.getByRole("list", { name: "当てた組" });
    expect(solved.querySelector("li p:last-child")?.innerHTML).toBe(
      "りんご、<wbr>みかん、<wbr>ぶどう、<wbr>もも",
    );
  });

  test("開き直したときに取っておけるよう、盤と結果の区画の高さを日付と一緒に覚える", () => {
    winWithOneMistake();
    const saved = JSON.parse(
      window.localStorage.getItem("nakamawake-result-height") ?? "null",
    );
    expect(saved).toMatchObject({ date: TODAY, difficulty: "" });
    // 高さは画面の幅と字の大きさの組ごとに覚える。
    expect(
      Object.values(saved.heights).every((h) => typeof h === "number"),
    ).toBe(true);
    expect(Object.keys(saved.heights)).toHaveLength(1);
  });

  test("解き終えたことを1回だけ記録する", () => {
    winWithOneMistake();
    expect(trackContentEnd).toHaveBeenCalledTimes(1);
    expect(trackContentEnd).toHaveBeenCalledWith("nakamawake", "game", true);
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
    expect(result).toHaveTextContent("1組正解");
    expect(result).not.toHaveTextContent("ミス4回");
    expect(trackContentEnd).toHaveBeenCalledTimes(1);
    expect(trackContentEnd).toHaveBeenCalledWith("nakamawake", "game", false);
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
    expect(trackContentEnd).not.toHaveBeenCalled();
  });
});

describe("サーバーの HTML を水和で引き継ぐとき", () => {
  test("サーバーの HTML は初めの回で、水和のあとに端末の記録の回を当てる", () => {
    window.localStorage.setItem(
      "nakamawake-history",
      JSON.stringify({
        [TODAY]: { solvedGroups: [2], mistakes: 1, status: "playing" },
      }),
    );
    const ui = (
      <GameContainer
        puzzle={puzzle}
        puzzleNumber={226}
        todayStr={TODAY}
        dateDisplayString="2026年9月27日"
        crossCategoryItems={[]}
        wordPhrases={{}}
      />
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    expect(container.textContent).toContain("あと4回間違えると終わり");
    expect(container.querySelector("script")?.textContent).toContain(
      "nakamawake-saved-layout",
    );
    // 当てた組の場所と残る語の格子を、スクリプトの書く値で取っておけるよう、すべての組と語を見えないまま持つ。
    const reservedGroups = [...container.querySelectorAll("ul li")].filter(
      (li) => li.getAttribute("style")?.includes("--nakamawake-solved-group-"),
    );
    expect(reservedGroups).toHaveLength(4);
    expect(
      container
        .querySelector('button[aria-label="いぬ"]')
        ?.getAttribute("style"),
    ).toBe("display:var(--nakamawake-solved-word-2, flex)");
    document.body.append(container);
    render(ui, { container, hydrate: true });
    expect(screen.getByRole("list", { name: "当てた組" })).toHaveTextContent(
      "動物",
    );
    expect(screen.getAllByRole("status")[0]).toHaveTextContent(
      "あと3回間違えると終わり",
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
    "1組正解",
  ]) {
    expect(canSetInZenAntique(text), text).toBe(true);
  }
});
