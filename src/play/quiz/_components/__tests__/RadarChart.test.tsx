import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import RadarChart, { layoutRadar } from "../RadarChart";

const frame = {
  width: 320,
  lineHeight: 17.5,
  gap: 7,
  labelWidths: [33, 33, 42, 33, 33],
};

describe("layoutRadar", () => {
  test("横に置く字が図の幅に収まる半径で描く", () => {
    const layout = layoutRadar(frame, 5);
    for (const [i, label] of layout.labels.entries()) {
      const width = frame.labelWidths[i];
      const left =
        label.anchor === "start"
          ? label.x
          : label.anchor === "end"
            ? label.x - width
            : label.x - width / 2;
      expect(left).toBeGreaterThanOrEqual(-0.001);
      expect(left + width).toBeLessThanOrEqual(frame.width + 0.001);
    }
    expect(layout.radius).toBeGreaterThan(0);
  });

  test("字が大きくなると、字を縮めずに多角形を小さくする", () => {
    const large = layoutRadar(
      {
        width: 266,
        lineHeight: 35,
        gap: 14,
        labelWidths: [56, 67, 84, 56, 56],
      },
      5,
    );
    expect(large.radius).toBeLessThan(layoutRadar(frame, 5).radius);
    expect(large.radius).toBeGreaterThan(0);
  });

  test("図の高さは、多角形と字の2行の全体を含む", () => {
    const layout = layoutRadar(frame, 5);
    for (const label of layout.labels) {
      expect(label.top).toBeGreaterThanOrEqual(-0.001);
      expect(label.top + 2 * frame.lineHeight).toBeLessThanOrEqual(
        layout.height + 0.001,
      );
    }
    expect(layout.cy - layout.radius).toBeGreaterThanOrEqual(-0.001);
  });
});

describe("RadarChart", () => {
  test("多角形の面を塗らず、軸の名前と割合を添える", () => {
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
    const chart = screen.getByRole("img", { name: "5つの軸のレーダー" });
    expect(chart.textContent).toContain("理論75%");
    expect(chart.textContent).toContain("創造0%");
    for (const polygon of container.querySelectorAll("polygon")) {
      expect(polygon.getAttribute("fill")).toBeNull();
      expect(polygon.getAttribute("fill-opacity")).toBeNull();
    }
  });
});
