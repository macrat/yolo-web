/**
 * QuizContainer — 切り替わりのあとの送りと、結果に着いたとき。
 *
 * 来訪者の操作で画面が切り替わったら、QuizContainer が塗る前に、画面ごとに決めた範囲を見せる着地へ即時に送り
 * （DESIGN.md §8・§11）、そのあとフォーカスを移す。
 *  - 次の問が出たときは、問のまとまり（進み具合の帯から最後の選択肢の行まで）を見せる。
 *  - 知識クイズで答えたあとは、押した行と正解の行の上のほうから「次へ」までを見せる。診断で押した行を見せるあいだは送らない。
 *  - 解き終えたら、結果のボックスの上端を画面の上端から 8px に置き、ボックスにフォーカスを移す。
 *  - 問の区画は、1回解くあいだ、それまでのいちばん高い区画より低くならない。
 *  - 字の読み込みで高さが変わり、見せている範囲が画面から外れたら、来訪者が自分で送っていなければ送り直す。
 * jsdom は組みを持たないので、要素の矩形を差し替えて送りの量を確かめる。塗る前であることは実ブラウザで確かめる。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import QuizContainer, { ANSWER_SHOWN_MS } from "../QuizContainer";
import type { ItemListItem } from "@/components/ItemList";
import type {
  QuizDefinition,
  QuizMeta,
  QuizQuestion,
  QuizResult,
} from "../../types";

// gtag をモックして window.gtag に差し替える。analytics.ts は window.gtag を
// 直接呼ぶので、ここで spy を仕込むことで送出 payload を検査できる。
// 診断は押した選択肢を見せてから次の問か結果へ移るので、偽の時計で見せる長さを進める。
// 画面は高さ 600 で、送りの関数（window.scrollBy）を観察する。
const gtagSpy = vi.fn();
let scrollBySpy: ReturnType<typeof vi.fn>;
beforeEach(() => {
  gtagSpy.mockClear();
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
  vi.useFakeTimers();
  scrollBySpy = vi.fn();
  vi.stubGlobal("scrollBy", scrollBySpy);
  vi.stubGlobal("visualViewport", undefined);
  vi.stubGlobal("innerHeight", 600);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// Panel / Button は軽量モックでテスト集中対象を絞る
vi.mock("@/components/Panel", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@/components/Button", () => ({
  buttonFaceBoxClassName: "faceBox",
  buttonUnderlineClassName: "underline",
  default: ({
    children,
    onClick,
    ref,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    ref?: React.Ref<HTMLButtonElement>;
  }) => (
    <button type="button" onClick={onClick} ref={ref}>
      {children}
    </button>
  ),
}));

// ResultCard は、ページの頭・結果の名前で名付けた結果のボックスにあたる要素・「もう一度挑戦する」・追加の読みものだけを
// 描く軽い形にし、受け取った値を属性で見せる。
vi.mock("../ResultCard", () => ({
  default: ({
    head,
    resultBoxRef,
    heading,
    appear,
    extra,
    nextItems,
    onRetry,
  }: {
    head: React.ReactNode;
    resultBoxRef: React.Ref<HTMLElement>;
    heading: { phrases: string[] };
    appear?: boolean;
    extra?: React.ReactNode;
    nextItems?: unknown[];
    onRetry: () => void;
  }) => (
    <>
      {head}
      <section
        ref={resultBoxRef}
        tabIndex={-1}
        aria-labelledby="result-name"
        data-testid="result-box"
        data-phrases={heading.phrases.join("|")}
        data-appear={String(Boolean(appear))}
        data-next-items={String(nextItems?.length ?? 0)}
      >
        <h2 id="result-name">{heading.phrases.join("")}</h2>
      </section>
      <button type="button" onClick={onRetry}>
        もう一度挑戦する
      </button>
      {extra}
    </>
  ),
}));
// 追加の読みものは japanese-culture だけが持つことにし、置かれた所を見えるようにする。
vi.mock("../ResultExtraLoader", () => ({
  default: ({ slug }: { slug: string }) => (
    <div data-testid="result-extra" data-slug={slug} />
  ),
  hasResultExtra: (slug: string) => slug === "japanese-culture",
}));

// next/link を最低限の <a> に
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

/** 最小 personality quiz（type === "personality"）を組み立てる */
function makePersonalityQuiz(questionCount = 1): QuizDefinition {
  const meta: QuizMeta = {
    slug: "character-personality",
    title: "似たキャラ診断",
    type: "personality",
    description: "テスト",
    questionCount,
  } as QuizMeta;
  const questions = Array.from(
    { length: questionCount },
    (_, index): QuizQuestion => ({
      id: `q${index + 1}`,
      text: `問${index + 1}`,
      choices: [
        { id: `c${index + 1}a`, text: "選択1", points: { "type-a": 1 } },
        { id: `c${index + 1}b`, text: "選択2", points: { "type-b": 1 } },
      ],
    }),
  );
  const results: QuizResult[] = [
    { id: "type-a", title: "タイプA", description: "A" },
    { id: "type-b", title: "タイプB", description: "B" },
  ];
  return { meta, questions, results };
}

/** 最小 knowledge quiz（type === "knowledge"）を組み立てる */
function makeKnowledgeQuiz(questionCount = 1): QuizDefinition {
  const meta: QuizMeta = {
    slug: "yoji-level",
    title: "四字熟語レベル",
    type: "knowledge",
    description: "テスト",
    questionCount,
  } as QuizMeta;
  const questions = Array.from(
    { length: questionCount },
    (_, index): QuizQuestion => ({
      id: `q${index + 1}`,
      text: `問${index + 1}`,
      choices: [
        { id: `c${index + 1}a`, text: "正解", isCorrect: true },
        { id: `c${index + 1}b`, text: "不正解", isCorrect: false },
      ],
      explanation: `解説${index + 1}`,
    }),
  );
  const results: QuizResult[] = [
    { id: "lv-1", title: "Level 1", description: "L1" },
  ];
  return { meta, questions, results };
}

function renderQuiz(
  quiz: QuizDefinition,
  recommendedContents?: ItemListItem[],
): void {
  const resultHeadings = Object.fromEntries(
    quiz.results.map((result) => [result.id, { phrases: [...result.title] }]),
  );
  render(
    <QuizContainer
      head={<h1>見出し</h1>}
      quiz={quiz}
      resultHeadings={resultHeadings}
      readingHeadings={{}}
      recommendedContents={recommendedContents}
    />,
  );
}

async function click(element: HTMLElement): Promise<void> {
  await act(async () => {
    element.click();
  });
}

async function advance(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

/** 選択肢のボタンのうち、名前が name のもの。 */
function choiceButton(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

/** quiz をプレイして結果まで遷移する（level_end 発火まで待つ） */
async function playToLevelEnd(
  quiz: QuizDefinition,
  recommendedContents?: ItemListItem[],
) {
  renderQuiz(quiz, recommendedContents);
  await click(screen.getByRole("button", { name: "はじめる" }));
  // 診断は押した選択肢を見せたあとに、knowledge は手動の「次へ」で結果へ移る
  await click(
    choiceButton(quiz.meta.type === "personality" ? "選択1" : "正解"),
  );
  if (quiz.meta.type === "personality") await advance(ANSWER_SHOWN_MS);
  if (quiz.meta.type === "knowledge") {
    await click(screen.getByRole("button", { name: "次へ" }));
  }
  const levelEndCalls = gtagSpy.mock.calls.filter((c) => c[1] === "level_end");
  expect(levelEndCalls.length).toBeGreaterThan(0);
}

function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    left: 0,
    right: 0,
    width: 0,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

/**
 * 要素の矩形を差し替える。rectOf が返さない要素（小さいビューポートを読む見えない箱を含む）は大きさ 0 で、
 * 画面の範囲は innerHeight（600）になる。押せるものも大きさ 0 なので、着地で避けるものは無い。
 */
function stubRects(rectOf: (element: Element) => DOMRect | undefined): void {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      return rectOf(this) ?? rect(0, 0);
    },
  );
}

/** 問の区画（進み具合の帯と問を縦に並べた要素）。 */
function stageOf(): Element | null | undefined {
  return document.querySelector("ul")?.parentElement?.parentElement;
}

/** 区画の上端と、問の最後の行の下端（＝問の中身の下端）を決める。 */
function stubQuestion(stageTop: number, choicesBottom: number): void {
  stubRects((element) => {
    const stage = stageOf();
    if (element === stage) return rect(stageTop, choicesBottom);
    if (element.tagName === "UL") return rect(stageTop + 100, choicesBottom);
    // 区画の最後の子（問）の下端。
    if (element === stage?.lastElementChild) {
      return rect(stageTop + 40, choicesBottom);
    }
    return undefined;
  });
}

describe("QuizContainer — 問のまとまりの送り", () => {
  test("「はじめる」のあと、下に外れたまとまりの最後の行の下端を画面の下端から 8px 上まで送る", async () => {
    renderQuiz(makePersonalityQuiz(2));
    stubQuestion(300, 700);
    await click(screen.getByRole("button", { name: "はじめる" }));
    expect(scrollBySpy).toHaveBeenCalledTimes(1);
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: 700 - (600 - 8),
      behavior: "instant",
    });
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 2, name: "問1" }),
    );
  });

  test("まとまりが画面に入っていれば送らない", async () => {
    renderQuiz(makePersonalityQuiz(2));
    stubQuestion(100, 500);
    await click(screen.getByRole("button", { name: "はじめる" }));
    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  test("診断で押した行を見せるあいだは送らず、150ms のあと次の問の上に外れたまとまりの帯を画面の上端から 8px に置く", async () => {
    renderQuiz(makePersonalityQuiz(2));
    stubQuestion(100, 500);
    await click(screen.getByRole("button", { name: "はじめる" }));
    stubQuestion(-60, 340);
    await click(choiceButton("選択1"));
    expect(scrollBySpy).not.toHaveBeenCalled();
    await advance(ANSWER_SHOWN_MS);
    expect(scrollBySpy).toHaveBeenCalledTimes(1);
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: -60 - 8,
      behavior: "instant",
    });
  });

  test("まとまりが画面より高ければ、帯を画面の上端から 8px に置く", async () => {
    renderQuiz(makePersonalityQuiz(2));
    stubQuestion(300, 1000);
    await click(screen.getByRole("button", { name: "はじめる" }));
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: 300 - 8,
      behavior: "instant",
    });
  });

  test("知識クイズで答えたあと、押した行と正解の行の上のほうから「次へ」までを見せ、フォーカスは押した行にある", async () => {
    renderQuiz(makeKnowledgeQuiz(2));
    stubQuestion(100, 500);
    await click(screen.getByRole("button", { name: "はじめる" }));
    stubRects((element) => {
      const name = element.textContent ?? "";
      if (element.tagName === "LI" && name.startsWith("正解")) {
        return rect(260, 330);
      }
      if (element.tagName === "LI" && name.startsWith("不正解")) {
        return rect(330, 400);
      }
      if (element.tagName === "BUTTON" && name === "次へ") {
        return rect(640, 684);
      }
      return undefined;
    });
    await click(choiceButton("不正解"));
    expect(scrollBySpy).toHaveBeenCalledTimes(1);
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: 684 - (600 - 8),
      behavior: "instant",
    });
    expect(document.activeElement).toBe(
      screen.getByText("不正解").closest("li"),
    );
  });
});

describe("QuizContainer — 問の区画を低くしない", () => {
  test("短い問に移っても、区画の最小の高さはそれまでのいちばん高い区画に保たれる", async () => {
    renderQuiz(makePersonalityQuiz(3));
    stubQuestion(100, 520);
    await click(screen.getByRole("button", { name: "はじめる" }));
    const stage = stageOf() as HTMLElement;
    expect(stage.style.minHeight).toBe("420px");

    stubQuestion(100, 400);
    await click(choiceButton("選択1"));
    await advance(ANSWER_SHOWN_MS);
    expect(stage.style.minHeight).toBe("420px");

    stubQuestion(100, 600);
    await click(choiceButton("選択1"));
    await advance(ANSWER_SHOWN_MS);
    expect(stage.style.minHeight).toBe("500px");
  });

  test("区画の幅が変わったら、そのときの高さからやり直す", async () => {
    renderQuiz(makePersonalityQuiz(2));
    stubQuestion(100, 520);
    await click(screen.getByRole("button", { name: "はじめる" }));
    const stage = stageOf() as HTMLElement;
    expect(stage.style.minHeight).toBe("420px");

    stubQuestion(100, 400);
    vi.spyOn(stage, "clientWidth", "get").mockReturnValue(320);
    fireEvent(window, new Event("resize"));
    expect(stage.style.minHeight).toBe("300px");
  });
});

describe("QuizContainer — 字の読み込みのあとの送り直し", () => {
  let fonts: EventTarget;
  beforeEach(() => {
    fonts = new EventTarget();
    Object.defineProperty(document, "fonts", {
      value: fonts,
      configurable: true,
    });
  });
  afterEach(() => {
    Reflect.deleteProperty(document, "fonts");
  });

  test("問を出したあと字の読み込みで高さが変わり、まとまりが画面から外れたら送り直す", async () => {
    renderQuiz(makePersonalityQuiz(2));
    stubQuestion(100, 500);
    await click(screen.getByRole("button", { name: "はじめる" }));
    expect(scrollBySpy).not.toHaveBeenCalled();

    stubQuestion(100, 640);
    fonts.dispatchEvent(new Event("loadingdone"));
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: 640 - (600 - 8),
      behavior: "instant",
    });
  });

  test("来訪者が自分で送ったあとは、送り直さない", async () => {
    renderQuiz(makePersonalityQuiz(2));
    stubQuestion(100, 500);
    await click(screen.getByRole("button", { name: "はじめる" }));

    fireEvent.wheel(window);
    stubQuestion(100, 640);
    fonts.dispatchEvent(new Event("loadingdone"));
    expect(scrollBySpy).not.toHaveBeenCalled();
  });
});

describe("QuizContainer — 押した点の真下を避ける着地", () => {
  // ページは高さ 3000 で 1000 まで送ってあり、上にも下にも送れる。押したものは幅 300 の矩形で、押した点は
  // click の座標（detail が 1）で渡す。
  beforeEach(() => {
    vi.stubGlobal("scrollY", 1000);
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 3000,
    });
  });
  afterEach(() => {
    Reflect.deleteProperty(document.documentElement, "scrollHeight");
  });

  function pressable(top: number, bottom: number): DOMRect {
    return { ...rect(top, bottom), right: 300, width: 300 } as DOMRect;
  }

  /** 画面に入る問のまとまり（区画 300〜560）と、点の高さ 500 の真下に来る最初の選択肢（480〜524）。 */
  function stubQuestionUnderPoint(): void {
    stubRects((element) => {
      const stage = stageOf();
      if (element === stage) return rect(300, 560);
      if (element.tagName === "UL") return rect(340, 560);
      if (element === stage?.lastElementChild) return rect(320, 560);
      if (element.tagName === "BUTTON" && element.textContent === "選択1") {
        return pressable(480, 524);
      }
      if (element.tagName === "BUTTON" && element.textContent === "選択2") {
        return pressable(525, 569);
      }
      return undefined;
    });
  }

  async function pressAt(element: HTMLElement, y: number): Promise<void> {
    await act(async () => {
      fireEvent.click(element, { detail: 1, clientX: 100, clientY: y });
    });
  }

  async function pressWithKeyboard(element: HTMLElement): Promise<void> {
    await act(async () => {
      fireEvent.click(element, { detail: 0 });
    });
  }

  test("「はじめる」の点の真下に1問目の選択肢が来るときは、選択肢の外へずらす（まだ読んでいない問に答えを入れない）", async () => {
    renderQuiz(makePersonalityQuiz(2));
    stubQuestionUnderPoint();
    await pressAt(screen.getByRole("button", { name: "はじめる" }), 500);
    // 基準は送らない（まとまりは画面に入っている）。点 500 が選択肢の上端 480 より上に出る、いちばん近い送り。
    expect(scrollBySpy).toHaveBeenCalledTimes(1);
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: -21,
      behavior: "instant",
    });
  });

  test("診断の答えのあとは、点の真下に次の問の選択肢が来ても送らない（問ごとに選択肢の位置を動かさない）", async () => {
    renderQuiz(makePersonalityQuiz(2));
    stubQuestionUnderPoint();
    await pressWithKeyboard(screen.getByRole("button", { name: "はじめる" }));
    await pressAt(choiceButton("選択1"), 500);
    await advance(ANSWER_SHOWN_MS);
    expect(screen.getByRole("heading", { level: 2, name: "問2" })).toBe(
      document.activeElement,
    );
    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  test("知識クイズの「次へ」の点の真下に次の問の選択肢が来るときは、選択肢の外へずらす（まだ読んでいない問に答えを入れない）", async () => {
    renderQuiz(makeKnowledgeQuiz(2));
    await pressWithKeyboard(screen.getByRole("button", { name: "はじめる" }));
    await pressWithKeyboard(choiceButton("正解"));
    scrollBySpy.mockClear();

    // 2問目のまとまりは画面に入り、点 500 の真下に最初の選択肢（480〜524）が来る。
    stubRects((element) => {
      const stage = stageOf();
      if (element === stage) return rect(300, 560);
      if (element.tagName === "UL") return rect(340, 560);
      if (element === stage?.lastElementChild) return rect(320, 560);
      if (element.tagName === "BUTTON" && element.textContent === "正解") {
        return pressable(480, 524);
      }
      if (element.tagName === "BUTTON" && element.textContent === "不正解") {
        return pressable(525, 569);
      }
      return undefined;
    });
    await pressAt(screen.getByRole("button", { name: "次へ" }), 500);
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    );
    // 基準は送らない。点 500 が選択肢の上端 480 より上に出る、いちばん近い送り。
    expect(scrollBySpy).toHaveBeenCalledTimes(1);
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: -21,
      behavior: "instant",
    });
  });

  test("知識クイズで答えたあと、基準の送りで点の真下に「次へ」が来るときは、「次へ」を点から遠ざける（解説を読ませずに次の問へ進めない）", async () => {
    renderQuiz(makeKnowledgeQuiz(2));
    await pressWithKeyboard(screen.getByRole("button", { name: "はじめる" }));

    // 答えたあとのまとまり（正解の行の上端 260 から「次へ」の下端 684）は下に外れ、基準の送り 92 で「次へ」は
    // 548〜592 に来て、点 560 の真下になる。
    stubRects((element) => {
      const name = element.textContent ?? "";
      if (element.tagName === "LI" && name.startsWith("正解")) {
        return rect(260, 330);
      }
      if (element.tagName === "LI" && name.startsWith("不正解")) {
        return rect(330, 400);
      }
      if (element.tagName === "BUTTON" && name === "次へ") {
        return pressable(640, 684);
      }
      return undefined;
    });
    await pressAt(choiceButton("不正解"), 560);
    // 範囲（92〜252）の中で、「次へ」の下端が点から 100 離れる、基準にいちばん近い送り（684 − s が 460 以下）。
    expect(scrollBySpy).toHaveBeenCalledTimes(1);
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: 224,
      behavior: "instant",
    });
  });

  test("「もう一度挑戦する」のあとは、点の真下に「はじめる」が来ても避けず、ページの頭から見せる", async () => {
    renderQuiz(makePersonalityQuiz(1));
    await pressWithKeyboard(screen.getByRole("button", { name: "はじめる" }));
    await pressWithKeyboard(choiceButton("選択1"));
    await advance(ANSWER_SHOWN_MS);
    scrollBySpy.mockClear();

    // 開始の画面の事実の行と「はじめる」は、ページの頭から 300・456〜500 の所にある（画面の上端から測ると、送った
    // 1000 だけ上）。頭へ戻すと、点 480 の真下に「はじめる」が来る。
    stubRects((element) => {
      if (element.tagName === "P" && element.textContent?.includes("全1問")) {
        return rect(300 - 1000, 320 - 1000);
      }
      if (element.tagName === "BUTTON" && element.textContent === "はじめる") {
        return pressable(456 - 1000, 500 - 1000);
      }
      return undefined;
    });
    await pressAt(
      screen.getByRole("button", { name: "もう一度挑戦する" }),
      480,
    );
    expect(scrollBySpy).toHaveBeenCalledTimes(1);
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: -1000,
      behavior: "instant",
    });
  });
});

describe("QuizContainer — 結果に着いたとき", () => {
  test("結果のボックスの上端を画面の上端から 8px に置く量で送り、ボックスにフォーカスを移す", async () => {
    stubRects((element) => {
      if (element.getAttribute("data-testid") === "result-box") {
        return rect(900, 1500);
      }
      if (element.id === "result-name") return rect(940, 1000);
      return undefined;
    });
    await playToLevelEnd(makePersonalityQuiz());
    const box = screen.getByTestId("result-box");
    expect(scrollBySpy).toHaveBeenCalledTimes(1);
    expect(scrollBySpy).toHaveBeenCalledWith({
      top: 900 - 8,
      behavior: "instant",
    });
    expect(document.activeElement).toBe(box);
  });

  test("結果のボックスに登場の動きと、その結果の見出しの区切りを渡す", async () => {
    await playToLevelEnd(makePersonalityQuiz());
    const box = screen.getByTestId("result-box");
    expect(box).toHaveAttribute("data-appear", "true");
    expect(["タ|イ|プ|A", "タ|イ|プ|B"]).toContain(
      box.getAttribute("data-phrases"),
    );
  });

  test("知識クイズでも、最後の「次へ」のあと結果のボックスへ送ってフォーカスを移す", async () => {
    stubRects((element) => {
      if (element.getAttribute("data-testid") === "result-box") {
        return rect(700, 1000);
      }
      if (element.id === "result-name") return rect(740, 800);
      return undefined;
    });
    await playToLevelEnd(makeKnowledgeQuiz());
    const box = screen.getByTestId("result-box");
    expect(box).toHaveAttribute("data-phrases", "L|e|v|e|l| |1");
    expect(scrollBySpy).toHaveBeenLastCalledWith({
      top: 700 - 8,
      behavior: "instant",
    });
    expect(document.activeElement).toBe(box);
  });

  test("解き終えた画面にも、ページの頭と次の遊びの行を渡す", async () => {
    await playToLevelEnd(makePersonalityQuiz(), [
      { name: "次の遊び", href: "/play/next" },
    ]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "見出し",
    );
    expect(screen.getByTestId("result-box")).toHaveAttribute(
      "data-next-items",
      "1",
    );
  });

  test("追加の読みものは、それを持つ診断だけに渡す", async () => {
    await playToLevelEnd(makePersonalityQuiz());
    expect(screen.queryByTestId("result-extra")).not.toBeInTheDocument();
  });

  test("追加の読みものを持つ診断では、その診断の追加の読みものを渡す", async () => {
    const quiz = makePersonalityQuiz();
    await playToLevelEnd({
      ...quiz,
      meta: { ...quiz.meta, slug: "japanese-culture" },
    });
    expect(screen.getByTestId("result-extra")).toHaveAttribute(
      "data-slug",
      "japanese-culture",
    );
  });
});
