import { describe, expect, test } from "vitest";
import { hexToOklch } from "../hexToOklch";
import { oklchToHex } from "../oklchToHex";

describe("hexToOklch", () => {
  test("白と黒は、明るさが両端でクロマが 0", () => {
    expect(hexToOklch("#ffffff").l).toBeCloseTo(1, 3);
    expect(hexToOklch("#000000").l).toBeCloseTo(0, 3);
    expect(hexToOklch("#808080").c).toBeCloseTo(0, 3);
  });

  test("oklchToHex で戻すと同じ色になる", () => {
    for (const hex of ["#eea9a9", "#ab3b3a", "#0089a7", "#8f77b5", "#f7c242"]) {
      const { l, c, h } = hexToOklch(hex);
      expect(oklchToHex(l, c, h)).toBe(hex);
    }
  });

  test("色相は 0 以上 360 未満", () => {
    const { h } = hexToOklch("#ff00ff");
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
  });
});
