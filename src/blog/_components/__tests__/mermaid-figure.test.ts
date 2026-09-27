import { describe, test, expect } from "vitest";
import { planFigure, toHexColor, widenGantt } from "../mermaid-figure";

describe("toHexColor", () => {
  test("8ビットの成分を2桁ずつの hex にする", () => {
    expect(toHexColor(252, 252, 252)).toBe("#fcfcfc");
    expect(toHexColor(0, 10, 255)).toBe("#000aff");
  });
});

describe("planFigure", () => {
  test("コンテンツ幅に収まる図は元の大きさで描く", () => {
    expect(planFigure(500, 922, 16, 14)).toEqual({ scale: 1, fits: true });
  });

  test("収まらない図は、字が下限を下回らない範囲で幅に合わせて縮める", () => {
    const plan = planFigure(1000, 922, 16, 14);
    expect(plan.fits).toBe(true);
    expect(plan.scale).toBeCloseTo(0.922);
  });

  test("字が下限を下回るほど縮めないと収まらない図は、下限の大きさで横に送る", () => {
    const plan = planFigure(1000, 327, 16, 14);
    expect(plan.fits).toBe(false);
    expect(plan.scale).toBeCloseTo(14 / 16);
  });

  test("ちょうど下限の倍率で収まる図は、送らない", () => {
    expect(planFigure(1000, 875, 16, 14)).toEqual({
      scale: 0.875,
      fits: true,
    });
  });

  test("元から下限より小さい字を持つ図は、下限まで大きくする", () => {
    const plan = planFigure(300, 922, 10, 14);
    expect(plan.scale).toBeCloseTo(1.4);
    expect(plan.fits).toBe(true);
  });
});

describe("widenGantt", () => {
  const layout = { useWidth: 640, leftPadding: 75, rightPadding: 75 };

  test("目盛りの字が重ならず、区分の名前が余白に収まれば描き直さない", () => {
    const ticks = [0, 50, 100].map((center) => ({ center, width: 40 }));
    expect(widenGantt(layout, ticks, 60, 8)).toBeNull();
  });

  test("目盛りの字が重なるときは、いちばん詰まった所が gap を空けて並ぶまで時間の軸を広げる", () => {
    const ticks = [
      { center: 0, width: 40 },
      { center: 20, width: 40 },
      { center: 60, width: 40 },
    ];
    // 詰まった所は (40 + 40) / 2 + 8 = 48 が要り、間は 20 なので 2.4 倍にする。
    expect(widenGantt(layout, ticks, 60, 8)).toEqual({
      useWidth: Math.ceil(490 * 2.4) + 150,
      leftPadding: 75,
      rightPadding: 75,
    });
  });

  test("区分の名前が左の余白からはみ出すときは、余白を名前の右端から gap の所まで広げる", () => {
    const ticks = [0, 100].map((center) => ({ center, width: 40 }));
    expect(widenGantt(layout, ticks, 106, 8)).toEqual({
      useWidth: 490 + 114 + 75,
      leftPadding: 114,
      rightPadding: 75,
    });
  });
});
