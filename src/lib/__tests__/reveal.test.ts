import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { revealFocusedFrame, revealResult, visibleRange } from "../reveal";

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
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: () => void) => {
      callback();
      return 0;
    });
    vi.stubGlobal("getComputedStyle", () => ({
      outlineOffset: "3px",
      outlineWidth: "3px",
    }));
  });

  test("リングの上端が画面の上に隠れていれば、上端から 8px 下に来るまで送る", () => {
    revealFocusedFrame(box(-7000, 3000));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -7014,
      behavior: "instant",
    });
  });

  test("リングの上端が画面の下にあれば、上端から 8px 下に来るまで送る", () => {
    revealFocusedFrame(box(700, 3000));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 686,
      behavior: "instant",
    });
  });

  test("リングの上端が画面にあれば送らない", () => {
    revealFocusedFrame(box(100, 3000));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });
});
