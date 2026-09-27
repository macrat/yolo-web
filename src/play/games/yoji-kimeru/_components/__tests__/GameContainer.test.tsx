import { describe, test, expect, vi, beforeAll, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import GameContainer from "@/play/games/yoji-kimeru/_components/GameContainer";
import type { EvaluateResponse } from "@/play/games/yoji-kimeru/_lib/types";
import { trackContentEnd } from "@/lib/analytics";

vi.mock("@/play/games/shared/_lib/revealControl", () => ({
  revealControl: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackContentEnd: vi.fn(),
  trackShare: vi.fn(),
}));

const puzzle = {
  puzzleNumber: 42,
  reading: "いっせきにちょう",
  category: "change",
  origin: "中国",
  difficulty: 2,
};

const answer = {
  yoji: "一石二鳥",
  reading: "いっせきにちょう",
  meaning: "一つの行為で二つの利益を得ること",
  difficulty: 1,
  category: "change",
  origin: "中国",
  structure: "組合せ",
  sourceUrl: "",
};

function mockFetch(evaluate: (guess: string) => EvaluateResponse) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.startsWith("/api/yoji-kimeru/puzzle")) {
        return new Response(JSON.stringify(puzzle));
      }
      const { guess } = JSON.parse(String(init?.body)) as { guess: string };
      return new Response(JSON.stringify(evaluate(guess)));
    }),
  );
}

function boardRows(): HTMLElement[] {
  return within(
    screen.getByRole("table", { name: "推測した四字熟語" }),
  ).getAllByRole("row");
}

function guess(text: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "送信" }));
}

beforeAll(() => {
  // jsdom は字の幅を測れない。量の帯の組みを決める測りに、幅0の矩形を返す。
  Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
});

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe("GameContainer", () => {
  test("draws the first visitor's layout while the puzzle loads", () => {
    mockFetch(() => {
      throw new Error("not called");
    });
    render(<GameContainer crossCategoryItems={[]} />);

    expect(screen.getByRole("status", { name: "ヒント" })).toHaveTextContent(
      "読み込んでいます",
    );
    expect(boardRows()).toHaveLength(1);
    expect(
      screen.getByRole("textbox", { name: "中級の四字熟語を入力（あと6回）" }),
    ).toBeInTheDocument();
    expect(screen.getByText("くわしい遊び方")).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "難易度" }),
    ).toBeInTheDocument();
    expect(screen.getByText("今日の問題")).toBeInTheDocument();
  });

  test("adds a row and counts down the label after a guess", async () => {
    mockFetch((g) => ({
      feedback: {
        guess: g,
        charFeedbacks: ["absent", "correct", "absent", "present"],
      },
      isCorrect: false,
    }));
    render(<GameContainer crossCategoryItems={[]} />);
    await screen.findByText(/#42/);

    guess("花石風一");

    expect(
      await screen.findByRole("textbox", {
        name: "中級の四字熟語を入力（あと5回）",
      }),
    ).toBeInTheDocument();
    expect(boardRows()).toHaveLength(2);
    expect(screen.getByRole("cell", { name: "石: 正しい位置" })).toBeVisible();
  });

  test("takes the sent guess's row at once, before the judgment returns", async () => {
    let answerJudgment: (value: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.startsWith("/api/yoji-kimeru/puzzle")) {
          return new Response(JSON.stringify(puzzle));
        }
        return new Promise<Response>((resolve) => {
          answerJudgment = resolve;
        });
      }),
    );
    render(<GameContainer crossCategoryItems={[]} />);
    await screen.findByText(/#42/);

    guess("花石風一");

    expect(
      await screen.findByRole("cell", { name: "花: 答え合わせ中" }),
    ).toBeInTheDocument();
    expect(boardRows()).toHaveLength(2);
    answerJudgment(
      new Response(
        JSON.stringify({
          feedback: {
            guess: "花石風一",
            charFeedbacks: ["absent", "correct", "absent", "present"],
          },
          isCorrect: false,
        }),
      ),
    );
    expect(
      await screen.findByRole("cell", { name: "花: 含まれない" }),
    ).toBeInTheDocument();
    expect(boardRows()).toHaveLength(2);
  });

  test("puts the result box where the field was after the last guess", async () => {
    mockFetch((g) => ({
      feedback: {
        guess: g,
        charFeedbacks: ["correct", "correct", "correct", "correct"],
      },
      isCorrect: true,
      targetYoji: answer as EvaluateResponse["targetYoji"],
    }));
    render(<GameContainer crossCategoryItems={[]} />);
    await screen.findByText(/#42/);

    guess("一石二鳥");

    const box = await screen.findByRole("region", { name: "一石二鳥" });
    expect(box).toHaveTextContent("1回目で正解");
    expect(screen.queryByRole("textbox")).toBeNull();
    // 解き終えたあとは、使った行だけを見せる。
    expect(boardRows()).toHaveLength(1);
    await waitFor(() => expect(document.activeElement).toBe(box));
    expect(trackContentEnd).toHaveBeenCalledTimes(1);
    expect(trackContentEnd).toHaveBeenCalledWith("yoji-kimeru", "game", true);
  });

  test("restores a finished game without the appearing motion or focus", async () => {
    window.localStorage.setItem(
      "yoji-kimeru-history-intermediate",
      JSON.stringify({
        [new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
          new Date(),
        )]: {
          guesses: ["一石二鳥"],
          feedbacks: [
            {
              guess: "一石二鳥",
              charFeedbacks: ["correct", "correct", "correct", "correct"],
            },
          ],
          status: "won",
          guessCount: 1,
        },
      }),
    );
    mockFetch((g) => ({
      feedback: {
        guess: g,
        charFeedbacks: ["correct", "correct", "correct", "correct"],
      },
      isCorrect: true,
      targetYoji: answer as EvaluateResponse["targetYoji"],
    }));
    render(<GameContainer crossCategoryItems={[]} />);

    const box = await screen.findByRole("region", { name: "一石二鳥" });
    expect(box.className).not.toMatch(/appears/);
    expect(document.activeElement).not.toBe(box);
    // 解き終えた回を開き直しただけでは、遊び終えたことを送らない。
    expect(trackContentEnd).not.toHaveBeenCalled();
  });
});
