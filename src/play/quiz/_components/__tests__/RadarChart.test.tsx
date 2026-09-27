import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import RadarChart, { layoutRadar, type RadarFrame } from "../RadarChart";

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
  const layout = layoutRadar(f, 5);
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
      const layout = layoutRadar(f, 5);
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
    const layout = layoutRadar(frame, 5);
    expect(layout.showValues).toBe(true);
    expect(layout.radius).toBeGreaterThanOrEqual(4 * frame.lineHeight);
  });

  test("狭い画面で字が大きいときは、数値を外して多角形に幅を回す", () => {
    const layout = layoutRadar(narrowLarge, 5);
    expect(layout.showValues).toBe(false);
    expect(layout.radius).toBeLessThan(4 * narrowLarge.lineHeight);
  });

  test("図の高さは、多角形と添えた字の全体を含む", () => {
    for (const f of [frame, narrowLarge]) {
      const layout = layoutRadar(f, 5);
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
