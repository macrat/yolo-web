import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import RadarChart, {
  layoutRadar,
  type RadarChartAxis,
  type RadarFrame,
  type RadarLayout,
} from "../RadarChart";

// 375px の既定の字の大きさ（14px・行の高さ 17.5px）で測った値に近いもの
const frame: RadarFrame = {
  width: 320,
  lineHeight: 17.5,
  gap: 7,
  nameWidths: [28, 28, 42, 28, 28],
  valueWidths: [30, 30, 33, 30, 30],
};

// 320px の 200%（28px・行の高さ 35px）で測った値に近いもの
const narrowLarge: RadarFrame = {
  width: 266,
  lineHeight: 35,
  gap: 14,
  nameWidths: [56, 56, 84, 56, 56],
  valueWidths: [60, 60, 67, 60, 60],
};

function layoutOf(f: RadarFrame, total = 5): RadarLayout {
  const layout = layoutRadar(f, total);
  if (!layout) throw new Error("図を組めない");
  return layout;
}

function labelWidths(f: RadarFrame, showValues: boolean): number[] {
  return f.nameWidths.map((width, i) =>
    showValues ? Math.max(width, f.valueWidths[i]) : width,
  );
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function labelRects(f: RadarFrame): Rect[] {
  const layout = layoutOf(f);
  const widths = labelWidths(f, layout.showValues);
  const height = (layout.showValues ? 2 : 1) * f.lineHeight;
  return layout.labels.map((label, i) => ({
    left: label.x - widths[i] / 2,
    right: label.x + widths[i] / 2,
    top: label.top,
    bottom: label.top + height,
  }));
}

/** 点が凸の多角形の中にあるか */
function inside(
  [x, y]: [number, number],
  polygon: [number, number][],
): boolean {
  return polygon.every(([x1, y1], i) => {
    const [x2, y2] = polygon[(i + 1) % polygon.length];
    return (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1) >= 0;
  });
}

describe("layoutRadar", () => {
  test("字は図の幅に収まり、ほかの字にも、格子の外周の多角形にも重ならない", () => {
    for (const f of [frame, narrowLarge]) {
      const layout = layoutOf(f);
      const rects = labelRects(f);
      const outline = Array.from({ length: 5 }, (_, i): [number, number] => {
        const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
        return [
          layout.cx + layout.radius * Math.cos(angle),
          layout.cy + layout.radius * Math.sin(angle),
        ];
      });
      expect(inside([layout.cx, layout.cy], outline)).toBe(true);
      for (const [i, rect] of rects.entries()) {
        expect(rect.left).toBeGreaterThanOrEqual(-0.001);
        expect(rect.right).toBeLessThanOrEqual(f.width + 0.001);
        for (const corner of [
          [rect.left, rect.top],
          [rect.right, rect.top],
          [rect.right, rect.bottom],
          [rect.left, rect.bottom],
        ] as [number, number][]) {
          expect(inside(corner, outline)).toBe(false);
        }
        for (const vertex of outline) {
          const [x, y] = vertex;
          expect(
            x > rect.left && x < rect.right && y > rect.top && y < rect.bottom,
          ).toBe(false);
        }
        for (const other of rects.slice(i + 1)) {
          expect(
            rect.left < other.right &&
              other.left < rect.right &&
              rect.top < other.bottom &&
              other.top < rect.bottom,
          ).toBe(false);
        }
      }
      expect(layout.radius).toBeGreaterThan(0);
    }
  });

  test("多角形が添えた字より十分に大きければ、名前の下に数値を添える", () => {
    const layout = layoutOf(frame);
    expect(layout.showValues).toBe(true);
    expect(layout.radius).toBeGreaterThanOrEqual(4 * frame.lineHeight);
  });

  test("狭い画面で字が大きいときは、数値を外して多角形に幅を回す", () => {
    const layout = layoutOf(narrowLarge);
    expect(layout.showValues).toBe(false);
    expect(layout.radius).toBeLessThan(4 * narrowLarge.lineHeight);
  });

  test("軸の名前を置く幅が図に無ければ組めないことを返し、置ける幅になれば組む", () => {
    for (const width of [0, 60, 95]) {
      expect(layoutRadar({ ...frame, width }, 5)).toBeNull();
    }
    expect(layoutRadar({ ...frame, width: 96 }, 5)?.labels).toHaveLength(5);
  });

  test("図の高さは、多角形と添えた字の全体を含む", () => {
    for (const f of [frame, narrowLarge]) {
      const layout = layoutOf(f);
      for (const rect of labelRects(f)) {
        expect(rect.top).toBeGreaterThanOrEqual(-0.001);
        expect(rect.bottom).toBeLessThanOrEqual(layout.height + 0.001);
      }
      expect(layout.cy - layout.radius).toBeGreaterThanOrEqual(-0.001);
      expect(layout.cy + layout.radius).toBeLessThanOrEqual(
        layout.height + 0.001,
      );
    }
  });
});

describe("RadarChart", () => {
  test("頂点に点を置かず、多角形1つと格子で描き、読み上げでは名前を1つ持つ図になる", () => {
    const { container } = render(
      <RadarChart
        label="5つの軸のレーダー"
        axes={[
          { label: "理論", percent: 75 },
          { label: "実験", percent: 58 },
          { label: "数値化", percent: 100 },
          { label: "観察", percent: 24 },
          { label: "創造", percent: 0 },
        ]}
      />,
    );
    expect(
      screen.getByRole("img", { name: "5つの軸のレーダー" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("circle")).toHaveLength(0);
    expect(container.querySelectorAll("[data-radar-data]")).toHaveLength(1);
    expect(container.querySelector("svg")?.textContent).toContain("理論");
  });
});

describe("RadarChart を測り直す", () => {
  const axes5: RadarChartAxis[] = [
    { label: "理論", percent: 75 },
    { label: "実験", percent: 58 },
    { label: "数値化", percent: 100 },
    { label: "観察", percent: 24 },
    { label: "創造", percent: 0 },
  ];

  let figureWidth = 320;
  const observers: ResizeObserverCallback[] = [];

  /**
   * 図の幅を figureWidth に、字を 14px（1字の幅 14px・行の高さ 17.5px）にして測らせ、ResizeObserver の通知を
   * resizeTo で送れるようにする。この測りでは、軸の名前を置けるいちばん狭い図の幅が 96px になる。
   */
  function stubMeasurement() {
    const style = document.createElement("style");
    style.textContent = "[data-radar-name] { font-size: 14px; }";
    document.head.append(style);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
      () => figureWidth,
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        const width = (this.textContent ?? "").length * 14;
        return {
          width,
          height: 17.5,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: width,
          bottom: 17.5,
          toJSON: () => ({}),
        };
      },
    );
    vi.stubGlobal(
      "ResizeObserver",
      class {
        #callback: ResizeObserverCallback;
        constructor(callback: ResizeObserverCallback) {
          this.#callback = callback;
          observers.push(callback);
        }
        observe() {}
        unobserve() {}
        disconnect() {
          const index = observers.indexOf(this.#callback);
          if (index >= 0) observers.splice(index, 1);
        }
      },
    );
  }

  function resizeTo(width: number) {
    figureWidth = width;
    act(() => {
      for (const callback of observers) {
        callback([], {} as ResizeObserver);
      }
    });
  }

  function labelCount(container: HTMLElement): number {
    return container.querySelectorAll("svg text").length;
  }

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.head.querySelectorAll("style").forEach((style) => style.remove());
    observers.length = 0;
    figureWidth = 320;
  });

  test("幅が変わるたびに組み直し、名前を置けない幅では図を描かず、広がればまた描く", () => {
    stubMeasurement();
    const { container } = render(
      <RadarChart label="5つの軸のレーダー" axes={axes5} />,
    );
    expect(labelCount(container)).toBe(5);

    const steps: [width: number, drawn: boolean][] = [
      [266, true],
      [0, false],
      [96, true],
      [95, false],
      [100, true],
      [90, false],
      [320, true],
      [0, false],
      [266, true],
    ];
    for (const [width, drawn] of steps) {
      resizeTo(width);
      const svg = container.querySelector("svg");
      if (drawn) {
        expect(svg?.getAttribute("width")).toBe(String(width));
        expect(labelCount(container)).toBe(5);
      } else {
        expect(svg).toBeNull();
      }
    }
  });

  test("軸の数が変わっても、前の軸で測った値では組まず、いまの軸で測り直して描く", () => {
    stubMeasurement();
    const { container, rerender } = render(
      <RadarChart label="レーダー" axes={axes5} />,
    );
    expect(labelCount(container)).toBe(5);
    rerender(<RadarChart label="レーダー" axes={axes5.slice(0, 3)} />);
    expect(labelCount(container)).toBe(3);
    rerender(<RadarChart label="レーダー" axes={axes5} />);
    expect(labelCount(container)).toBe(5);
  });
});
