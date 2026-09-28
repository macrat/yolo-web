import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  revealControl,
  revealFocusedFrame,
  revealResult,
  trackScrollBeforeTab,
  visibleRange,
} from "../reveal";

function box(top: number, bottom: number): Element {
  return {
    getBoundingClientRect: () => ({ top, bottom }) as DOMRect,
  } as Element;
}

beforeEach(() => {
  vi.stubGlobal("visualViewport", undefined);
  vi.stubGlobal("innerHeight", 600);
  vi.stubGlobal("scrollBy", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("visibleRange", () => {
  test("visualViewport が無ければ innerHeight の範囲", () => {
    expect(visibleRange()).toEqual({ top: 0, bottom: 600 });
  });

  test("visualViewport があれば、その上端の位置と高さで測る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 120, height: 280 });
    expect(visibleRange()).toEqual({ top: 120, bottom: 400 });
  });
});

describe("revealControl", () => {
  beforeEach(() => {
    vi.stubGlobal("innerHeight", 667);
  });

  test("コントロールが画面の中にあれば送らない", () => {
    revealControl(box(512, 560));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("下端がちょうど画面の下端でも、画面の中として送らない", () => {
    revealControl(box(619, 667));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("画面の下へ出ていれば、下端が画面の下端から 8px 上に来るまで送る", () => {
    revealControl(box(640, 688));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 29,
      behavior: "instant",
    });
  });

  test("画面の上へ出ていれば、下端が画面の下端から 8px 上に来るまで戻す", () => {
    revealControl(box(-60, -12));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -671,
      behavior: "instant",
    });
  });

  test("文字盤で縮んだ画面の下端（offsetTop + height）で測る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 0, height: 400 });
    revealControl(box(420, 468));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 76,
      behavior: "instant",
    });
  });

  test("visualViewport が送られているときは offsetTop を足した位置を下端にする", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 100, height: 400 });
    revealControl(box(420, 468));
    expect(window.scrollBy).not.toHaveBeenCalled();

    revealControl(box(460, 520));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 28,
      behavior: "instant",
    });
  });

  test("innerHeight の中でも visualViewport の外なら送る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 0, height: 400 });
    revealControl(box(500, 548));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 156,
      behavior: "instant",
    });
  });

  test("端数の距離を丸めずに送る", () => {
    revealControl(box(640.4, 688.6));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 688.6 - 659,
      behavior: "instant",
    });
  });

  test("コントロールと context がどちらも画面の中なら送らない", () => {
    revealControl(box(600, 644), box(200, 300));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("コントロールが画面の中でも context が上に出ていれば、コントロールの下端を画面の下端から 8px 上に置く", () => {
    revealControl(box(400, 444), box(-40, 50));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -215,
      behavior: "instant",
    });
  });

  test("両方が入らないときも、コントロールの下端で位置を決め、コントロールを画面に入れる", () => {
    revealControl(box(769, 813), box(-100, 200));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 154,
      behavior: "instant",
    });
  });
});

describe("revealResult", () => {
  test("結果が丸ごと画面にあれば送らない", () => {
    revealResult(box(100, 150), box(160, 590));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("長い結果は、操作の並びを上端から 8px 下に置く", () => {
    revealResult(box(400, 450), box(460, 5000));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 392,
      behavior: "instant",
    });
  });

  test("短い結果は、下端が下端から 8px 上に入るまでで止める", () => {
    revealResult(box(400, 450), box(460, 700));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 108,
      behavior: "instant",
    });
  });

  test("文字盤で狭まった範囲で測る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 200, height: 300 });
    revealResult(box(450, 500), box(510, 3000));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 242,
      behavior: "instant",
    });
  });
});

describe("revealFocusedFrame", () => {
  let frames: (() => void)[];
  let stopTracking: () => void;

  // 着く前の画面の位置で Tab を押し、ブラウザがフォーカスの送りを済ませてから知らせが来る。
  function pressTabThenBrowserScrolls(from: number, to: number): number {
    vi.stubGlobal("scrollY", from);
    const tab = new KeyboardEvent("keydown", { key: "Tab" });
    window.dispatchEvent(tab);
    vi.stubGlobal("scrollY", to);
    return tab.timeStamp + 5;
  }

  function paint(): void {
    for (const frame of frames.splice(0)) frame();
  }

  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: () => void) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal("getComputedStyle", () => ({
      outlineOffset: "3px",
      outlineWidth: "3px",
    }));
    vi.stubGlobal("scrollX", 0);
    vi.stubGlobal("scrollTo", vi.fn());
    stopTracking = trackScrollBeforeTab();
  });

  afterEach(() => {
    stopTracking();
  });

  test("前から着き、着く前にリングの上の辺が画面にあれば、着く前の位置に戻して動かさない", () => {
    // 着く前はボックスの上端が 300px（リングは 294px）。ブラウザが 296px 送って上端が 4px に来た。
    const focusTime = pressTabThenBrowserScrolls(500, 796);
    revealFocusedFrame(box(4, 3000), false, focusTime);
    paint();
    expect(window.scrollTo).toHaveBeenCalledWith({
      left: 0,
      top: 500,
      behavior: "instant",
    });
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("前から着き、リングの上の辺が着く前も画面の外なら、上端から 8px 下に来るまで送る", () => {
    const focusTime = pressTabThenBrowserScrolls(500, 500);
    revealFocusedFrame(box(-7000, 3000), false, focusTime);
    paint();
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -7014,
      behavior: "instant",
    });
  });

  test("後ろから戻り、着く前にリングの下の辺が画面にあれば、動かさない", () => {
    const focusTime = pressTabThenBrowserScrolls(900, 900);
    revealFocusedFrame(box(-3000, 400), true, focusTime);
    paint();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("後ろから戻り、リングの下の辺が画面の外なら、下端から 8px 上に来るまで送る", () => {
    // ブラウザが区画を真ん中に寄せたあと、リングの下の辺は 3006px にある。
    const focusTime = pressTabThenBrowserScrolls(9000, 5000);
    revealFocusedFrame(box(-3000, 3000), true, focusTime);
    paint();
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 2414,
      behavior: "instant",
    });
  });

  test("Tab を押してから 1,000ms を超えて着いたときは、その Tab の位置を使わず、いまの位置を着く前の位置とする", () => {
    const tabTime = pressTabThenBrowserScrolls(200, 500) - 5;
    // リングの上の辺はいま 100px。古い Tab の位置（200）から数えると 400px で、どちらでも見えているが、
    // 戻す先はいまの位置なので送らない。
    revealFocusedFrame(box(100, 3000), false, tabTime + 1001);
    paint();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("1,000ms 以内の Tab の位置には戻す", () => {
    const tabTime = pressTabThenBrowserScrolls(200, 500) - 5;
    revealFocusedFrame(box(100, 3000), false, tabTime + 999);
    paint();
    expect(window.scrollTo).toHaveBeenCalledWith({
      left: 0,
      top: 200,
      behavior: "instant",
    });
  });

  test("Tab を押さずに着いたときは、いまの位置を着く前の位置とする", () => {
    vi.stubGlobal("scrollY", 500);
    revealFocusedFrame(box(100, 3000), false, 1e9);
    paint();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.scrollBy).not.toHaveBeenCalled();
  });
});
