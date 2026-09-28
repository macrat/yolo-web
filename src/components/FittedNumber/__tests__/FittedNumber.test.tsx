import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import FittedNumber from "@/components/FittedNumber";

/**
 * 段ごとの1行の幅（既定の文字の大きさ・読み込んだ Web フォントでの幅）。字の大きさの倍率（scale）を掛けて、
 * 置かれた幅（containerWidth）と比べて収まるかを決める。
 */
const LINE_WIDTH: Record<string, number> = {
  main: 400,
  section: 300,
  sub: 200,
  body: 150,
};

let containerWidth = 1000;
/** 既定の文字の大きさの倍率。1rem の見本の幅にも、字の幅にも効く。 */
let rootScale = 1;
/** Web フォントの字の幅の倍率。 */
let fontScale = 1;
let resize: (() => void) | undefined;
let fonts: EventTarget;

beforeEach(() => {
  containerWidth = 1000;
  rootScale = 1;
  fontScale = 1;
  resize = undefined;
  fonts = new EventTarget();
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: fonts,
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
    () => 16 * rootScale,
  );
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
    () => containerWidth,
  );
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(
    function (this: HTMLElement) {
      const width =
        (LINE_WIDTH[this.dataset.step ?? ""] ?? 0) * rootScale * fontScale;
      return Math.max(width, containerWidth);
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  Reflect.deleteProperty(document, "fonts");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderNumber(width: number) {
  containerWidth = width;
  render(
    <div>
      <FittedNumber segments={["1,", "234,", "567文字"]} />
    </div>,
  );
  return screen.getByText("1,234,567文字");
}

describe("FittedNumber", () => {
  test("並びのあいだにだけ折り所の <wbr> を置き、字は元の文のまま", () => {
    const number = renderNumber(1000);
    expect(number.textContent).toBe("1,234,567文字");
    const breaks = [...number.childNodes].map((node) =>
      node.nodeName === "WBR" ? "|" : (node.textContent ?? ""),
    );
    expect(breaks.join("")).toBe("1,|234,|567文字");
  });

  test("置かれた幅に収まれば主見出しの段で組む", () => {
    expect(renderNumber(1000).dataset.step).toBe("main");
  });

  test("収まらなければ、1行に収まる段まで下げる", () => {
    expect(renderNumber(350).dataset.step).toBe("section");
  });

  test("どの見出しの段にも収まらなければ、本文の大きさで組む", () => {
    expect(renderNumber(100).dataset.step).toBe("body");
  });

  test("置かれた幅が変わったら選び直す", () => {
    const number = renderNumber(1000);
    containerWidth = 250;
    act(() => resize?.());
    expect(number.dataset.step).toBe("sub");
    containerWidth = 1000;
    act(() => resize?.());
    expect(number.dataset.step).toBe("main");
  });

  test("数が変わったら選び直す", () => {
    containerWidth = 350;
    const { rerender } = render(
      <div>
        <FittedNumber segments={["5文字"]} />
      </div>,
    );
    expect(screen.getByText("5文字").dataset.step).toBe("section");
    containerWidth = 1000;
    rerender(
      <div>
        <FittedNumber segments={["50文字"]} />
      </div>,
    );
    expect(screen.getByText("50文字").dataset.step).toBe("main");
  });

  test("既定の文字の大きさが変わったら、置かれた幅が同じでも選び直す", () => {
    const number = renderNumber(500);
    expect(number.dataset.step).toBe("main");
    rootScale = 2;
    act(() => resize?.());
    expect(number.dataset.step).toBe("sub");
    rootScale = 1;
    act(() => resize?.());
    expect(number.dataset.step).toBe("main");
  });

  test("Web フォントを読み込んで字の幅が変わったら選び直す", () => {
    const number = renderNumber(500);
    expect(number.dataset.step).toBe("main");
    fontScale = 1.5;
    act(() => {
      fonts.dispatchEvent(new Event("loadingdone"));
    });
    expect(number.dataset.step).toBe("section");
  });

  test("置かれた幅も文字の大きさも変わらない変化（高さの変化）では選び直さない", () => {
    const number = renderNumber(350);
    expect(number.dataset.step).toBe("section");
    number.dataset.step = "main";
    act(() => resize?.());
    expect(number.dataset.step).toBe("main");
  });
});
