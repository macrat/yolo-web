import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { revealControl } from "../revealControl";

function elementAt(top: number, bottom: number): Element {
  const element = document.createElement("div");
  element.getBoundingClientRect = () =>
    ({
      top,
      bottom,
      left: 0,
      right: 100,
      width: 100,
      height: bottom - top,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
  return element;
}

function setVisualViewport(
  value: { offsetTop: number; height: number } | null,
) {
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value,
  });
}

const scrollBy = vi.fn();

beforeEach(() => {
  scrollBy.mockReset();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 667,
  });
});

afterEach(() => {
  setVisualViewport(null);
});

describe("visualViewport があるとき", () => {
  test("文字盤で縮んだ画面の下端（offsetTop + height）で測り、下端から 8px 上まで送る", () => {
    setVisualViewport({ offsetTop: 0, height: 400 });
    revealControl(elementAt(420, 468));
    expect(scrollBy).toHaveBeenCalledWith({ top: 76, behavior: "instant" });
  });

  test("visualViewport が送られているときは offsetTop を足した位置を下端にする", () => {
    setVisualViewport({ offsetTop: 100, height: 400 });
    revealControl(elementAt(420, 468));
    expect(scrollBy).not.toHaveBeenCalled();

    revealControl(elementAt(460, 520));
    expect(scrollBy).toHaveBeenCalledWith({ top: 28, behavior: "instant" });
  });

  test("innerHeight の中でも visualViewport の外なら送る", () => {
    setVisualViewport({ offsetTop: 0, height: 400 });
    revealControl(elementAt(500, 548));
    expect(scrollBy).toHaveBeenCalledWith({ top: 156, behavior: "instant" });
  });
});

describe("visualViewport が無いとき", () => {
  test("innerHeight を画面の下端にする", () => {
    setVisualViewport(null);
    revealControl(elementAt(640, 688));
    expect(scrollBy).toHaveBeenCalledWith({ top: 29, behavior: "instant" });
  });

  test("画面の中にあれば送らない", () => {
    setVisualViewport(null);
    revealControl(elementAt(512, 560));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  test("下端がちょうど画面の下端でも、画面の中として送らない", () => {
    setVisualViewport(null);
    revealControl(elementAt(619, 667));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  test("画面の上へ出ていれば、下端が画面の下端から 8px 上に来るまで戻す", () => {
    setVisualViewport(null);
    revealControl(elementAt(-60, -12));
    expect(scrollBy).toHaveBeenCalledWith({ top: -671, behavior: "instant" });
  });
});

describe("一緒に見せるもの（context）", () => {
  test("コントロールと context がどちらも画面の中なら送らない", () => {
    setVisualViewport(null);
    revealControl(elementAt(600, 644), elementAt(200, 300));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  test("コントロールが画面の中でも context が上に出ていれば、コントロールの下端を画面の下端から 8px 上に置く", () => {
    setVisualViewport(null);
    revealControl(elementAt(400, 444), elementAt(-40, 50));
    expect(scrollBy).toHaveBeenCalledWith({ top: -215, behavior: "instant" });
  });

  test("両方が入らないときも、コントロールの下端で位置を決め、コントロールを画面に入れる", () => {
    setVisualViewport(null);
    revealControl(elementAt(769, 813), elementAt(-100, 200));
    expect(scrollBy).toHaveBeenCalledWith({ top: 154, behavior: "instant" });
  });
});
