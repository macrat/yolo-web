/**
 * QuizContainer — 診断の答えと、押した選択肢を見せるあいだの再入力。
 *
 * 押すと答えを記録し、押した選択肢を 150ms 見せてから次の問か結果へ移る。見せているあいだは、押した行の字だけが
 * 押す前と同じ下線を持ち、ほかの行は下線の無い字になって押せない。1つの問に答えは1つで、2打目がどの経路
 * （同じ描画の中の2回の click・別の task で届く click・キーボードの連打）から届いても答えは変わらない
 * （docs/knowledge/input-events-and-guards.md §2 の3経路）。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import QuizContainer, { ANSWER_SHOWN_MS } from "../QuizContainer";
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

// 結果の画面では、記録した答えの並びを見えるようにする（追加の読みものは答えの並びを受け取る）。
vi.mock("../ResultCard", () => ({
  default: ({ extra }: { extra?: React.ReactNode }) => (
    <div data-testid="result-card">{extra}</div>
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

function renderQuiz() {
  return render(
    <QuizContainer
      head={<h1>見出し</h1>}
      quiz={makePersonalityQuiz()}
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
