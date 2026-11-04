/**
 * QuizContainer — 二度押しの2打目を受けない守り（docs/cycles/cycle-316/t5a-design.md 4-9）。
 *
 * 押した点の下が入れ替わる操作のあと、新しく出た画面を読む前の、1打目の点の近くへの押しは受けない。
 *  - 窓の守り（「はじめる」→1問目・知識クイズの「次へ」→次の問・最後の答えか最後の「次へ」→結果）: 起点から押し下げが
 *    700ms 未満で、起点の点から直線で 100px 以下のポインタの押し。
 *  - 連続の押しの守り（診断の答え→次の問）: 同じ範囲のうち、連続の押し。マウスは mousedown の detail >= 2、タッチと
 *    ペンは直前の押し（起点か、受けなかった押し）の離しから 300ms 未満の押し下げ。
 * 時刻と座標は pointerdown で取り、受けないと決めた押しは mousedown と click の両方を止める。
 *
 * 事象は、ブラウザが送る順と値で組む。pointerdown の detail はいつも 0 で、マウスの連続の数は mousedown と click の
 * detail だけが持つ。事象の時刻（timeStamp）は、押しごとに決めた値に差し替える。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuizContainer, { ANSWER_SHOWN_MS } from "../QuizContainer";
import { questionPhrases } from "../../questionPhrases";
import type {
  QuizDefinition,
  QuizMeta,
  QuizQuestion,
  QuizResult,
} from "../../types";

const gtagSpy = vi.fn();
beforeEach(() => {
  gtagSpy.mockClear();
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
  vi.useFakeTimers();
  vi.stubGlobal("scrollBy", vi.fn());
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// 結果の画面は、ほかのページへのリンクと「もう一度挑戦する」だけを描く軽い形にする。
vi.mock("../ResultCard", () => ({
  default: ({
    head,
    onRetry,
  }: {
    head: React.ReactNode;
    onRetry: () => void;
  }) => (
    <>
      {head}
      <a href="https://example.com/">次の遊び</a>
      <button type="button" onClick={onRetry}>
        もう一度挑戦する
      </button>
    </>
  ),
}));
vi.mock("../ResultExtraLoader", () => ({
  default: () => null,
  hasResultExtra: () => false,
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

function makeQuiz(
  type: "personality" | "knowledge",
  questionCount: number,
): QuizDefinition {
  const meta = {
    slug: type === "personality" ? "character-personality" : "kanji-level",
    title: "テスト",
    type,
    description: "テスト",
    questionCount,
  } as QuizMeta;
  const questions = Array.from(
    { length: questionCount },
    (_, index): QuizQuestion => ({
      id: `q${index + 1}`,
      text: `問${index + 1}`,
      choices:
        type === "personality"
          ? [
              { id: `c${index + 1}a`, text: "選択1", points: { a: 1 } },
              { id: `c${index + 1}b`, text: "選択2", points: { a: 1 } },
            ]
          : [
              { id: `c${index + 1}a`, text: "正解", isCorrect: true },
              { id: `c${index + 1}b`, text: "不正解" },
            ],
      explanation: type === "knowledge" ? `解説${index + 1}` : undefined,
    }),
  );
  const results: QuizResult[] = [
    { id: "a", title: "タイプA", description: "A" },
  ];
  return { meta, questions, results };
}

/** ページの頭。ほかのページへのリンクと、開閉するもの（summary）を持つ。 */
const head = (
  <>
    <h1>見出し</h1>
    <a href="/elsewhere">ほかのページ</a>
    <details>
      <summary>くわしく</summary>
      <p>中身</p>
    </details>
  </>
);

/** 描いて、外す関数を返す。守りは window に置くので、1つの試験で2つ目を描く前に1つ目を外す。 */
function renderQuiz(quiz: QuizDefinition): () => void {
  return render(
    <QuizContainer
      head={head}
      quiz={quiz}
      questionPhrases={questionPhrases(quiz)}
      resultHeadings={{ a: { phrases: ["タイプA"] } }}
      readingHeadings={{}}
    />,
  ).unmount;
}

function at<T extends Event>(event: T, time: number): T {
  Object.defineProperty(event, "timeStamp", { value: time });
  return event;
}

interface PressOptions {
  /** 押し下げの時刻。 */
  down: number;
  /** 離しの時刻。既定は押し下げの 50ms あと。 */
  up?: number;
  x?: number;
  y?: number;
  pointerType?: "mouse" | "touch" | "pen";
  /** mousedown と click の detail（マウスの連続の数）。既定は 1。 */
  detail?: number;
}

interface PressOutcome {
  mouseDownPrevented: boolean;
  clickPrevented: boolean;
  /** 文書の受け手（バブルの段階）に click が届いたか。 */
  clickReachedDocument: boolean;
}

/**
 * ポインタの1つの押しを、ブラウザの順で送る。マウスは pointerdown → mousedown → pointerup → mouseup → click、
 * タッチとペンは pointerdown → pointerup → mousedown → mouseup → click。
 */
async function press(
  target: Element,
  options: PressOptions,
): Promise<PressOutcome> {
  const {
    down,
    up = down + 50,
    x = 100,
    y = 500,
    pointerType = "mouse",
    detail = 1,
  } = options;
  const coordinates = {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  };
  const pointer = {
    ...coordinates,
    pointerType,
    pointerId: 1,
    isPrimary: true,
  };
  const mouseTime = pointerType === "mouse" ? down : up;
  let clickReachedDocument = false;
  const noteClick = (): void => {
    clickReachedDocument = true;
  };
  document.addEventListener("click", noteClick);
  let mouseDownPrevented = false;
  let clickPrevented = false;
  await act(async () => {
    target.dispatchEvent(
      at(new PointerEvent("pointerdown", { ...pointer, detail: 0 }), down),
    );
    const mouseDown = at(
      new MouseEvent("mousedown", { ...coordinates, detail }),
      mouseTime,
    );
    if (pointerType === "mouse") target.dispatchEvent(mouseDown);
    target.dispatchEvent(
      at(new PointerEvent("pointerup", { ...pointer, detail: 0 }), up),
    );
    if (pointerType !== "mouse") target.dispatchEvent(mouseDown);
    target.dispatchEvent(
      at(new MouseEvent("mouseup", { ...coordinates, detail }), up),
    );
    const click = at(new MouseEvent("click", { ...coordinates, detail }), up);
    target.dispatchEvent(click);
    mouseDownPrevented = mouseDown.defaultPrevented;
    clickPrevented = click.defaultPrevented;
  });
  document.removeEventListener("click", noteClick);
  return { mouseDownPrevented, clickPrevented, clickReachedDocument };
}

/** キーボードの起動（対の押し下げを持たない、detail が 0 の click）。 */
async function pressWithKeyboard(target: Element): Promise<boolean> {
  const click = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    detail: 0,
  });
  await act(async () => {
    target.dispatchEvent(click);
  });
  return click.defaultPrevented;
}

async function advance(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

function button(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

function questionHeading(): HTMLElement {
  return screen.getByRole("heading", { level: 2 });
}

/** 診断で、いまの問に答えが入っていないこと（選択肢がまだボタンであること）。 */
function isUnanswered(): boolean {
  return screen.queryAllByRole("button", { name: /^選択/ }).length === 2;
}

function guardedEvents(): unknown[][] {
  return gtagSpy.mock.calls.filter((call) => call[1] === "quiz_press_guarded");
}

function retryEvents(): unknown[][] {
  return gtagSpy.mock.calls.filter(
    (call) => call[1] === "quiz_press_guarded_retry",
  );
}

describe("窓の守り（「はじめる」→1問目）", () => {
  /** 診断を開き、マウスで (100, 500) の「はじめる」を時刻 1000 に押す。 */
  async function startWithMouse(): Promise<void> {
    renderQuiz(makeQuiz("personality", 2));
    await press(button("はじめる"), { down: 1000 });
    expect(questionHeading()).toHaveTextContent("問1");
  }

  test("700ms 未満・100px の中の押しは、答えを入れず、mousedown と click を止め、フォーカスを動かさない", async () => {
    await startWithMouse();
    const outcome = await press(button("選択1"), { down: 1300, y: 520 });
    expect(outcome).toEqual({
      mouseDownPrevented: true,
      clickPrevented: true,
      clickReachedDocument: false,
    });
    await advance(ANSWER_SHOWN_MS);
    expect(isUnanswered()).toBe(true);
    expect(questionHeading()).toHaveTextContent("問1");
    expect(document.activeElement).toBe(questionHeading());
  });

  test("リンクへの押しは移動を止め、summary への押しは開閉を起こさない", async () => {
    await startWithMouse();
    const link = await press(
      screen.getByRole("link", { name: "ほかのページ" }),
      {
        down: 1200,
        y: 450,
      },
    );
    expect(link.clickPrevented).toBe(true);
    expect(link.clickReachedDocument).toBe(false);
    const summary = screen.getByText("くわしく");
    const toggle = await press(summary, { down: 1300, y: 430 });
    expect(toggle.clickPrevented).toBe(true);
    expect(summary.closest("details")?.open).toBe(false);
  });

  test("押し下げが窓の中なら、離しが窓の外でも受けない", async () => {
    await startWithMouse();
    const outcome = await press(button("選択1"), { down: 1600, up: 1800 });
    expect(outcome.clickPrevented).toBe(true);
    await advance(ANSWER_SHOWN_MS);
    expect(isUnanswered()).toBe(true);
  });

  test("起点からちょうど 100px の押しは受けず、100px を超える押しは受ける", async () => {
    await startWithMouse();
    expect(
      (await press(button("選択1"), { down: 1200, x: 160, y: 580 }))
        .clickPrevented,
    ).toBe(true);
    const outside = await press(button("選択1"), { down: 1300, y: 600.5 });
    expect(outside).toEqual({
      mouseDownPrevented: false,
      clickPrevented: false,
      clickReachedDocument: true,
    });
    await advance(ANSWER_SHOWN_MS);
    expect(questionHeading()).toHaveTextContent("問2");
  });

  test("起点から 699ms の押しは受けず、700ms の押し（窓のすぐ外）は受ける", async () => {
    await startWithMouse();
    expect((await press(button("選択1"), { down: 1699 })).clickPrevented).toBe(
      true,
    );
    expect((await press(button("選択1"), { down: 1700 })).clickPrevented).toBe(
      false,
    );
    await advance(ANSWER_SHOWN_MS);
    expect(questionHeading()).toHaveTextContent("問2");
  });

  test("窓の中でも、detail が 0 の click（キーボードと読み上げの起動）は答えを入れる", async () => {
    await startWithMouse();
    expect(await pressWithKeyboard(button("選択1"))).toBe(false);
    await advance(ANSWER_SHOWN_MS);
    expect(questionHeading()).toHaveTextContent("問2");
  });

  test("キーボードで「はじめる」を押したあとは窓が開かず、すぐの指の押しも受ける", async () => {
    renderQuiz(makeQuiz("personality", 2));
    await pressWithKeyboard(button("はじめる"));
    const outcome = await press(button("選択1"), {
      down: 1000,
      pointerType: "touch",
    });
    expect(outcome.clickPrevented).toBe(false);
    await advance(ANSWER_SHOWN_MS);
    expect(questionHeading()).toHaveTextContent("問2");
  });

  test("タッチで押した「はじめる」のあとも、窓の中の指の押しを受けない", async () => {
    renderQuiz(makeQuiz("personality", 2));
    await press(button("はじめる"), { down: 1000, pointerType: "touch" });
    const outcome = await press(button("選択1"), {
      down: 1250,
      pointerType: "touch",
    });
    expect(outcome.mouseDownPrevented).toBe(true);
    expect(outcome.clickPrevented).toBe(true);
    await advance(ANSWER_SHOWN_MS);
    expect(isUnanswered()).toBe(true);
  });
});

describe("窓の守り（知識クイズの「次へ」と、結果への切り替わり）", () => {
  test("「次へ」で次の問へ移ったあと、窓の中の押しは次の問に答えを入れない", async () => {
    renderQuiz(makeQuiz("knowledge", 2));
    await pressWithKeyboard(button("はじめる"));
    await pressWithKeyboard(button("正解"));
    await press(button("次へ"), { down: 1000 });
    expect(questionHeading()).toHaveTextContent("問2");
    expect((await press(button("正解"), { down: 1300 })).clickPrevented).toBe(
      true,
    );
    expect(screen.queryByText("解説2")).toBeNull();
  });

  test("知識クイズで答えたあとには守りを掛けず、「次へ」へのすぐの押しも受ける", async () => {
    renderQuiz(makeQuiz("knowledge", 2));
    await pressWithKeyboard(button("はじめる"));
    await press(button("正解"), { down: 1000 });
    expect(screen.getByText("解説1")).toBeInTheDocument();
    expect((await press(button("次へ"), { down: 1100 })).clickPrevented).toBe(
      false,
    );
    expect(questionHeading()).toHaveTextContent("問2");
  });

  test("診断の最後の答えの窓は、結果が出た時刻でなく、答えた押しの時刻から数える", async () => {
    renderQuiz(makeQuiz("personality", 1));
    await pressWithKeyboard(button("はじめる"));
    await press(button("選択1"), { down: 1000 });
    await advance(ANSWER_SHOWN_MS);
    // 答えた押しから 690ms は受けない。700ms は受ける（結果が出てから数えれば、まだ窓の中）。
    expect(
      (
        await press(screen.getByRole("link", { name: "次の遊び" }), {
          down: 1690,
        })
      ).clickPrevented,
    ).toBe(true);
    expect(
      (await press(button("もう一度挑戦する"), { down: 1700 })).clickPrevented,
    ).toBe(false);
    expect(button("はじめる")).toBeInTheDocument();
  });

  test("「もう一度挑戦する」のあとは守りを掛けず、2打目の「はじめる」を受け、その押しが窓を開く", async () => {
    renderQuiz(makeQuiz("personality", 1));
    await pressWithKeyboard(button("はじめる"));
    await pressWithKeyboard(button("選択1"));
    await advance(ANSWER_SHOWN_MS);
    await press(button("もう一度挑戦する"), { down: 5000 });
    expect(
      (await press(button("はじめる"), { down: 5200, y: 505 })).clickPrevented,
    ).toBe(false);
    expect(questionHeading()).toHaveTextContent("問1");
    // 「はじめる」の押し（5200・y 505）から 300ms の、同じ所の3打目は受けない。
    expect(
      (await press(button("選択1"), { down: 5500, y: 505 })).clickPrevented,
    ).toBe(true);
    await advance(ANSWER_SHOWN_MS);
    expect(isUnanswered()).toBe(true);
  });
});

describe("連続の押しの守り（診断の答え→次の問）", () => {
  /** 3問の診断をキーボードで始め、1問目に (100, 500) で答えて、次の問を出す。 */
  async function answerFirst(
    pointerType: "mouse" | "touch" | "pen",
  ): Promise<void> {
    renderQuiz(makeQuiz("personality", 3));
    await pressWithKeyboard(button("はじめる"));
    await press(button("選択1"), { down: 1000, up: 1050, pointerType });
    await advance(ANSWER_SHOWN_MS);
    expect(questionHeading()).toHaveTextContent("問2");
  }

  /** 次の問に答えが入ったか（答えを見せたあと、3問目へ進んだか）。 */
  async function answeredSecond(): Promise<boolean> {
    await advance(ANSWER_SHOWN_MS);
    return questionHeading().textContent === "問3";
  }

  describe("マウス", () => {
    test("mousedown と click の detail が 2 の、700ms 未満・100px の中の押しは答えを入れず、語の選択も始めない", async () => {
      await answerFirst("mouse");
      const outcome = await press(button("選択1"), { down: 1300, detail: 2 });
      expect(outcome.mouseDownPrevented).toBe(true);
      expect(outcome.clickPrevented).toBe(true);
      expect(await answeredSecond()).toBe(false);
    });

    test("detail が 1 の押しは、窓の中・100px の中でも答えを入れる", async () => {
      await answerFirst("mouse");
      expect(
        (await press(button("選択1"), { down: 1300, detail: 1 }))
          .clickPrevented,
      ).toBe(false);
      expect(await answeredSecond()).toBe(true);
    });

    test("100px の外の detail 2 の押しは答えを入れる", async () => {
      await answerFirst("mouse");
      expect(
        (await press(button("選択1"), { down: 1300, y: 610, detail: 2 }))
          .clickPrevented,
      ).toBe(false);
      expect(await answeredSecond()).toBe(true);
    });

    test("700ms 以上の detail 2 の押しは答えを入れる", async () => {
      await answerFirst("mouse");
      expect(
        (await press(button("選択1"), { down: 1700, detail: 2 }))
          .clickPrevented,
      ).toBe(false);
      expect(await answeredSecond()).toBe(true);
    });
  });

  describe.each(["touch", "pen"] as const)("%s", (pointerType) => {
    test("detail が 1 のまま、答えた押しの離しから 300ms 未満・100px の中の押し下げは答えを入れない", async () => {
      await answerFirst(pointerType);
      const outcome = await press(button("選択1"), {
        down: 1050 + 299,
        pointerType,
      });
      expect(outcome.mouseDownPrevented).toBe(true);
      expect(outcome.clickPrevented).toBe(true);
      expect(await answeredSecond()).toBe(false);
    });

    test("離しから 300ms の押し下げは答えを入れる", async () => {
      await answerFirst(pointerType);
      expect(
        (await press(button("選択1"), { down: 1050 + 300, pointerType }))
          .clickPrevented,
      ).toBe(false);
      expect(await answeredSecond()).toBe(true);
    });

    test("100px の外の押しは、離しから 300ms 未満でも答えを入れる", async () => {
      await answerFirst(pointerType);
      expect(
        (
          await press(button("選択1"), {
            down: 1050 + 200,
            y: 610,
            pointerType,
          })
        ).clickPrevented,
      ).toBe(false);
      expect(await answeredSecond()).toBe(true);
    });

    test("離しから 150ms・300ms の三度押しの3打目は、2打目の離しから数えて連続とし、答えを入れない", async () => {
      await answerFirst(pointerType);
      const second = await press(button("選択1"), {
        down: 1050 + 150,
        up: 1050 + 190,
        pointerType,
      });
      expect(second.clickPrevented).toBe(true);
      // 起点の離しからは 300ms、2打目の離しからは 110ms。
      const third = await press(button("選択1"), {
        down: 1050 + 300,
        pointerType,
      });
      expect(third.clickPrevented).toBe(true);
      expect(await answeredSecond()).toBe(false);
    });
  });
});

describe("数えるイベント", () => {
  async function startWithMouse(): Promise<void> {
    renderQuiz(makeQuiz("personality", 2));
    await press(button("はじめる"), { down: 1000 });
  }

  test("止めたときに、1つの守りで最初の1回だけ quiz_press_guarded を送る", async () => {
    await startWithMouse();
    await press(button("選択1"), { down: 1200 });
    await press(button("選択2"), { down: 1300, y: 545 });
    expect(guardedEvents()).toEqual([
      [
        "event",
        "quiz_press_guarded",
        { transition: "start", content_id: "quiz-character-personality" },
      ],
    ]);
  });

  test("押し下げのあと引いて送りになった押し（mousedown も click も来ない）は数えない", async () => {
    await startWithMouse();
    const choice = button("選択1");
    await act(async () => {
      choice.dispatchEvent(
        at(
          new PointerEvent("pointerdown", {
            bubbles: true,
            clientX: 100,
            clientY: 500,
            pointerType: "touch",
            pointerId: 2,
          }),
          1200,
        ),
      );
      choice.dispatchEvent(
        at(
          new PointerEvent("pointercancel", {
            bubbles: true,
            pointerType: "touch",
            pointerId: 2,
          }),
          1250,
        ),
      );
    });
    expect(guardedEvents()).toEqual([]);
  });

  test("受けない押しを止めなかった守り（窓の中の押しが無い）は数えない", async () => {
    await startWithMouse();
    await press(button("選択1"), { down: 1800 });
    expect(guardedEvents()).toEqual([]);
  });

  test("ボタンの中の字に落ちた押しのあと、3 秒以内にボタンの余白を押し直して受けたら、quiz_press_guarded_retry を1回送る", async () => {
    await startWithMouse();
    const choice = button("選択1");
    const face = choice.querySelector("span");
    expect(face).not.toBeNull();
    await press(face as Element, { down: 1200 });
    await press(choice, { down: 1450, y: 650 });
    expect(retryEvents()).toEqual([
      [
        "event",
        "quiz_press_guarded_retry",
        {
          transition: "start",
          content_id: "quiz-character-personality",
          elapsed_ms: 250,
        },
      ],
    ]);
  });

  test("ほかの押せるものを押して受けたら、quiz_press_guarded_retry を送らない", async () => {
    await startWithMouse();
    await press(button("選択1"), { down: 1200 });
    await press(button("選択2"), { down: 1500, y: 650 });
    expect(retryEvents()).toEqual([]);
  });

  test("受けなかった押しから 3 秒より後の押し直しは、quiz_press_guarded_retry を送らない", async () => {
    await startWithMouse();
    await press(button("選択1"), { down: 1200 });
    await press(button("選択1"), { down: 4201, y: 650 });
    expect(retryEvents()).toEqual([]);
  });

  test("受けなかった押しから 3 秒ちょうどの押し直しは数える", async () => {
    await startWithMouse();
    await press(button("選択1"), { down: 1200 });
    await press(button("選択1"), { down: 4200, y: 650 });
    expect(retryEvents().map((call) => call[2])).toEqual([
      {
        transition: "start",
        content_id: "quiz-character-personality",
        elapsed_ms: 3000,
      },
    ]);
  });

  test("押せるものの上でなかった押しは、押し直しの元にしない", async () => {
    await startWithMouse();
    await press(questionHeading(), { down: 1200 });
    expect(guardedEvents()).toHaveLength(1);
    await press(button("選択1"), { down: 1500, y: 650 });
    expect(retryEvents()).toEqual([]);
  });

  test("切り替わりごとの transition を送る（次の問・結果・診断の答え）", async () => {
    const unmountKnowledge = renderQuiz(makeQuiz("knowledge", 2));
    await pressWithKeyboard(button("はじめる"));
    await pressWithKeyboard(button("正解"));
    await press(button("次へ"), { down: 1000 });
    await press(button("正解"), { down: 1100 });
    await pressWithKeyboard(button("正解"));
    await press(button("次へ"), { down: 3000 });
    await press(screen.getByRole("link", { name: "次の遊び" }), {
      down: 3100,
    });
    unmountKnowledge();

    renderQuiz(makeQuiz("personality", 2));
    await pressWithKeyboard(button("はじめる"));
    await press(button("選択1"), { down: 5000 });
    await advance(ANSWER_SHOWN_MS);
    await press(button("選択1"), { down: 5200, detail: 2 });

    expect(guardedEvents().map((call) => call[2])).toEqual([
      { transition: "next", content_id: "quiz-kanji-level" },
      { transition: "result", content_id: "quiz-kanji-level" },
      { transition: "answer", content_id: "quiz-character-personality" },
    ]);
  });
});
