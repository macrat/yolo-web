import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import FittedNumber from "@/components/FittedNumber";

/** 段ごとの1行の幅。置かれた幅（containerWidth）と比べて、収まるかを決める。 */
const LINE_WIDTH: Record<string, number> = {
  main: 400,
  section: 300,
  sub: 200,
  body: 150,
};

let containerWidth = 1000;
let resize: (() => void) | undefined;

beforeEach(() => {
  containerWidth = 1000;
  resize = undefined;
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
    () => containerWidth,
  );
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(
    function (this: HTMLElement) {
      const width = LINE_WIDTH[this.dataset.step ?? ""] ?? 0;
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
    expect(number.innerHTML).toBe("1,<wbr>234,<wbr>567文字");
    expect(number.textContent).toBe("1,234,567文字");
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
});
