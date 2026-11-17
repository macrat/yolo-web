/**
 * QuizContainer — 診断の答えと、押した選択肢を見せるあいだの再入力。
 *
 * 押すと答えを記録し、押した選択肢を 150ms 見せてから次の問か結果へ移る。見せているあいだは、押した行の字だけが
 * 押す前と同じ下線を持ち、ほかの行は下線の無い字になって押せない。1つの問に答えは1つで、2打目がどの経路
 * （同じ描画の中の2回の click・別の task で届く click・キーボードの連打）から届いても答えは変わらない
 * （docs/knowledge/input-events-and-guards.md §2 の3経路）。
 *
 * 「はじめる」を指やマウスで押してから 500ms のあいだは、1問目の選択肢が指やマウスの押しを受け付けない（「はじめる」の
 * 二度押しの2打目を答えにしない）。キーボードの押しと、2問目からの押しは、いつでも受け付ける。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import QuizContainer, {
  ANSWER_SHOWN_MS,
  START_PRESS_GUARD_MS,
} from "../QuizContainer";
import { buttonUnderlineClassName } from "@/components/Button";
import type {
  QuizAnswer,
  QuizDefinition,
  QuizMeta,
  QuizQuestion,
  QuizResult,
} from "../../types";

beforeEach(() => {
  (window as unknown as { gtag: () => void }).gtag = vi.fn();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

// 結果の画面では、記録した答えの並びを見えるようにし（追加の読みものは答えの並びを受け取る）、「もう一度挑戦する」を置く。
vi.mock("../ResultCard", () => ({
  default: ({
    extra,
    onRetry,
  }: {
    extra?: React.ReactNode;
    onRetry: () => void;
  }) => (
    <div data-testid="result-card">
      {extra}
      <button type="button" onClick={onRetry}>
        もう一度挑戦する
      </button>
    </div>
  ),
}));
vi.mock("../ResultExtraLoader", () => ({
  default: ({ answers }: { answers: QuizAnswer[] }) => (
    <output data-testid="answers">
      {answers.map((answer) => answer.choiceId).join(",")}
    </output>
  ),
  hasResultExtra: () => true,
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

function makePersonalityQuiz(): QuizDefinition {
  const meta = {
    slug: "character-personality",
    title: "似たキャラ診断",
    type: "personality",
    description: "テスト",
    questionCount: 2,
  } as QuizMeta;
  const questions: QuizQuestion[] = [
    {
      id: "q1",
      text: "問1",
      choices: [
        { id: "c1a", text: "選択1A", points: { "type-a": 1 } },
        { id: "c1b", text: "選択1B", points: { "type-b": 1 } },
        { id: "c1c", text: "選択1C", points: { "type-b": 1 } },
      ],
    },
    {
      id: "q2",
      text: "問2",
      choices: [
        { id: "c2a", text: "選択2A", points: { "type-a": 1 } },
        { id: "c2b", text: "選択2B", points: { "type-b": 1 } },
      ],
    },
  ];
  const results: QuizResult[] = [
    { id: "type-a", title: "タイプA", description: "A" },
    { id: "type-b", title: "タイプB", description: "B" },
  ];
  return { meta, questions, results };
}

function renderQuiz(choicePhrases: Record<string, readonly string[]> = {}) {
  return render(
    <QuizContainer
      head={<h1>見出し</h1>}
      quiz={makePersonalityQuiz()}
      choicePhrases={choicePhrases}
      resultHeadings={{}}
      readingHeadings={{}}
    />,
  );
}

async function act_(fn: () => void) {
  await act(async () => {
    fn();
  });
}

const advance = (ms: number) => act_(() => vi.advanceTimersByTime(ms));
const start = () =>
  act_(() => screen.getByRole("button", { name: "はじめる" }).click());
const questionNumber = () =>
  screen.getByRole("progressbar").getAttribute("aria-valuenow");

/** 指やマウスで押す（click の detail が 1 で、押した点を持つ）。 */
const pressWithPointer = (name: string) =>
  act_(() =>
    fireEvent.click(screen.getByRole("button", { name }), {
      detail: 1,
      clientX: 100,
      clientY: 300,
    }),
  );

/** 選択肢の名前の字の箱（ボタンか、答えたあとの字）。 */
function faceOf(name: string): HTMLElement {
  const face = screen.getByText(name).closest("li")?.firstElementChild;
  if (!(face instanceof HTMLElement)) throw new Error(`${name} の字が無い`);
  return face;
}

/**
 * フォーカスのある要素で Enter を押す。ブラウザは button の上の Enter で click を起こす（activation behavior）。
 * jsdom はそれを起こさないので、button のときは click も送る。user-event は偽の時計の下で待ちが進まない。
 */
async function pressEnter() {
  const target = document.activeElement ?? document.body;
  await act_(() => {
    fireEvent.keyDown(target, { key: "Enter", code: "Enter" });
    if (target instanceof HTMLButtonElement) target.click();
  });
}

/** 2問目を答えて結果まで進め、記録した答えの並びを返す。 */
async function finish(): Promise<string | null> {
  await act_(() => screen.getByRole("button", { name: "選択2A" }).click());
  await advance(ANSWER_SHOWN_MS);
  return screen.getByTestId("answers").textContent;
}

describe("QuizContainer — 診断の答えを見せるあいだ", () => {
  test("押すと、押した行の字だけが下線を持ち、ほかの行は押せない字になる。150ms 見せてから次の問へ移る", async () => {
    renderQuiz();
    await start();
    await act_(() => screen.getByRole("button", { name: "選択1A" }).click());

    expect(faceOf("選択1A").tagName).toBe("SPAN");
    expect(faceOf("選択1A")).toHaveClass(buttonUnderlineClassName);
    expect(faceOf("選択1A")).toHaveAttribute("data-hit-area", "after");
    for (const other of ["選択1B", "選択1C"]) {
      expect(faceOf(other).tagName).toBe("SPAN");
      expect(faceOf(other)).not.toHaveClass(buttonUnderlineClassName);
      expect(faceOf(other)).not.toHaveAttribute("data-hit-area");
    }
    expect(screen.queryByRole("button", { name: /^選択1/ })).toBeNull();

    await advance(ANSWER_SHOWN_MS - 1);
    expect(questionNumber()).toBe("1");
    await advance(1);
    expect(questionNumber()).toBe("2");
  });

  test("選択肢の字は受け取った文節の区切りで折り、押したあとも同じ区切りで組む", async () => {
    renderQuiz({ c1a: ["選択", "1A"], c1b: ["選択", "1B"] });
    await start();
    const phrasedTextOf = (name: string) => faceOf(name).firstElementChild;

    expect(faceOf("選択1A").tagName).toBe("BUTTON");
    expect(phrasedTextOf("選択1A")?.innerHTML).toBe("選択<wbr>1A");
    expect(phrasedTextOf("選択1B")?.innerHTML).toBe("選択<wbr>1B");
    // 区切りを受け取っていない選択肢は、文の全体を1つの文節として組む。
    expect(phrasedTextOf("選択1C")?.innerHTML).toBe("選択1C");

    await act_(() => screen.getByRole("button", { name: "選択1A" }).click());

    expect(faceOf("選択1A").tagName).toBe("SPAN");
    expect(phrasedTextOf("選択1A")?.innerHTML).toBe("選択<wbr>1A");
    expect(phrasedTextOf("選択1B")?.innerHTML).toBe("選択<wbr>1B");
    expect(phrasedTextOf("選択1C")?.innerHTML).toBe("選択1C");
  });

  test("最後の問でも、150ms 見せてから結果へ移る", async () => {
    renderQuiz();
    await start();
    await act_(() => screen.getByRole("button", { name: "選択1A" }).click());
    await advance(ANSWER_SHOWN_MS);
    await act_(() => screen.getByRole("button", { name: "選択2A" }).click());
    await advance(ANSWER_SHOWN_MS - 1);
    expect(screen.queryByTestId("result-card")).toBeNull();
    await advance(1);
    expect(screen.getByTestId("result-card")).toBeInTheDocument();
  });
});

describe("QuizContainer — 見せるあいだの再入力", () => {
  test("同じ描画の中の2回の click では、答えは最初に押したもの1件だけ", async () => {
    renderQuiz();
    await start();
    const first = screen.getByRole("button", { name: "選択1A" });
    const second = screen.getByRole("button", { name: "選択1B" });
    await act_(() => {
      first.click();
      second.click();
    });
    expect(faceOf("選択1A")).toHaveClass(buttonUnderlineClassName);
    expect(faceOf("選択1B")).not.toHaveClass(buttonUnderlineClassName);

    await advance(ANSWER_SHOWN_MS);
    expect(questionNumber()).toBe("2");
    expect(await finish()).toBe("c1a,c2a");
  });

  test("見せているあいだに別の task で届いた click では、答えは変わらず、進むのは1問だけ", async () => {
    renderQuiz();
    await start();
    await act_(() => screen.getByRole("button", { name: "選択1A" }).click());
    for (const ms of [50, 50]) {
      await advance(ms);
      await act_(() => screen.getByText("選択1B").click());
      expect(faceOf("選択1A")).toHaveClass(buttonUnderlineClassName);
      expect(faceOf("選択1B")).not.toHaveClass(buttonUnderlineClassName);
      expect(faceOf("選択1C")).not.toHaveClass(buttonUnderlineClassName);
      expect(questionNumber()).toBe("1");
    }

    await advance(ANSWER_SHOWN_MS - 100);
    expect(questionNumber()).toBe("2");
    await advance(ANSWER_SHOWN_MS * 2);
    expect(questionNumber()).toBe("2");
    expect(await finish()).toBe("c1a,c2a");
  });

  test("キーボードの Enter の連打では、答えは1件だけ", async () => {
    renderQuiz();
    await start();
    screen.getByRole("button", { name: "選択1B" }).focus();
    await pressEnter();
    // フォーカスは押した行に残り、続く Enter は押せない行に届く。
    expect(document.activeElement).toBe(
      screen.getByText("選択1B").closest("li"),
    );
    await pressEnter();
    await pressEnter();
    expect(faceOf("選択1B")).toHaveClass(buttonUnderlineClassName);

    await advance(ANSWER_SHOWN_MS);
    expect(questionNumber()).toBe("2");
    expect(await finish()).toBe("c1b,c2a");
  });

  test.each([0, 50, 100, 200])(
    "次の問が出てから %ims 後に押した選択肢は、次の問の答えとして受け付ける",
    async (ms) => {
      renderQuiz();
      await start();
      await act_(() => screen.getByRole("button", { name: "選択1A" }).click());
      await advance(ANSWER_SHOWN_MS);
      expect(questionNumber()).toBe("2");

      await advance(ms);
      await act_(() => screen.getByRole("button", { name: "選択2B" }).click());
      expect(faceOf("選択2B")).toHaveClass(buttonUnderlineClassName);
      await advance(ANSWER_SHOWN_MS);
      expect(screen.getByTestId("answers")).toHaveTextContent("c1a,c2b");
    },
  );

  test("見せているあいだに外れても、時計を進めて状態の更新もエラーも起きない", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { unmount } = renderQuiz();
    await start();
    await act_(() => screen.getByRole("button", { name: "選択1A" }).click());
    await advance(50);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    await advance(200);
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("QuizContainer — 「はじめる」の直後の1問目の押し", () => {
  /** いま出ている問の選択肢のうち、押せるボタンのままのものの数。答えると、どの行も字に替わって 0 になる。 */
  const pressableChoiceCount = () =>
    screen.queryAllByRole("button", { name: /^選択/ }).length;

  test("499ms の指やマウスの押しは答えにならず、選んだ形にもならない", async () => {
    renderQuiz();
    await pressWithPointer("はじめる");
    await advance(499);
    await pressWithPointer("選択1A");
    expect(pressableChoiceCount()).toBe(3);
    await advance(ANSWER_SHOWN_MS);
    expect(questionNumber()).toBe("1");
  });

  test("500ms の指やマウスの押しは、すぐ答えになる", async () => {
    renderQuiz();
    await pressWithPointer("はじめる");
    await advance(500);
    await pressWithPointer("選択1A");
    expect(pressableChoiceCount()).toBe(0);
    expect(faceOf("選択1A").tagName).toBe("SPAN");
    await advance(ANSWER_SHOWN_MS);
    expect(questionNumber()).toBe("2");
  });

  test("499ms に選択肢へ落ちた押しは、既定の動き（フォーカスの移り）を止め、500ms では止めない", async () => {
    renderQuiz();
    await pressWithPointer("はじめる");
    const choice = screen.getByRole("button", { name: "選択1A" });
    await advance(499);
    expect(fireEvent.mouseDown(choice, { detail: 1 })).toBe(false);
    await advance(1);
    expect(fireEvent.mouseDown(choice, { detail: 1 })).toBe(true);
  });

  test("500ms より前でも、選択肢の外（問の見出し）へ落ちた押しの既定の動きは止めない", async () => {
    renderQuiz();
    await pressWithPointer("はじめる");
    const heading = screen.getByRole("heading", { level: 2, name: "問1" });
    expect(fireEvent.mouseDown(heading, { detail: 1 })).toBe(true);
  });

  test("受け付けなかった押しのあと、500ms を過ぎて押し直すと答えになる", async () => {
    renderQuiz();
    await pressWithPointer("はじめる");
    await pressWithPointer("選択1A");
    expect(pressableChoiceCount()).toBe(3);
    await advance(500);
    await pressWithPointer("選択1B");
    await advance(ANSWER_SHOWN_MS);
    expect(await finish()).toBe("c1b,c2a");
  });

  test("キーボードの押しは、500ms より前でも答えになる", async () => {
    renderQuiz();
    await pressWithPointer("はじめる");
    screen.getByRole("button", { name: "選択1B" }).focus();
    await pressEnter();
    expect(pressableChoiceCount()).toBe(0);
    expect(faceOf("選択1B").tagName).toBe("SPAN");
    await advance(ANSWER_SHOWN_MS);
    expect(await finish()).toBe("c1b,c2a");
  });

  test("キーボードで「はじめる」を押したあとは、500ms より前の指やマウスの押しも答えになる", async () => {
    renderQuiz();
    await start();
    await pressWithPointer("選択1B");
    expect(pressableChoiceCount()).toBe(0);
    expect(faceOf("選択1B").tagName).toBe("SPAN");
    await advance(ANSWER_SHOWN_MS);
    expect(await finish()).toBe("c1b,c2a");
  });

  test("2問目からは、500ms より前の指やマウスの押しも答えになる", async () => {
    renderQuiz();
    await pressWithPointer("はじめる");
    screen.getByRole("button", { name: "選択1A" }).focus();
    await pressEnter();
    await advance(ANSWER_SHOWN_MS);
    expect(questionNumber()).toBe("2");

    // 2問目を押す時点は「はじめる」から ANSWER_SHOWN_MS で、1問目なら押しを受け付けないあいだにいる。
    expect(ANSWER_SHOWN_MS).toBeLessThan(START_PRESS_GUARD_MS);
    await pressWithPointer("選択2B");
    expect(pressableChoiceCount()).toBe(0);
    await advance(ANSWER_SHOWN_MS);
    expect(screen.getByTestId("answers").textContent).toBe("c1a,c2b");
  });

  test("「もう一度挑戦する」のあとに始め直した1問目でも、500ms より前の押しは答えにならない", async () => {
    renderQuiz();
    await pressWithPointer("はじめる");
    await advance(500);
    await pressWithPointer("選択1A");
    await advance(ANSWER_SHOWN_MS);
    await finish();
    await pressWithPointer("もう一度挑戦する");

    await pressWithPointer("はじめる");
    await pressWithPointer("選択1A");
    expect(pressableChoiceCount()).toBe(3);
    await advance(500);
    await pressWithPointer("選択1B");
    expect(pressableChoiceCount()).toBe(0);
    expect(faceOf("選択1B").tagName).toBe("SPAN");
  });
});
