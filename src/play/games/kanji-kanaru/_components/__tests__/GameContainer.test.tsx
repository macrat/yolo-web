import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GameContainer from "@/play/games/kanji-kanaru/_components/GameContainer";
import type { GuessFeedback } from "@/play/games/kanji-kanaru/_lib/types";

vi.mock("@/lib/reveal", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/reveal")>()),
  revealControl: vi.fn(),
}));

const { trackContentEnd } = vi.hoisted(() => ({ trackContentEnd: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackContentEnd }));

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

function mockApi(correct: boolean, evaluate?: () => Promise<Response>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.startsWith("/api/kanji-kanaru/hints")) {
        return Response.json({
          puzzleNumber: 226,
          hints: { strokeCount: 3, onYomiCount: 2, kunYomiCount: 1 },
        });
      }
      if (evaluate) return evaluate();
      const body = JSON.parse(String(init?.body));
      return Response.json({
        feedback: { ...MISS, guess: body.guess },
        isCorrect: correct,
        targetKanji: correct
          ? {
              character: "山",
              onYomi: ["サン"],
              kunYomi: ["やま"],
              meanings: ["mountain"],
              examples: ["山脈"],
            }
          : undefined,
      });
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  trackContentEnd.mockClear();
  // 量の帯の組みは字の幅を Range で測る。jsdom は測れないので、幅0を返す。
  Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GameContainer", () => {
  test("before loading, it lays out the same parts a first visitor sees, saying it is loading", () => {
    mockApi(false);
    render(<GameContainer crossCategoryItems={[]} />);
    expect(screen.getByText("読み込んでいます")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "中級の漢字を1字入力（あと6回）" }),
    ).toBeDisabled();
    expect(screen.getByText("くわしい遊び方")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "難易度" })).toBeVisible();
  });

  test("a guess that does not end the game keeps the field and counts down the label", async () => {
    mockApi(false);
    render(<GameContainer crossCategoryItems={[]} />);
    const input = await screen.findByRole("textbox", {
      name: "中級の漢字を1字入力（あと6回）",
    });
    await waitFor(() => expect(input).toBeEnabled());
    fireEvent.change(input, { target: { value: "川" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(
      await screen.findByRole("textbox", {
        name: "中級の漢字を1字入力（あと5回）",
      }),
    ).toHaveFocus();
    expect(screen.getByText("第226回・", { exact: false })).toBeVisible();
  });

  test("a sent guess takes its row and the remaining count at once, before the judgment returns", async () => {
    let respond: (response: Response) => void = () => {};
    mockApi(
      false,
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve;
        }),
    );
    render(<GameContainer crossCategoryItems={[]} />);
    const input = await screen.findByRole("textbox");
    await waitFor(() => expect(input).toBeEnabled());
    fireEvent.change(input, { target: { value: "川" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(
      await screen.findByRole("cell", { name: "部首: 判定しています" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "中級の漢字を1字入力（あと5回）" }),
    ).toBeInTheDocument();
    respond(Response.json({ feedback: MISS, isCorrect: false }));
    expect(
      await screen.findByRole("cell", { name: "部首: 不一致" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("cell", { name: "部首: 判定しています" }),
    ).not.toBeInTheDocument();
  });

  test("a character typed while the judgment is pending stays in the field when the judgment returns", async () => {
    let respond: (response: Response) => void = () => {};
    mockApi(
      false,
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve;
        }),
    );
    render(<GameContainer crossCategoryItems={[]} />);
    const input = await screen.findByRole("textbox");
    await waitFor(() => expect(input).toBeEnabled());
    fireEvent.change(input, { target: { value: "川" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    await screen.findByRole("cell", { name: "部首: 判定しています" });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "林" } });
    respond(Response.json({ feedback: MISS, isCorrect: false }));
    await screen.findByRole("cell", { name: "部首: 不一致" });
    expect(screen.getByRole("textbox")).toHaveValue("林");
  });

  test("a failed evaluation takes the waiting row away and leaves the character in the field", async () => {
    mockApi(false, () => Promise.resolve(new Response(null, { status: 500 })));
    render(<GameContainer crossCategoryItems={[]} />);
    const input = await screen.findByRole("textbox");
    await waitFor(() => expect(input).toBeEnabled());
    fireEvent.change(input, { target: { value: "川" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.queryByRole("cell", { name: "推測した漢字 川" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "中級の漢字を1字入力（あと6回）" }),
    ).toHaveValue("川");
  });

  test("the winning guess replaces the field with the result box and moves focus to it", async () => {
    mockApi(true);
    render(<GameContainer crossCategoryItems={[]} />);
    const input = await screen.findByRole("textbox");
    await waitFor(() => expect(input).toBeEnabled());
    fireEvent.change(input, { target: { value: "山" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    const box = await screen.findByRole("region", { name: "今日の中級の答え" });
    await waitFor(() => expect(box).toHaveFocus());
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("1回目で当てました。")).toBeInTheDocument();
    expect(trackContentEnd).toHaveBeenCalledTimes(1);
    expect(trackContentEnd).toHaveBeenCalledWith("kanji-kanaru", "game", true);
  });

  test("mounted in the browser (a link inside the site), it reserves the saved day before the first render and releases it on leaving", () => {
    mockApi(true);
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    localStorage.setItem(
      "kanji-kanaru-history-intermediate",
      JSON.stringify({
        [today]: {
          guesses: ["川"],
          feedbacks: [MISS],
          status: "won",
          guessCount: 1,
        },
      }),
    );
    let styleAtFirstRender: string | null = null;
    function Probe() {
      styleAtFirstRender ??=
        document.getElementById("kanji-kanaru-saved-layout")?.textContent ?? "";
      return null;
    }
    const { unmount } = render(
      <>
        <GameContainer crossCategoryItems={[]} />
        <Probe />
      </>,
    );
    expect(styleAtFirstRender).toContain("--kanji-kanaru-board-rows:1");
    expect(styleAtFirstRender).toContain(
      "--kanji-kanaru-input-visibility:hidden",
    );
    unmount();
    expect(document.getElementById("kanji-kanaru-saved-layout")).toBeNull();
  });

  test("reopening a finished game shows the result without sending the game end again", async () => {
    mockApi(true);
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    localStorage.setItem(
      "kanji-kanaru-history-intermediate",
      JSON.stringify({
        [today]: {
          guesses: ["川"],
          feedbacks: [MISS],
          status: "won",
          guessCount: 1,
        },
      }),
    );
    render(<GameContainer crossCategoryItems={[]} />);
    const box = await screen.findByRole("region", { name: "今日の中級の答え" });
    expect(box).not.toHaveFocus();
    expect(trackContentEnd).not.toHaveBeenCalled();
  });
});
