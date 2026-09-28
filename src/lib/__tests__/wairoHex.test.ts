import { describe, expect, test } from "vitest";
import {
  WAIRO_HEX,
  WAIRO_INK_WHITE,
  WAIRO_INK_SUMI,
  pickResultWairoColor,
  type WairoHex,
} from "../wairoHex";

/** WCAG 2.1 相対輝度・コントラスト比を hex から計算する（AA 再計測用・sRGB）。 */
function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}
function channelToLinear(c8: number): number {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(channelToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

const WAIRO_KEYS = Object.keys(WAIRO_HEX) as Array<keyof typeof WAIRO_HEX>;

describe("WAIRO_HEX — AA を生成 hex 値そのもので再計測", () => {
  // 継承でなく生成 hex 値で 4.5:1（通常テキスト AA）を満たすこと。
  test.each(WAIRO_KEYS)("%s は地色×文字色が AA 4.5:1 以上", (key) => {
    const { bg, on }: WairoHex = WAIRO_HEX[key];
    expect(contrastRatio(bg, on)).toBeGreaterThanOrEqual(4.5);
  });

  test("文字色は中性の白/墨のいずれかのみ（両モード共通）", () => {
    for (const key of WAIRO_KEYS) {
      expect([WAIRO_INK_WHITE, WAIRO_INK_SUMI]).toContain(WAIRO_HEX[key].on);
    }
  });
});

describe("pickResultWairoColor", () => {
  test("同じ id は常に同じ色", () => {
    expect(pickResultWairoColor("blazing-strategist")).toBe(
      pickResultWairoColor("blazing-strategist"),
    );
  });

  test("返す色は WAIRO_HEX のキー", () => {
    for (const id of ["blazing-strategist", "ai", "sakura", ""]) {
      expect(WAIRO_KEYS).toContain(pickResultWairoColor(id));
    }
  });
});
