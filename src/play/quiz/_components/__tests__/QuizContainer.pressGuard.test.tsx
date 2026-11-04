/**
 * QuizContainer — 二度押しの2打目を受けない守り（docs/cycles/cycle-316/t5a-design.md 4-9）。
 *
 * 押した点の下が入れ替わる操作のあと、新しく出た画面を読む前の、1打目の点の近くへの押しは受けない。
 *  - 窓の守り（「はじめる」→1問目・知識クイズの「次へ」→次の問・最後の答えか最後の「次へ」→結果）: 起点から押し下げが
 *    700ms 未満で、起点の点から直線で 100px 以下のポインタの押し。
 *  - 連続の押しの守り（診断の答え→次の問）: 同じ範囲のうち、連続の押し。マウスは mousedown の detail >= 2、タッチと
 *    ペンは直前の押し（起点か、受けなかった押し）の離しから 300ms 未満の押し下げ。
 * 時刻と座標は pointerdown で取り、受けないと決めた押しは mousedown と click の両方を止める。診断の答えを見せる間に
 * 押し下げ、切り替わったあとに離す押しも、押し下げの時刻と座標で同じく決める。主のボタンでない押しと主でない指の
 * 押しは、守りに掛けない。
 *
 * 事象は、ブラウザが送る順と値で組む。pointerdown の detail はいつも 0 で、マウスの連続の数は mousedown と click の
 * detail だけが持つ。互換のマウスの事象（mousedown）は、マウスと hover を持つペン（W3C Pointer Events の互換の
 * マウスの事象の対応付け）では pointerdown のすぐあとに、タッチでは離したあとにまとめて出る。hover を持たないペン
 * （iPad のペンの見込み）はタッチの順で組む。指の速い二度押しでは、2打目の pointerdown が、2打目がすぐ離れると
 * 2打目の pointerup まで、1打目の mousedown と click より先に届く。マウスと hover を持つペンは、押し下げた的が離すまでに DOM から外れると click を出さない。
 * 番号は Chromium の値で、マウスはいつも 1、ペンは押しを分けてもいつも 2、タッチは押しごとに 3 から増える。2本の指で
 * 触れた押しは pointerdown と pointerup だけを出す。互換の事象の点は、タッチの調整で押せるものへ寄せた点で、押しの
 * 点から縦と横のそれぞれで 16px までずれる。mousedown は番号を持たない MouseEvent で、click の形はブラウザで違う
 * （CLICK_FORMS）。押しと互換の事象を結ぶ所は、主な試験を click の3つの形のどれでも回す。事象の時刻（timeStamp）は、
 * 押しごとに決めた値に差し替える。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { closestPressable, revealLanding } from "@/lib/reveal";
import { COMPAT_EVENTS_WAIT_MS } from "@/play/quiz/pressGuard";
import QuizContainer, { ANSWER_SHOWN_MS } from "../QuizContainer";
import { questionPhrases } from "../../questionPhrases";
import type {
  QuizDefinition,
  QuizMeta,
  QuizQuestion,
  QuizResult,
} from "../../types";

type PointerKind = "mouse" | "touch" | "pen";

/**
 * ポインタの押しが出す click の形。
 *  - chromium: 押しの pointerType と pointerId を持つ PointerEvent。
 *  - untyped: 番号を持たない MouseEvent（click を PointerEvent にする前のブラウザ。Safari は 18.2 より前）。
 *  - webkit: タッチとペンの押しでも pointerType が "mouse" で、番号が押しと合わない PointerEvent（Safari 18.2 からの
 *    WebKit Bug 282988。番号はマウスの 1 と見込む）。
 */
type ClickForm = "chromium" | "untyped" | "webkit";

const CLICK_FORMS = [
  { name: "押しの番号を持つ PointerEvent（Chromium）", form: "chromium" },
  { name: "番号を持たない MouseEvent", form: "untyped" },
  {
    name: 'pointerType が "mouse" の PointerEvent（WebKit）',
    form: "webkit",
  },
] as const satisfies readonly { name: string; form: ClickForm }[];

/** マウスの押しの pointerId。WebKit がタッチの click に付ける番号の見込みでもある。 */
const MOUSE_POINTER_ID = 1;
/**
 * ペンの押しの pointerId（Chromium の hover を持つペン。押しを分けても変わらない）。hover を持たないペンの番号は
 * 確かめられていないので、同じ番号で組む。
 */
const PEN_POINTER_ID = 2;

let clickForm: ClickForm;
/** いちばん新しく付けたタッチの押しの番号。 */
let lastTouchPointerId: number;
/** いちばん新しく押し下げた押しの番号（release が、押し下げと同じ番号で離す）。 */
let pressedPointerId: number;

const gtagSpy = vi.fn();
beforeEach(() => {
  gtagSpy.mockClear();
  vi.mocked(revealLanding).mockClear();
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
  vi.useFakeTimers();
  vi.stubGlobal("scrollBy", vi.fn());
  clickForm = "chromium";
  lastTouchPointerId = PEN_POINTER_ID;
  pressedPointerId = MOUSE_POINTER_ID;
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** click の3つの形で回す describe の中で、その形を使う。 */
function useClickForm(form: ClickForm): void {
  beforeEach(() => {
    clickForm = form;
  });
}

/** 新しい押しの pointerId。 */
function newPointerId(pointerType: PointerKind): number {
  if (pointerType === "mouse") return MOUSE_POINTER_ID;
  if (pointerType === "pen") return PEN_POINTER_ID;
  lastTouchPointerId += 1;
  return lastTouchPointerId;
}

// 着地に渡す押した点を見るため、着地の送りを、もとの働きのまま呼ばれたかを覚える形にする。
vi.mock("@/lib/reveal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/reveal")>();
  return { ...actual, revealLanding: vi.fn(actual.revealLanding) };
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

/** 押しの機器。 */
interface PressInput {
  pointerType?: PointerKind;
  /**
   * 互換の mousedown を出す時。"down" は pointerdown のすぐあと、"up" は pointerup のあと。既定は、マウスが
   * "down"、タッチとペンが "up"。hover を持つペンは "down" を指定する。
   */
  mouseDownAt?: "down" | "up";
}

interface PressPoint extends PressInput {
  x?: number;
  y?: number;
  /** mousedown と click の detail（マウスの連続の数）。既定は 1。 */
  detail?: number;
  /**
   * 離したあとに出る互換の事象（mousedown・mouseup・click）の点。タッチの調整で押せるものへ寄せた点を組むときに
   * 指定する。既定は離しの点。
   */
  compatPoint?: { x: number; y: number };
}

/** タッチと2つの順のペン。守りはどれも同じ決まり（離しからの連続）で数える。 */
const TOUCH_LIKE_INPUTS = [
  { name: "touch", input: { pointerType: "touch" } },
  { name: "pen（離したあとに mousedown）", input: { pointerType: "pen" } },
  {
    name: "pen（押し下げのすぐあとに mousedown）",
    input: { pointerType: "pen", mouseDownAt: "down" },
  },
] as const satisfies readonly { name: string; input: PressInput }[];

/** TOUCH_LIKE_INPUTS のうち、離したあとに mousedown を出す機器。 */
const MOUSE_DOWN_AT_RELEASE_INPUTS = TOUCH_LIKE_INPUTS.filter(
  ({ input }) => mouseDownAtOf(input) === "up",
);

/** mousedown を押し下げのすぐあとに出す機器（マウスと hover を持つペン）。 */
const MOUSE_DOWN_AT_PRESS_INPUTS = [
  { name: "mouse", input: { pointerType: "mouse" } },
  ...TOUCH_LIKE_INPUTS.filter(({ input }) => mouseDownAtOf(input) === "down"),
] as const satisfies readonly { name: string; input: PressInput }[];

function mouseDownAtOf(input: PressInput): "down" | "up" {
  return (
    input.mouseDownAt ??
    ((input.pointerType ?? "mouse") === "mouse" ? "down" : "up")
  );
}

interface PressOptions extends PressPoint {
  /** 押し下げの時刻。 */
  down: number;
  /** 離しの時刻。既定は押し下げの 50ms あと。 */
  up?: number;
}

interface PressOutcome {
  mouseDownPrevented: boolean;
  clickPrevented: boolean;
  /** 文書の受け手（バブルの段階）に click が届いたか。 */
  clickReachedDocument: boolean;
}

function coordinatesOf({ x = 100, y = 500 }: PressPoint): MouseEventInit {
  return { bubbles: true, cancelable: true, clientX: x, clientY: y };
}

function pointerOf(point: PressPoint, pointerId: number): PointerEventInit {
  return {
    ...coordinatesOf(point),
    pointerType: point.pointerType ?? "mouse",
    pointerId,
    isPrimary: true,
    detail: 0,
  };
}

/** pointerType・pointerId の押しが出す、いまの形（clickForm）の click。 */
function clickOf(
  init: MouseEventInit,
  pointerType: PointerKind,
  pointerId: number,
): MouseEvent {
  switch (clickForm) {
    case "chromium":
      return new PointerEvent("click", { ...init, pointerType, pointerId });
    case "untyped":
      return new MouseEvent("click", init);
    case "webkit":
      return new PointerEvent("click", {
        ...init,
        pointerType: "mouse",
        pointerId: MOUSE_POINTER_ID,
      });
  }
}

/**
 * 押しの前半（押し下げ）を、新しい番号の押しとして送る。mousedown を押し下げのすぐあとに出す機器（マウスと hover を
 * 持つペン）は pointerdown → mousedown、ほかは pointerdown だけ。ここで送った mousedown が止められたかを返す（送ら
 * なければ null）。
 */
async function pressDown(
  target: Element,
  point: PressPoint & { down: number },
): Promise<boolean | null> {
  pressedPointerId = newPointerId(point.pointerType ?? "mouse");
  const mouseDown =
    mouseDownAtOf(point) === "down"
      ? at(
          new MouseEvent("mousedown", {
            ...coordinatesOf(point),
            detail: point.detail ?? 1,
          }),
          point.down,
        )
      : null;
  await act(async () => {
    target.dispatchEvent(
      at(
        new PointerEvent("pointerdown", pointerOf(point, pressedPointerId)),
        point.down,
      ),
    );
    if (mouseDown) target.dispatchEvent(mouseDown);
  });
  return mouseDown?.defaultPrevented ?? null;
}

/**
 * いちばん新しく押し下げた押しの後半（離し）を送る。mousedown を押し下げのすぐあとに出す機器は pointerup → mouseup →
 * click、離したあとに出す機器（タッチと hover を持たないペン）は pointerup → mousedown → mouseup → click。ここで
 * 送った mousedown が止められたか（送らなければ null）と、click が止められたかを返す。
 */
async function release(
  target: Element,
  point: PressPoint & { up: number },
): Promise<{
  mouseDownPrevented: boolean | null;
  clickPrevented: boolean;
  clickReachedDocument: boolean;
}> {
  const coordinates = coordinatesOf(point.compatPoint ?? point);
  const detail = point.detail ?? 1;
  const mouseDown =
    mouseDownAtOf(point) === "up"
      ? at(new MouseEvent("mousedown", { ...coordinates, detail }), point.up)
      : null;
  const click = at(
    clickOf(
      { ...coordinates, detail },
      point.pointerType ?? "mouse",
      pressedPointerId,
    ),
    point.up,
  );
  let clickReachedDocument = false;
  const noteClick = (): void => {
    clickReachedDocument = true;
  };
  document.addEventListener("click", noteClick);
  await act(async () => {
    target.dispatchEvent(
      at(
        new PointerEvent("pointerup", pointerOf(point, pressedPointerId)),
        point.up,
      ),
    );
    if (mouseDown) target.dispatchEvent(mouseDown);
    target.dispatchEvent(
      at(new MouseEvent("mouseup", { ...coordinates, detail }), point.up),
    );
    target.dispatchEvent(click);
  });
  document.removeEventListener("click", noteClick);
  return {
    mouseDownPrevented: mouseDown?.defaultPrevented ?? null,
    clickPrevented: click.defaultPrevented,
    clickReachedDocument,
  };
}

/**
 * mousedown を押し下げのすぐあとに出す機器（マウスと hover を持つペン）の、押し下げた的が離すまでに DOM から外れた
 * 押しの離しを送る。Chromium は pointerup と mouseup だけを出し、click を出さない。
 */
async function releaseWithoutClick(
  target: Element,
  point: PressPoint & { up: number },
): Promise<void> {
  await act(async () => {
    target.dispatchEvent(
      at(
        new PointerEvent("pointerup", pointerOf(point, pressedPointerId)),
        point.up,
      ),
    );
    target.dispatchEvent(
      at(
        new MouseEvent("mouseup", {
          ...coordinatesOf(point),
          detail: point.detail ?? 1,
        }),
        point.up,
      ),
    );
  });
}

/** ポインタの1つの押しを、同じ的の上で、ブラウザの順で送る（pressDown と release）。 */
async function press(
  target: Element,
  options: PressOptions,
): Promise<PressOutcome> {
  const { down, up = down + 50, ...point } = options;
  const mouseDownAtDown = await pressDown(target, { ...point, down });
  const released = await release(target, { ...point, up });
  return {
    mouseDownPrevented: mouseDownAtDown ?? released.mouseDownPrevented ?? false,
    clickPrevented: released.clickPrevented,
    clickReachedDocument: released.clickReachedDocument,
  };
}

/** 離しても互換の事象（mousedown・mouseup・click）を出さない指の押し（2本の指で触れた押し・iOS の Safari の押せない字へのタップ）。 */
async function tapWithoutCompatEvents(
  target: Element,
  options: PressOptions,
): Promise<void> {
  const { down, up = down + 50, ...point } = options;
  const finger = { ...point, pointerType: "touch" as const };
  const pointerId = newPointerId("touch");
  await act(async () => {
    target.dispatchEvent(
      at(new PointerEvent("pointerdown", pointerOf(finger, pointerId)), down),
    );
    target.dispatchEvent(
      at(new PointerEvent("pointerup", pointerOf(finger, pointerId)), up),
    );
  });
}

/**
 * マウスの右ボタンの押し。pointerdown → mousedown → pointerup → mouseup → contextmenu で、click は出さない。送った
 * mousedown と contextmenu を返す。
 */
async function pressWithRightButton(
  target: Element,
  { down, up = down + 50, ...point }: PressOptions,
): Promise<{ mouseDown: MouseEvent; contextMenu: MouseEvent }> {
  const coordinates = { ...coordinatesOf(point), button: 2 };
  const mouse = { ...pointerOf(point, MOUSE_POINTER_ID), button: 2 };
  const mouseDown = at(
    new MouseEvent("mousedown", { ...coordinates, detail: 1 }),
    down,
  );
  const contextMenu = new MouseEvent("contextmenu", coordinates);
  await act(async () => {
    target.dispatchEvent(at(new PointerEvent("pointerdown", mouse), down));
    target.dispatchEvent(mouseDown);
    target.dispatchEvent(at(new PointerEvent("pointerup", mouse), up));
    target.dispatchEvent(at(new MouseEvent("mouseup", coordinates), up));
    target.dispatchEvent(contextMenu);
  });
  return { mouseDown, contextMenu };
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

describe.each(CLICK_FORMS)("click が $name", ({ form }) => {
  useClickForm(form);

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
      expect(
        (await press(button("選択1"), { down: 1699 })).clickPrevented,
      ).toBe(true);
      expect(
        (await press(button("選択1"), { down: 1700 })).clickPrevented,
      ).toBe(false);
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
    });

    test("窓の中で止めた detail 1 の押しは連続の1打目になり、その連続の窓のあとの detail 2 の押しは mousedown も止めずに答えを入れる", async () => {
      await startWithMouse();
      expect(
        await press(button("選択1"), { down: 1300, y: 530, detail: 1 }),
      ).toEqual({
        mouseDownPrevented: true,
        clickPrevented: true,
        clickReachedDocument: false,
      });
      // 起点から 750ms（窓のあと）。止めた押しを1打目とする連続の2打目なので、語の選択とフォーカスの移りも止めない。
      expect(
        await press(button("選択1"), { down: 1750, y: 530, detail: 2 }),
      ).toEqual({
        mouseDownPrevented: false,
        clickPrevented: false,
        clickReachedDocument: true,
      });
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

    test("タッチで押した「次へ」のあとも、窓の中の指の押しは次の問に答えを入れない", async () => {
      renderQuiz(makeQuiz("knowledge", 2));
      await pressWithKeyboard(button("はじめる"));
      await pressWithKeyboard(button("正解"));
      await press(button("次へ"), { down: 1000, pointerType: "touch" });
      expect(questionHeading()).toHaveTextContent("問2");
      expect(
        (
          await press(button("正解"), {
            down: 1300,
            pointerType: "touch",
          })
        ).clickPrevented,
      ).toBe(true);
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
        (await press(button("もう一度挑戦する"), { down: 1700 }))
          .clickPrevented,
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
        (await press(button("はじめる"), { down: 5200, y: 505 }))
          .clickPrevented,
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
    async function answerFirst(input: PressInput): Promise<void> {
      renderQuiz(makeQuiz("personality", 3));
      await pressWithKeyboard(button("はじめる"));
      await press(button("選択1"), { down: 1000, up: 1050, ...input });
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
        await answerFirst({ pointerType: "mouse" });
        const outcome = await press(button("選択1"), { down: 1300, detail: 2 });
        expect(outcome.mouseDownPrevented).toBe(true);
        expect(outcome.clickPrevented).toBe(true);
        expect(await answeredSecond()).toBe(false);
      });

      test("detail が 1 の押しは、窓の中・100px の中でも答えを入れる", async () => {
        await answerFirst({ pointerType: "mouse" });
        expect(
          (await press(button("選択1"), { down: 1300, detail: 1 }))
            .clickPrevented,
        ).toBe(false);
        expect(await answeredSecond()).toBe(true);
      });

      test("100px の外の detail 2 の押しは答えを入れる", async () => {
        await answerFirst({ pointerType: "mouse" });
        expect(
          (await press(button("選択1"), { down: 1300, y: 610, detail: 2 }))
            .clickPrevented,
        ).toBe(false);
        expect(await answeredSecond()).toBe(true);
      });

      test("700ms 以上の detail 2 の押しは答えを入れる", async () => {
        await answerFirst({ pointerType: "mouse" });
        expect(
          (await press(button("選択1"), { down: 1700, detail: 2 }))
            .clickPrevented,
        ).toBe(false);
        expect(await answeredSecond()).toBe(true);
      });
    });

    describe.each(TOUCH_LIKE_INPUTS)("$name", ({ input }) => {
      test("detail が 1 のまま、答えた押しの離しから 300ms 未満・100px の中の押し下げは答えを入れない", async () => {
        await answerFirst(input);
        const outcome = await press(button("選択1"), {
          down: 1050 + 299,
          ...input,
        });
        expect(outcome.mouseDownPrevented).toBe(true);
        expect(outcome.clickPrevented).toBe(true);
        expect(await answeredSecond()).toBe(false);
      });

      test("離しから 300ms の押し下げは答えを入れる", async () => {
        await answerFirst(input);
        expect(
          await press(button("選択1"), { down: 1050 + 300, ...input }),
        ).toEqual({
          mouseDownPrevented: false,
          clickPrevented: false,
          clickReachedDocument: true,
        });
        expect(await answeredSecond()).toBe(true);
      });

      test("100px の外の押しは、離しから 300ms 未満でも答えを入れる", async () => {
        await answerFirst(input);
        expect(
          (
            await press(button("選択1"), {
              down: 1050 + 200,
              y: 610,
              ...input,
            })
          ).clickPrevented,
        ).toBe(false);
        expect(await answeredSecond()).toBe(true);
      });

      test("離しから 150ms・300ms の三度押しの3打目は、2打目の離しから数えて連続とし、答えを入れない", async () => {
        await answerFirst(input);
        const second = await press(button("選択1"), {
          down: 1050 + 150,
          up: 1050 + 190,
          ...input,
        });
        expect(second.clickPrevented).toBe(true);
        // 起点の離しからは 300ms、2打目の離しからは 110ms。
        const third = await press(button("選択1"), {
          down: 1050 + 300,
          ...input,
        });
        expect(third.clickPrevented).toBe(true);
        expect(await answeredSecond()).toBe(false);
      });
    });
  });

  describe("答えを見せる間に押し下げ、切り替わったあとに離す押し", () => {
    /** 答えた問の、押した行の字（答えたあとは押せない行の上）。 */
    function answeredRow(): HTMLElement {
      return screen.getAllByText("選択1")[0];
    }

    /** 診断を始め、1問目に (100, 500) で、時刻 1000 に押し下げ 1050 に離して答える（まだ見せる間）。 */
    async function answerFirstOf(
      questionCount: number,
      input: PressInput,
    ): Promise<void> {
      renderQuiz(makeQuiz("personality", questionCount));
      await pressWithKeyboard(button("はじめる"));
      await press(button("選択1"), { down: 1000, up: 1050, ...input });
      expect(questionHeading()).toHaveTextContent("問1");
    }

    async function answeredSecond(): Promise<boolean> {
      await advance(ANSWER_SHOWN_MS);
      return questionHeading().textContent === "問3";
    }

    describe.each(MOUSE_DOWN_AT_RELEASE_INPUTS)(
      "$name（連続の押しの守り）",
      ({ input }) => {
        test("次の問の選択肢で離す押しは、答えを入れず、mousedown と click を止め、quiz_press_guarded を送る", async () => {
          await answerFirstOf(3, input);
          await pressDown(answeredRow(), { down: 1150, ...input });
          await advance(ANSWER_SHOWN_MS);
          expect(questionHeading()).toHaveTextContent("問2");
          const outcome = await release(button("選択1"), {
            up: 1250,
            ...input,
          });
          expect(outcome.mouseDownPrevented).toBe(true);
          expect(outcome.clickPrevented).toBe(true);
          expect(outcome.clickReachedDocument).toBe(false);
          expect(await answeredSecond()).toBe(false);
          expect(guardedEvents().map((call) => call[2])).toEqual([
            { transition: "answer", content_id: "quiz-character-personality" },
          ]);
        });

        test("次の問の選択肢で離して止めた押しのあと、3 秒以内に同じ選択肢を押し直して受けたら、押し下げから数えた quiz_press_guarded_retry を1回送る", async () => {
          await answerFirstOf(3, input);
          await pressDown(answeredRow(), { down: 1150, ...input });
          await advance(ANSWER_SHOWN_MS);
          await release(button("選択1"), { up: 1250, ...input });
          const retry = await press(button("選択1"), {
            down: 3150,
            ...input,
          });
          expect(retry.clickPrevented).toBe(false);
          expect(retryEvents()).toEqual([
            [
              "event",
              "quiz_press_guarded_retry",
              {
                transition: "answer",
                content_id: "quiz-character-personality",
                elapsed_ms: 2000,
              },
            ],
          ]);
        });

        test("100px の外で押し下げた押しは、次の問に答えを入れる", async () => {
          await answerFirstOf(3, input);
          await pressDown(answeredRow(), { down: 1150, y: 610, ...input });
          await advance(ANSWER_SHOWN_MS);
          const outcome = await release(button("選択1"), {
            up: 1250,
            y: 610,
            ...input,
          });
          expect(outcome.clickPrevented).toBe(false);
          expect(await answeredSecond()).toBe(true);
        });

        test("切り替わったあとに離した2打目も連続の元になり、その離しから 300ms 未満の3打目は答えを入れない", async () => {
          await answerFirstOf(3, input);
          await pressDown(answeredRow(), { down: 1150, ...input });
          await advance(ANSWER_SHOWN_MS);
          await release(button("選択1"), { up: 1250, ...input });
          // 起点の離し（1050）からは 400ms、2打目の離し（1250）からは 200ms。
          const third = await press(button("選択1"), {
            down: 1450,
            ...input,
          });
          expect(third.clickPrevented).toBe(true);
          expect(await answeredSecond()).toBe(false);
        });
      },
    );

    describe.each(TOUCH_LIKE_INPUTS)(
      "$name（見せる間に離す押し）",
      ({ input }) => {
        test("見せる間に押して離した2打目は連続の元になり、その離しから 300ms 未満の3打目（起点の離しからは 300ms 以上）は答えを入れない", async () => {
          await answerFirstOf(3, input);
          await press(answeredRow(), { down: 1120, up: 1160, ...input });
          await advance(ANSWER_SHOWN_MS);
          expect(questionHeading()).toHaveTextContent("問2");
          // 起点の離し（1050）からは 310ms、2打目の離し（1160）からは 200ms。
          const third = await press(button("選択1"), {
            down: 1360,
            ...input,
          });
          expect(third.clickPrevented).toBe(true);
          expect(await answeredSecond()).toBe(false);
        });
      },
    );

    describe.each(MOUSE_DOWN_AT_PRESS_INPUTS)(
      "$name（押し下げのすぐあとに出る mousedown）",
      ({ input }) => {
        /** 見せる間に答えた行で連続の押しを押し下げ、切り替わったあとに、click を出さずに次の問の選択肢の上で離す。 */
        async function holdThroughSwapWithoutClick(): Promise<void> {
          await answerFirstOf(3, input);
          await pressDown(answeredRow(), { down: 1120, detail: 2, ...input });
          await advance(ANSWER_SHOWN_MS);
          expect(questionHeading()).toHaveTextContent("問2");
          await releaseWithoutClick(button("選択1"), {
            up: 1250,
            detail: 2,
            ...input,
          });
        }

        test.each([
          { name: "同じ選択肢", choice: "選択1", y: 500 },
          { name: "別の選択肢", choice: "選択2", y: 560 },
          { name: "100px の外の選択肢", choice: "選択1", y: 610 },
        ])(
          "click を出さずに離した押しのあと、離しから 1 秒のうちの連続でない押しは、$name に答えを入れ、quiz_press_guarded も _retry も送らない",
          async ({ choice, y }) => {
            await holdThroughSwapWithoutClick();
            // 離しから 350ms（タッチとペンの連続の外）。マウスは detail 1。
            const outcome = await press(button(choice), {
              down: 1600,
              y,
              ...input,
            });
            expect(outcome).toEqual({
              mouseDownPrevented: false,
              clickPrevented: false,
              clickReachedDocument: true,
            });
            expect(await answeredSecond()).toBe(true);
            expect(guardedEvents()).toEqual([]);
            expect(retryEvents()).toEqual([]);
          },
        );

        test("click を出すブラウザでは、次の問の選択肢に届いた click を止める", async () => {
          await answerFirstOf(3, input);
          await pressDown(answeredRow(), { down: 1150, detail: 2, ...input });
          await advance(ANSWER_SHOWN_MS);
          const outcome = await release(button("選択1"), {
            up: 1250,
            detail: 2,
            ...input,
          });
          expect(outcome.clickPrevented).toBe(true);
          expect(outcome.clickReachedDocument).toBe(false);
          expect(await answeredSecond()).toBe(false);
        });
      },
    );

    test("hover を持つペンの、click を出さずに離した押しも連続の元になり、その離しから 300ms 未満の3打目は答えを入れない", async () => {
      const pen = { pointerType: "pen", mouseDownAt: "down" } as const;
      await answerFirstOf(3, pen);
      await pressDown(answeredRow(), { down: 1150, ...pen });
      await advance(ANSWER_SHOWN_MS);
      await releaseWithoutClick(button("選択1"), { up: 1250, ...pen });
      // 起点の離し（1050）からは 400ms、2打目の離し（1250）からは 200ms。
      const third = await press(button("選択1"), { down: 1450, ...pen });
      expect(third.clickPrevented).toBe(true);
      expect(await answeredSecond()).toBe(false);
    });

    describe.each(MOUSE_DOWN_AT_RELEASE_INPUTS)(
      "$name（最後の答えのあとの窓の守り）",
      ({ input }) => {
        test("結果の画面のリンクで離す押しは、mousedown を止め、移動を止める", async () => {
          await answerFirstOf(1, input);
          await pressDown(answeredRow(), { down: 1150, ...input });
          await advance(ANSWER_SHOWN_MS);
          const outcome = await release(
            screen.getByRole("link", { name: "次の遊び" }),
            { up: 1250, ...input },
          );
          expect(outcome.mouseDownPrevented).toBe(true);
          expect(outcome.clickPrevented).toBe(true);
          expect(outcome.clickReachedDocument).toBe(false);
          expect(guardedEvents().map((call) => call[2])).toEqual([
            { transition: "result", content_id: "quiz-character-personality" },
          ]);
        });

        test("100px の外で押し下げた押しは、結果の画面のボタンを押す", async () => {
          await answerFirstOf(1, input);
          await pressDown(answeredRow(), { down: 1150, y: 610, ...input });
          await advance(ANSWER_SHOWN_MS);
          const outcome = await release(button("もう一度挑戦する"), {
            up: 1250,
            y: 610,
            ...input,
          });
          expect(outcome.clickPrevented).toBe(false);
          expect(button("はじめる")).toBeInTheDocument();
        });
      },
    );
  });

  describe("1打目の click より先に2打目を押し下げる指の速い二度押し", () => {
    /** 指（押しごとに pointerId を分ける）。座標の既定は (100, 500)。 */
    interface Finger {
      pointerId: number;
      x?: number;
      y?: number;
    }

    /** 1打目は (100, 500)、2打目は 1打目から 60px 下（100px の中）。 */
    let first: Finger;
    let second: Finger;
    beforeEach(() => {
      first = { pointerId: newPointerId("touch") };
      second = { pointerId: newPointerId("touch"), y: 560 };
    });

    async function fingerEvent(
      target: Element,
      type: "pointerdown" | "pointerup" | "pointercancel",
      finger: Finger,
      time: number,
    ): Promise<void> {
      await act(async () => {
        target.dispatchEvent(
          at(
            new PointerEvent(
              type,
              pointerOf({ ...finger, pointerType: "touch" }, finger.pointerId),
            ),
            time,
          ),
        );
      });
    }

    /** 離したあとに出る互換の mousedown・mouseup と click（click はいまの形）。 */
    async function compatEvents(
      target: Element,
      finger: Finger,
      time: number,
      detail: number,
    ): Promise<{ mouseDownPrevented: boolean; clickPrevented: boolean }> {
      const coordinates = { ...coordinatesOf(finger), detail };
      const mouseDown = at(new MouseEvent("mousedown", coordinates), time);
      const click = at(clickOf(coordinates, "touch", finger.pointerId), time);
      await act(async () => {
        target.dispatchEvent(mouseDown);
        target.dispatchEvent(at(new MouseEvent("mouseup", coordinates), time));
        target.dispatchEvent(click);
      });
      return {
        mouseDownPrevented: mouseDown.defaultPrevented,
        clickPrevented: click.defaultPrevented,
      };
    }

    /** いちばん新しい着地に渡した押した点。 */
    function lastLandingPoint(): unknown {
      return vi.mocked(revealLanding).mock.lastCall?.[1];
    }

    test("「はじめる」: 2打目は1問目に答えを入れず、起点と着地の点は1打目のもの", async () => {
      renderQuiz(makeQuiz("personality", 2));
      const start = button("はじめる");
      await fingerEvent(start, "pointerdown", first, 1000);
      await fingerEvent(start, "pointerup", first, 1000);
      await fingerEvent(start, "pointerdown", second, 1000);
      await compatEvents(start, first, 1000, 1);
      expect(questionHeading()).toHaveTextContent("問1");
      expect(lastLandingPoint()).toEqual({ x: 100, y: 500 });

      const choice = button("選択1");
      await fingerEvent(choice, "pointerup", second, 1200);
      expect(await compatEvents(choice, second, 1200, 2)).toEqual({
        mouseDownPrevented: true,
        clickPrevented: true,
      });
      await advance(ANSWER_SHOWN_MS);
      expect(isUnanswered()).toBe(true);

      // 起点は1打目。1打目から 140px（2打目からは 80px）の、窓の中の押しは受ける。
      const third = await press(button("選択1"), {
        down: 1500,
        y: 640,
        pointerType: "touch",
      });
      expect(third.clickPrevented).toBe(false);
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
    });

    test("「はじめる」: 2打目の離しまで1打目の互換の事象より先に届いても、2打目は1問目に答えを入れず、起点と着地の点は1打目のもの", async () => {
      renderQuiz(makeQuiz("personality", 2));
      const start = button("はじめる");
      await fingerEvent(start, "pointerdown", first, 1000);
      await fingerEvent(start, "pointerup", first, 1000);
      await fingerEvent(start, "pointerdown", second, 1030);
      await fingerEvent(start, "pointerup", second, 1030);
      await compatEvents(start, first, 1030, 1);
      expect(questionHeading()).toHaveTextContent("問1");
      expect(lastLandingPoint()).toEqual({ x: 100, y: 500 });

      expect(await compatEvents(button("選択1"), second, 1030, 2)).toEqual({
        mouseDownPrevented: true,
        clickPrevented: true,
      });
      await advance(ANSWER_SHOWN_MS);
      expect(isUnanswered()).toBe(true);

      // 起点は1打目。1打目から 140px（2打目からは 80px）の、窓の中の押しは受ける。
      const third = await press(button("選択1"), {
        down: 1500,
        y: 640,
        pointerType: "touch",
      });
      expect(third.clickPrevented).toBe(false);
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
    });

    test("「はじめる」を同じ点で 0ms の二度押し: 2打目は1問目に答えを入れない", async () => {
      renderQuiz(makeQuiz("personality", 2));
      const sameFinger: Finger = { pointerId: newPointerId("touch") };
      const start = button("はじめる");
      await fingerEvent(start, "pointerdown", first, 1000);
      await fingerEvent(start, "pointerup", first, 1000);
      await fingerEvent(start, "pointerdown", sameFinger, 1000);
      await compatEvents(start, first, 1000, 1);
      expect(questionHeading()).toHaveTextContent("問1");

      const choice = button("選択1");
      await fingerEvent(choice, "pointerup", sameFinger, 1200);
      expect(await compatEvents(choice, sameFinger, 1200, 2)).toEqual({
        mouseDownPrevented: true,
        clickPrevented: true,
      });
      await advance(ANSWER_SHOWN_MS);
      expect(isUnanswered()).toBe(true);
    });

    test("「はじめる」を同じ点で 0ms の二度押し: 2打目の離しまで1打目の互換の事象より先に届いても、2打目は1問目に答えを入れない", async () => {
      renderQuiz(makeQuiz("personality", 2));
      const sameFinger: Finger = { pointerId: newPointerId("touch") };
      const start = button("はじめる");
      await fingerEvent(start, "pointerdown", first, 1000);
      await fingerEvent(start, "pointerup", first, 1000);
      await fingerEvent(start, "pointerdown", sameFinger, 1030);
      await fingerEvent(start, "pointerup", sameFinger, 1030);
      await compatEvents(start, first, 1030, 1);
      expect(questionHeading()).toHaveTextContent("問1");
      expect(lastLandingPoint()).toEqual({ x: 100, y: 500 });

      expect(await compatEvents(button("選択1"), sameFinger, 1030, 2)).toEqual({
        mouseDownPrevented: true,
        clickPrevented: true,
      });
      await advance(ANSWER_SHOWN_MS);
      expect(isUnanswered()).toBe(true);
    });

    test("「はじめる」を同じ点で 0ms の三度押し: 3打の離しが互換の事象より先に届いても、2打目と3打目は1問目に答えを入れない", async () => {
      renderQuiz(makeQuiz("personality", 2));
      const fingers: Finger[] = [
        first,
        { pointerId: newPointerId("touch") },
        { pointerId: newPointerId("touch") },
      ];
      const start = button("はじめる");
      for (const [index, finger] of fingers.entries()) {
        await fingerEvent(start, "pointerdown", finger, 1000 + index * 30);
        await fingerEvent(start, "pointerup", finger, 1000 + index * 30);
      }
      await compatEvents(start, fingers[0], 1060, 1);
      expect(questionHeading()).toHaveTextContent("問1");

      for (const [index, finger] of fingers.slice(1).entries()) {
        expect(
          await compatEvents(button("選択1"), finger, 1060, index + 2),
        ).toEqual({
          mouseDownPrevented: true,
          clickPrevented: true,
        });
      }
      await advance(ANSWER_SHOWN_MS);
      expect(isUnanswered()).toBe(true);
    });

    test("診断の答えを同じ点で 0ms の二度押し: 2打目の離しまで1打目の互換の事象より先に届いても、2打目は次の問に答えを入れない", async () => {
      renderQuiz(makeQuiz("personality", 3));
      await pressWithKeyboard(button("はじめる"));
      const sameFinger: Finger = { pointerId: newPointerId("touch") };
      const answered = button("選択1");
      await fingerEvent(answered, "pointerdown", first, 1000);
      await fingerEvent(answered, "pointerup", first, 1000);
      await fingerEvent(answered, "pointerdown", sameFinger, 1030);
      await fingerEvent(answered, "pointerup", sameFinger, 1030);
      await compatEvents(answered, first, 1030, 1);
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");

      expect(await compatEvents(button("選択1"), sameFinger, 1030, 2)).toEqual({
        mouseDownPrevented: true,
        clickPrevented: true,
      });
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
      expect(isUnanswered()).toBe(true);
    });

    test("診断の答え: 2打目は次の問に答えを入れず、起点と着地の点は1打目のもの", async () => {
      renderQuiz(makeQuiz("personality", 3));
      await pressWithKeyboard(button("はじめる"));
      const answered = button("選択1");
      await fingerEvent(answered, "pointerdown", first, 1000);
      await fingerEvent(answered, "pointerup", first, 1000);
      await fingerEvent(answered, "pointerdown", second, 1000);
      await compatEvents(answered, first, 1000, 1);
      expect(questionHeading()).toHaveTextContent("問1");
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
      expect(lastLandingPoint()).toEqual({ x: 100, y: 500 });

      const choice = button("選択1");
      await fingerEvent(choice, "pointerup", second, 1200);
      expect(await compatEvents(choice, second, 1200, 2)).toEqual({
        mouseDownPrevented: true,
        clickPrevented: true,
      });
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
      expect(isUnanswered()).toBe(true);

      // 起点は1打目。2打目の離しから 100ms の連続の押しでも、1打目から 140px（2打目からは 80px）なら受ける。
      const third = await press(button("選択1"), {
        down: 1300,
        y: 640,
        pointerType: "touch",
      });
      expect(third.clickPrevented).toBe(false);
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問3");
    });

    /** 3問の診断をキーボードで始め、before の押しを送ってから、1打目の指で1問目に答えて（離しは answerAt）次の問を出す。 */
    async function answerAfter(
      before: () => Promise<void>,
      answerAt: number,
    ): Promise<void> {
      renderQuiz(makeQuiz("personality", 3));
      await pressWithKeyboard(button("はじめる"));
      await before();
      const choice = button("選択1");
      await fingerEvent(choice, "pointerdown", first, answerAt - 50);
      await fingerEvent(choice, "pointerup", first, answerAt);
      await compatEvents(choice, first, answerAt, 1);
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
    }

    /** 1打目の離しから 100ms の、1打目と同じ点の指の押しが止まるか（起点が1打目なら止まる）。 */
    async function samePointPressBlocked(answerAt: number): Promise<boolean> {
      const outcome = await press(button("選択1"), {
        down: answerAt + 100,
        pointerType: "touch",
      });
      return outcome.clickPrevented;
    }

    test("tap と取られずに click を受けなかった別の点の指の押しのあとも、1打目と結ぶ", async () => {
      await answerAfter(
        () => tapWithoutCompatEvents(questionHeading(), { down: 1000, y: 300 }),
        1250,
      );
      expect(await samePointPressBlocked(1250)).toBe(true);
    });

    test("離してから 1 秒（COMPAT_EVENTS_WAIT_MS）click を受けなかった指の押しとは、同じ点でも結ばない", async () => {
      const answerAt = 1050 + COMPAT_EVENTS_WAIT_MS + 50;
      await answerAfter(
        () => tapWithoutCompatEvents(questionHeading(), { down: 1000 }),
        answerAt,
      );
      expect(await samePointPressBlocked(answerAt)).toBe(true);
    });

    test("引いて送りになった指の押しは、同じ点のあとの押しの click と結ばない", async () => {
      const cancelled: Finger = { pointerId: newPointerId("touch") };
      await answerAfter(async () => {
        await fingerEvent(questionHeading(), "pointerdown", cancelled, 1000);
        await fingerEvent(questionHeading(), "pointercancel", cancelled, 1020);
      }, 1150);
      expect(await samePointPressBlocked(1150)).toBe(true);
    });

    test("互換の事象の点がタッチの調整で押しの点から縦横 16px までずれても、別の点に残った click を受けない指の押しでなく、その押しと結ぶ", async () => {
      renderQuiz(makeQuiz("personality", 3));
      await pressWithKeyboard(button("はじめる"));
      await tapWithoutCompatEvents(questionHeading(), { down: 1000, y: 300 });
      const choice = button("選択1");
      await fingerEvent(choice, "pointerdown", first, 1200);
      await fingerEvent(choice, "pointerup", first, 1250);
      // 押しの点 (100, 500) を、押せるものへ寄せた点。
      await compatEvents(choice, { ...first, x: 112, y: 484 }, 1250, 1);
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
      expect(await samePointPressBlocked(1250)).toBe(true);
    });
  });

  describe.each(MOUSE_DOWN_AT_PRESS_INPUTS)(
    "$name の、click を受けずに離した押しのあとの押し",
    ({ input }) => {
      test("click を受けなかった押しは次の押し下げで並びから外れ、次の押しの click が守りの起点になる", async () => {
        renderQuiz(makeQuiz("personality", 3));
        await pressWithKeyboard(button("はじめる"));
        // 押し下げた的が、離すまでに DOM から外れた押し。
        const heading = questionHeading();
        await pressDown(heading, { down: 1000, ...input });
        await releaseWithoutClick(heading, { up: 1050, ...input });
        await press(button("選択1"), { down: 1500, ...input });
        await advance(ANSWER_SHOWN_MS);
        expect(questionHeading()).toHaveTextContent("問2");
        // 答えた押しから 300ms・その離しから 250ms（click を受けなかった押しからは 800ms）の連続の押し。
        const outcome = await press(button("選択1"), {
          down: 1800,
          detail: 2,
          ...input,
        });
        expect(outcome.clickPrevented).toBe(true);
        await advance(ANSWER_SHOWN_MS);
        expect(questionHeading()).toHaveTextContent("問2");
      });
    },
  );

  describe("互換の事象を出さないタップのあとの押し", () => {
    /** 診断を開き、指で (100, 500) の「はじめる」を時刻 1000 に押し、窓の中の 2打目が押せない字に落ちて互換の事象を出さない。 */
    async function startWithSilentSecondTap(): Promise<void> {
      renderQuiz(makeQuiz("personality", 2));
      await press(button("はじめる"), { down: 1000, pointerType: "touch" });
      expect(questionHeading()).toHaveTextContent("問1");
      await tapWithoutCompatEvents(questionHeading(), {
        down: 1150,
        up: 1200,
        y: 510,
      });
    }

    test("別の点の、窓の中でも 100px の外の押しは、答えを入れ、quiz_press_guarded も _retry も送らない", async () => {
      await startWithSilentSecondTap();
      const outcome = await press(button("選択1"), {
        down: 1400,
        y: 300,
        pointerType: "touch",
      });
      expect(outcome).toEqual({
        mouseDownPrevented: false,
        clickPrevented: false,
        clickReachedDocument: true,
      });
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
      expect(guardedEvents()).toEqual([]);
      expect(retryEvents()).toEqual([]);
    });

    test("同じ点の、窓のあとの押しは、答えを入れ、quiz_press_guarded も _retry も送らない", async () => {
      await startWithSilentSecondTap();
      const outcome = await press(button("選択1"), {
        down: 1750,
        y: 510,
        pointerType: "touch",
      });
      expect(outcome).toEqual({
        mouseDownPrevented: false,
        clickPrevented: false,
        clickReachedDocument: true,
      });
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
      expect(guardedEvents()).toEqual([]);
      expect(retryEvents()).toEqual([]);
    });

    test("窓の中・100px の中の押しは、受けない", async () => {
      await startWithSilentSecondTap();
      const outcome = await press(button("選択1"), {
        down: 1300,
        y: 540,
        pointerType: "touch",
      });
      expect(outcome.mouseDownPrevented).toBe(true);
      expect(outcome.clickPrevented).toBe(true);
      await advance(ANSWER_SHOWN_MS);
      expect(isUnanswered()).toBe(true);
      expect(guardedEvents()).toHaveLength(1);
    });

    test("窓の中で受けないタップの点の右ボタンの押しは、止めず、quiz_press_guarded を送らない", async () => {
      await startWithSilentSecondTap();
      const { mouseDown } = await pressWithRightButton(button("選択1"), {
        down: 1300,
        y: 510,
      });
      expect(mouseDown.defaultPrevented).toBe(false);
      expect(guardedEvents()).toEqual([]);
    });

    test("同じ点に残ったタップの 900ms あとに押した「はじめる」の、250ms あとの2打目は1問目に答えを入れない", async () => {
      renderQuiz(makeQuiz("personality", 2));
      await tapWithoutCompatEvents(screen.getByRole("heading", { level: 1 }), {
        down: 100,
        up: 150,
      });
      await press(button("はじめる"), { down: 1000, pointerType: "touch" });
      expect(questionHeading()).toHaveTextContent("問1");
      const outcome = await press(button("選択1"), {
        down: 1250,
        y: 520,
        pointerType: "touch",
      });
      expect(outcome.mouseDownPrevented).toBe(true);
      expect(outcome.clickPrevented).toBe(true);
      await advance(ANSWER_SHOWN_MS);
      expect(isUnanswered()).toBe(true);
    });

    test.each([
      { name: "1つ", taps: [1000] },
      { name: "2つ", taps: [1000, 1100] },
    ])(
      "同じ点に残ったタップ $name のあとに答えた押しの、離しから 300ms 未満の連続の押しは、次の問に答えを入れない",
      async ({ taps }) => {
        renderQuiz(makeQuiz("personality", 3));
        await pressWithKeyboard(button("はじめる"));
        for (const down of taps) {
          await tapWithoutCompatEvents(questionHeading(), { down });
        }
        await press(button("選択1"), {
          down: 1700,
          up: 1750,
          pointerType: "touch",
        });
        await advance(ANSWER_SHOWN_MS);
        expect(questionHeading()).toHaveTextContent("問2");
        // 答えた押しの離しから 200ms（残ったタップの離しからは 300ms 以上）。
        const outcome = await press(button("選択1"), {
          down: 1950,
          pointerType: "touch",
        });
        expect(outcome.mouseDownPrevented).toBe(true);
        expect(outcome.clickPrevented).toBe(true);
        await advance(ANSWER_SHOWN_MS);
        expect(questionHeading()).toHaveTextContent("問2");
        expect(isUnanswered()).toBe(true);
      },
    );

    test("「はじめる」より前の、起点から 100px の外のタップは、その点の近くの窓の中の押しの click を取らない", async () => {
      renderQuiz(makeQuiz("personality", 2));
      await tapWithoutCompatEvents(screen.getByRole("heading", { level: 1 }), {
        down: 800,
        up: 850,
        y: 620,
      });
      await press(button("はじめる"), { down: 1000, pointerType: "touch" });
      expect(questionHeading()).toHaveTextContent("問1");
      // 起点から 95px、タップから 25px。
      const outcome = await press(button("選択1"), {
        down: 1300,
        y: 595,
        pointerType: "touch",
      });
      expect(outcome.mouseDownPrevented).toBe(true);
      expect(outcome.clickPrevented).toBe(true);
      await advance(ANSWER_SHOWN_MS);
      expect(isUnanswered()).toBe(true);
    });

    test("診断の答えのあと、連続と数えた押しが互換の事象を出さなくても、その離しから 300ms 以上の同じ点の押しは答えを入れる", async () => {
      renderQuiz(makeQuiz("personality", 3));
      await pressWithKeyboard(button("はじめる"));
      await press(button("選択1"), {
        down: 1000,
        up: 1050,
        pointerType: "touch",
      });
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問2");
      // 答えた押しの離しから 150ms の連続の押し。次の問の押せない字に落ちる。
      await tapWithoutCompatEvents(questionHeading(), {
        down: 1200,
        up: 1250,
        y: 510,
      });
      // 起点から 600ms（700ms の中）。連続の元の離し（1250）から 350ms なので連続でない。
      const outcome = await press(button("選択1"), {
        down: 1600,
        y: 510,
        pointerType: "touch",
      });
      expect(outcome.mouseDownPrevented).toBe(false);
      expect(outcome.clickPrevented).toBe(false);
      await advance(ANSWER_SHOWN_MS);
      expect(questionHeading()).toHaveTextContent("問3");
      expect(guardedEvents()).toEqual([]);
    });
  });

  describe("押し直しの経過（受けなかった押しの押し下げから、受けた押しの押し下げまで）", () => {
    /** 押し直しの経過。 */
    function retryElapsed(): unknown[] {
      return retryEvents().map(
        (call) => (call[2] as { elapsed_ms: number }).elapsed_ms,
      );
    }

    test("「はじめる」より前の、起点から 100px の外のタップがあっても、止めた押しから数える", async () => {
      renderQuiz(makeQuiz("personality", 2));
      await tapWithoutCompatEvents(screen.getByRole("heading", { level: 1 }), {
        down: 800,
        up: 850,
        y: 620,
      });
      await press(button("はじめる"), { down: 1000, pointerType: "touch" });
      // 起点から 95px、タップから 25px。
      await press(button("選択1"), {
        down: 1300,
        y: 595,
        pointerType: "touch",
      });
      await press(button("選択1"), {
        down: 2000,
        y: 595,
        pointerType: "touch",
      });
      expect(retryElapsed()).toEqual([700]);
    });

    test("離してから 1 秒（COMPAT_EVENTS_WAIT_MS）を過ぎた同じ点のタップがあっても、止めた押しから数える", async () => {
      renderQuiz(makeQuiz("personality", 2));
      await tapWithoutCompatEvents(screen.getByRole("heading", { level: 1 }), {
        down: 0,
        up: 50,
      });
      await press(button("はじめる"), {
        down: 50 + COMPAT_EVENTS_WAIT_MS,
        pointerType: "touch",
      });
      await press(button("選択1"), {
        down: 1250,
        y: 520,
        pointerType: "touch",
      });
      await press(button("選択1"), {
        down: 2250,
        y: 520,
        pointerType: "touch",
      });
      expect(retryElapsed()).toEqual([1000]);
    });

    test("窓の中で引いて送りになった押しがあっても、止めた押しから数える", async () => {
      renderQuiz(makeQuiz("personality", 2));
      await press(button("はじめる"), { down: 1000 });
      const choice = button("選択1");
      const finger = pointerOf({ pointerType: "touch" }, newPointerId("touch"));
      await act(async () => {
        choice.dispatchEvent(at(new PointerEvent("pointerdown", finger), 1200));
        choice.dispatchEvent(
          at(new PointerEvent("pointercancel", finger), 1250),
        );
      });
      await press(choice, { down: 1400 });
      await press(choice, { down: 2000 });
      expect(retryElapsed()).toEqual([600]);
    });

    test("止めた押しのあとに同じ点のタップが残っても、受けた押しまで数える", async () => {
      renderQuiz(makeQuiz("personality", 2));
      await press(button("はじめる"), { down: 1000 });
      await press(button("選択1"), { down: 1200 });
      await tapWithoutCompatEvents(questionHeading(), { down: 1800 });
      await press(button("選択1"), { down: 2700, pointerType: "touch" });
      expect(retryElapsed()).toEqual([1500]);
    });
  });

  describe("覚えない押しと、離しの点で結ぶ押し", () => {
    /** 診断を開き、pointerType の押しで (100, 500) の「はじめる」を時刻 1000 に押す。 */
    async function start(pointerType: PointerKind): Promise<void> {
      renderQuiz(makeQuiz("personality", 2));
      await press(button("はじめる"), { down: 1000, pointerType });
      expect(questionHeading()).toHaveTextContent("問1");
    }

    /** 起点から 95px の、窓の中の押しが受けられないか（答えが入らないか）。 */
    async function pressInWindowBlocked(outcome: {
      clickPrevented: boolean;
    }): Promise<boolean> {
      await advance(ANSWER_SHOWN_MS);
      return outcome.clickPrevented && isUnanswered();
    }

    test("窓の中・100px の中の右ボタンの押しは、止めず、quiz_press_guarded を送らない", async () => {
      await start("mouse");
      const { mouseDown, contextMenu } = await pressWithRightButton(
        button("選択1"),
        { down: 1200 },
      );
      expect(mouseDown.defaultPrevented).toBe(false);
      expect(contextMenu.defaultPrevented).toBe(false);
      expect(guardedEvents()).toEqual([]);
    });

    test("100px の外の右ボタンの押しは押しを覚えず、その点の近くの窓の中の押しを受けない", async () => {
      await start("mouse");
      await pressWithRightButton(questionHeading(), { down: 1200, y: 620 });
      // 起点から 95px、右ボタンの押しから 25px。
      const outcome = await press(button("選択1"), { down: 1300, y: 595 });
      expect(await pressInWindowBlocked(outcome)).toBe(true);
    });

    test("2本の指で触れた押し（pointerdown と pointerup だけを出す）の2本目は押しを覚えず、その点の近くの窓の中の押しを受けない", async () => {
      await start("touch");
      const heading = questionHeading();
      const fingers = [
        { isPrimary: true, y: 300, pointerId: newPointerId("touch") },
        { isPrimary: false, y: 620, pointerId: newPointerId("touch") },
      ];
      const fingerEvent = (
        type: "pointerdown" | "pointerup",
        { isPrimary, y, pointerId }: (typeof fingers)[number],
        time: number,
      ): PointerEvent =>
        at(
          new PointerEvent(type, {
            ...pointerOf({ pointerType: "touch", y }, pointerId),
            isPrimary,
          }),
          time,
        );
      await act(async () => {
        heading.dispatchEvent(fingerEvent("pointerdown", fingers[0], 1200));
        heading.dispatchEvent(fingerEvent("pointerdown", fingers[1], 1220));
        heading.dispatchEvent(fingerEvent("pointerup", fingers[1], 1250));
        heading.dispatchEvent(fingerEvent("pointerup", fingers[0], 1280));
      });
      // 起点から 95px、2本目の指から 25px。
      const outcome = await press(button("選択1"), {
        down: 1400,
        y: 595,
        pointerType: "touch",
      });
      expect(await pressInWindowBlocked(outcome)).toBe(true);
    });

    test("押し下げから動かして離したマウスの押しは、離しの点の click と結ぶ", async () => {
      await start("mouse");
      // 起点から 200px の所の、互換の事象を出さないタップ。
      await tapWithoutCompatEvents(questionHeading(), {
        down: 1050,
        up: 1100,
        y: 300,
      });
      const choice = button("選択1");
      await pressDown(choice, { down: 1300, y: 520 });
      const released = await release(choice, { up: 1350, y: 560 });
      expect(await pressInWindowBlocked(released)).toBe(true);
    });
  });
});

describe("番号で結べる click（Chromium）", () => {
  /** 同じ点の指の押しの、押し下げと離しを送る。 */
  async function touchDownUp(
    target: Element,
    pointerId: number,
    time: number,
  ): Promise<void> {
    const finger = pointerOf({ pointerType: "touch" }, pointerId);
    await act(async () => {
      target.dispatchEvent(at(new PointerEvent("pointerdown", finger), time));
      target.dispatchEvent(at(new PointerEvent("pointerup", finger), time));
    });
  }

  /** 同じ点の指の押しの、互換の mousedown と click を送り、click が止められたかを返す。 */
  async function touchCompat(
    target: Element,
    pointerId: number,
    time: number,
    detail: number,
  ): Promise<boolean> {
    const coordinates = { ...coordinatesOf({}), detail };
    const click = at(clickOf(coordinates, "touch", pointerId), time);
    await act(async () => {
      target.dispatchEvent(at(new MouseEvent("mousedown", coordinates), time));
      target.dispatchEvent(click);
    });
    return click.defaultPrevented;
  }

  test("2打目の離しまで1打目の互換の事象より先に届いた二度押しでも、窓は番号で結んだ1打目から数える", async () => {
    renderQuiz(makeQuiz("personality", 2));
    const start = button("はじめる");
    const fingers = [newPointerId("touch"), newPointerId("touch")];
    await touchDownUp(start, fingers[0], 1000);
    await touchDownUp(start, fingers[1], 1030);
    await touchCompat(start, fingers[0], 1030, 1);
    expect(await touchCompat(button("選択1"), fingers[1], 1030, 2)).toBe(true);
    // 1打目から 700ms（2打目からは 670ms）。
    const third = await press(button("選択1"), {
      down: 1700,
      pointerType: "touch",
    });
    expect(third.clickPrevented).toBe(false);
    await advance(ANSWER_SHOWN_MS);
    expect(questionHeading()).toHaveTextContent("問2");
  });

  test("窓の中で止めた押しの前に同じ点のタップが残っても、押し直しの経過は番号で結んだ止めた押しから数える", async () => {
    renderQuiz(makeQuiz("personality", 2));
    await press(button("はじめる"), { down: 1000 });
    await tapWithoutCompatEvents(questionHeading(), { down: 1100 });
    await press(button("選択1"), { down: 1300, pointerType: "touch" });
    await press(button("選択1"), { down: 2000, pointerType: "touch" });
    expect(retryEvents().map((call) => call[2])).toEqual([
      {
        transition: "start",
        content_id: "quiz-character-personality",
        elapsed_ms: 700,
      },
    ]);
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

  test("押し下げのあと引いて送りになった押し（mousedown も click も来ない）は数えず、そのあとの窓の中の押しを止めたときに1回だけ数える", async () => {
    await startWithMouse();
    const choice = button("選択1");
    const finger = pointerOf({ pointerType: "touch" }, newPointerId("touch"));
    await act(async () => {
      choice.dispatchEvent(at(new PointerEvent("pointerdown", finger), 1200));
      choice.dispatchEvent(at(new PointerEvent("pointercancel", finger), 1250));
    });
    expect(guardedEvents()).toEqual([]);
    const outcome = await press(choice, { down: 1400 });
    expect(outcome.clickPrevented).toBe(true);
    expect(guardedEvents()).toEqual([
      [
        "event",
        "quiz_press_guarded",
        { transition: "start", content_id: "quiz-character-personality" },
      ],
    ]);
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

  test("押し下げの的が押せるものの外でも、タッチの調整で click が同じ押せるものに届いた押し直しは、quiz_press_guarded_retry を送る", async () => {
    await startWithMouse();
    const choice = button("選択1");
    await press(choice, { down: 1200 });
    const row = choice.parentElement;
    expect(row).not.toBeNull();
    expect(closestPressable(row)).toBeNull();
    await pressDown(row as Element, {
      down: 1500,
      y: 660,
      pointerType: "touch",
    });
    const retried = await release(choice, {
      up: 1550,
      y: 660,
      pointerType: "touch",
      compatPoint: { x: 100, y: 648 },
    });
    expect(retried.clickPrevented).toBe(false);
    expect(retryEvents().map((call) => call[2])).toEqual([
      {
        transition: "start",
        content_id: "quiz-character-personality",
        elapsed_ms: 300,
      },
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
