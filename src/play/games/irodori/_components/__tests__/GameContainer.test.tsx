import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import GameContainer from "../GameContainer";
import { trackContentEnd, trackSave } from "@/lib/analytics";
import {
  downloadImage,
  generateResultImage,
} from "@/play/games/irodori/_lib/share";
import type { IrodoriColor } from "@/play/games/irodori/_lib/types";

vi.mock("@/lib/analytics", () => ({
  trackContentEnd: vi.fn(),
  trackSave: vi.fn(),
  trackShare: vi.fn(),
}));

// jsdom は Canvas を描かないので、結果の画像を描く所と落とす所を差し替える。
vi.mock("@/play/games/irodori/_lib/share", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/play/games/irodori/_lib/share")>()),
  generateResultImage: vi.fn(),
  downloadImage: vi.fn(),
}));

const IMAGE_URL = "data:image/png;base64,AAAA";

const TODAY = "2026-09-27";

const COLORS: IrodoriColor[] = [
  { h: 200, s: 60, l: 40, hex: "#296d8f", name: "藍色", slug: "ai" },
  { h: 10, s: 80, l: 50, hex: "#e64a19" },
  { h: 120, s: 40, l: 60, hex: "#7ab87a", name: "若草色", slug: "wakakusa" },
  { h: 280, s: 50, l: 30, hex: "#5c2673" },
  { h: 50, s: 70, l: 70, hex: "#ebd585" },
];

function renderGame() {
  return render(
    <GameContainer
      colors={COLORS}
      puzzleNumber={220}
      todayStr={TODAY}
      dateDisplayString="2026年9月27日"
      crossCategoryItems={[]}
    />,
  );
}

function progress() {
  return screen.getByRole("progressbar", { name: "問の進み具合" });
}

// jsdom は字を組まないので、Range の矩形を持たない。量の帯の並びが字の幅を測れるよう、空の矩形を返す。
beforeAll(() => {
  Range.prototype.getBoundingClientRect = () => ({ width: 0 }) as DOMRect;
});

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(trackContentEnd).mockClear();
  vi.mocked(trackSave).mockClear();
  vi.mocked(downloadImage).mockClear();
  vi.mocked(generateResultImage).mockReset();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("イロドリの盤", () => {
  test("進み具合の帯が、見える数・読み上げとも、いまの問の番号を言う", () => {
    renderGame();
    expect(progress()).toHaveAttribute("aria-valuenow", "1");
    expect(progress()).toHaveAttribute("aria-valuetext", "5問中1問目");
    expect(screen.getByText("1 / 5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "決定" }));
    // 決めたあとも、判定を見ているあいだは同じ問のまま。
    expect(progress()).toHaveAttribute("aria-valuenow", "1");

    fireEvent.click(screen.getByRole("button", { name: /次の問題へ/ }));
    expect(progress()).toHaveAttribute("aria-valuenow", "2");
    expect(progress()).toHaveAttribute("aria-valuetext", "5問中2問目");
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  test("お題と作る色の見本を並べ、スライダーは見えるラベルを名前に持つ", () => {
    renderGame();
    expect(screen.getByRole("img", { name: "お題の色" })).toHaveStyle({
      backgroundColor: "#296d8f",
    });
    expect(screen.getByRole("img", { name: "あなたの色" })).toBeInTheDocument();
    for (const name of ["色相", "彩度", "明度"]) {
      expect(screen.getByRole("slider", { name })).toBeInTheDocument();
    }
  });

  test("決めると判定が出て、次の問へ進むボタンにフォーカスが移り、伝統色の名前を言う", () => {
    renderGame();
    fireEvent.click(screen.getByRole("button", { name: "決定" }));
    const next = screen.getByRole("button", { name: /次の問題へ/ });
    expect(next).toHaveFocus();
    expect(next).toHaveAccessibleDescription(/点/);
    expect(screen.getByRole("link", { name: "藍色" })).toHaveAttribute(
      "href",
      "/dictionary/colors/ai",
    );
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();

    fireEvent.click(next);
    expect(screen.getByRole("slider", { name: "色相" })).toHaveFocus();
  });

  test("5問を終えると結果のボックスが出て、色見本が問の番号とお題か回答かを言い、分布に「今回」が1つある", () => {
    renderGame();
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole("button", { name: "決定" }));
      if (i < 4) {
        fireEvent.click(screen.getByRole("button", { name: /次の問題へ/ }));
      }
    }
    const box = screen.getByRole("region", { name: "今日の合計点" });
    expect(box).toHaveFocus();
    // 結果に着いたら、進み具合の帯は外す（クイズの結果の画面と同じ）。
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "決定" }),
    ).not.toBeInTheDocument();
    for (let n = 1; n <= 5; n++) {
      within(box).getByRole("img", { name: `問${n}のお題の色` });
      within(box).getByRole("img", { name: `問${n}の回答の色` });
    }
    expect(within(box).getByText(/ランク、/)).toBeInTheDocument();
    const distribution = within(box).getByRole("list", {
      name: "合計点ごとの回数",
    });
    expect(within(distribution).getAllByText("今回")).toHaveLength(1);
    expect(within(box).getByText("遊んだ回数").nextSibling).toHaveTextContent(
      "1回",
    );
    expect(
      screen.getByRole("region", { name: "この結果を共有" }),
    ).toBeInTheDocument();
  });

  test("端末に今日の記録があれば、描いたあとに途中の問から続ける", () => {
    window.localStorage.setItem(
      "irodori-history",
      JSON.stringify({
        [TODAY]: {
          scores: [80, 70, 60, null, null],
          answers: [
            { h: 190, s: 60, l: 40 },
            { h: 20, s: 80, l: 50 },
            { h: 110, s: 40, l: 60 },
            null,
            null,
          ],
          totalScore: null,
          currentRound: 3,
          status: "playing",
        },
      }),
    );
    renderGame();
    expect(progress()).toHaveAttribute("aria-valuenow", "4");
    expect(screen.getByRole("img", { name: "お題の色" })).toHaveStyle({
      backgroundColor: "#5c2673",
    });
  });

  test("解き終えた日に開き直すと、結果のボックスが動かずに出て、フォーカスを奪わない", () => {
    window.localStorage.setItem(
      "irodori-history",
      JSON.stringify({
        [TODAY]: {
          scores: [85, 70, 60, 90, 95],
          totalScore: 80,
          currentRound: 5,
          status: "completed",
        },
      }),
    );
    renderGame();
    const box = screen.getByRole("region", { name: "今日の合計点" });
    expect(box).not.toHaveFocus();
    expect(box.className).not.toMatch(/appears/);
    expect(within(box).getByText("80点")).toBeInTheDocument();
    // 回答の色を持たない記録では、回答の見本の代わりに字で言う。
    expect(within(box).getAllByText("記録なし")).toHaveLength(5);
  });

  test("遊び終えたことは、その場で5問目を決めたときに1度だけ計測する", () => {
    renderGame();
    for (let i = 0; i < 5; i++) {
      expect(trackContentEnd).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "決定" }));
      if (i < 4) {
        fireEvent.click(screen.getByRole("button", { name: /次の問題へ/ }));
      }
    }
    expect(trackContentEnd).toHaveBeenCalledTimes(1);
    expect(trackContentEnd).toHaveBeenCalledWith("irodori", "game", true);
  });

  test("遊び終えた日に開き直しても、遊び終えたことを計測しない", () => {
    window.localStorage.setItem(
      "irodori-history",
      JSON.stringify({
        [TODAY]: {
          scores: [85, 70, 60, 90, 95],
          totalScore: 80,
          currentRound: 5,
          status: "completed",
        },
      }),
    );
    renderGame();
    expect(
      screen.getByRole("region", { name: "今日の合計点" }),
    ).toBeInTheDocument();
    expect(trackContentEnd).not.toHaveBeenCalled();
  });
});

describe("結果の画像の保存", () => {
  function finishGame() {
    renderGame();
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole("button", { name: "決定" }));
      if (i < 4) {
        fireEvent.click(screen.getByRole("button", { name: /次の問題へ/ }));
      }
    }
  }

  test("「画像を保存」を押すと、解き終えた回の画像を落とし、結果の画像の保存として計測する", async () => {
    vi.mocked(generateResultImage).mockResolvedValue(IMAGE_URL);
    finishGame();
    fireEvent.click(screen.getByRole("button", { name: "画像を保存" }));
    await waitFor(() => expect(trackSave).toHaveBeenCalledTimes(1));
    expect(trackSave).toHaveBeenCalledWith(
      "irodori",
      "game",
      "download",
      "fuda",
    );
    expect(downloadImage).toHaveBeenCalledWith(IMAGE_URL, "irodori-220.png");
    const [state] = vi.mocked(generateResultImage).mock.calls[0];
    expect(state.status).toBe("completed");
    expect(state.rounds.every((round) => round.answer !== null)).toBe(true);
  });

  test("画像を描いているあいだに2度押しても、落とすのも計測も1回", async () => {
    let finishDrawing: (url: string) => void = () => {};
    vi.mocked(generateResultImage).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishDrawing = resolve;
        }),
    );
    finishGame();
    const save = screen.getByRole("button", { name: "画像を保存" });
    fireEvent.click(save);
    fireEvent.click(save);
    finishDrawing(IMAGE_URL);
    await waitFor(() => expect(trackSave).toHaveBeenCalledTimes(1));
    expect(generateResultImage).toHaveBeenCalledTimes(1);
    expect(downloadImage).toHaveBeenCalledTimes(1);
  });

  test("描き終えたあとは、もう1度押すと、もう1度落とす", async () => {
    vi.mocked(generateResultImage).mockResolvedValue(IMAGE_URL);
    finishGame();
    const save = screen.getByRole("button", { name: "画像を保存" });
    fireEvent.click(save);
    await waitFor(() => expect(trackSave).toHaveBeenCalledTimes(1));
    fireEvent.click(save);
    await waitFor(() => expect(trackSave).toHaveBeenCalledTimes(2));
    expect(downloadImage).toHaveBeenCalledTimes(2);
  });

  test("ダブルクリックの2度目は、1度目を描き終えたあとに届いても、落とすのも計測も1回", async () => {
    vi.mocked(generateResultImage).mockResolvedValue(IMAGE_URL);
    finishGame();
    const save = screen.getByRole("button", { name: "画像を保存" });
    fireEvent.click(save, { detail: 1 });
    await waitFor(() => expect(trackSave).toHaveBeenCalledTimes(1));
    fireEvent.click(save, { detail: 2 });
    fireEvent.click(save, { detail: 3 });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(generateResultImage).toHaveBeenCalledTimes(1);
    expect(downloadImage).toHaveBeenCalledTimes(1);
    expect(trackSave).toHaveBeenCalledTimes(1);
  });

  test("キーを押し続けたときの繰り返しの押下は捨て、改めての押下は受ける", () => {
    finishGame();
    const save = screen.getByRole("button", { name: "画像を保存" });
    expect(fireEvent.keyDown(save, { key: "Enter", repeat: true })).toBe(false);
    expect(fireEvent.keyDown(save, { key: "Enter" })).toBe(true);
  });

  test("画像を描けなかったときは、何も落とさず、計測もしない", async () => {
    vi.mocked(generateResultImage).mockResolvedValue(null);
    finishGame();
    fireEvent.click(screen.getByRole("button", { name: "画像を保存" }));
    await waitFor(() => expect(generateResultImage).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(downloadImage).not.toHaveBeenCalled();
    expect(trackSave).not.toHaveBeenCalled();
  });
});

describe("取っておいた場所", () => {
  test("ほかのページへ移ると、本体の前のスクリプトが取っておいた場所の値を外す", () => {
    const style = document.createElement("style");
    style.id = "irodori-saved-layout";
    document.head.append(style);
    const { unmount } = renderGame();
    expect(document.getElementById("irodori-saved-layout")).not.toBeNull();
    unmount();
    expect(document.getElementById("irodori-saved-layout")).toBeNull();
  });
});
