import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  WAIRO_HEX,
  WAIRO_INK_WHITE,
  WAIRO_INK_SUMI,
  pickResultWairoColor,
  type WairoHex,
} from "../wairoHex";
import { oklchToHex, parseOklch } from "../oklchToHex";
import { PAPER, INK, INK_2, RULE, RULE_2, PAPER_DARK } from "../utsuwaHex";

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

describe("utsuwaHex — globals.css のトークンとの一致", () => {
  // 札の画像の紙・墨・罫の hex（utsuwaHex.ts）を、globals.css の oklch から変換し直して
  // 突き合わせる。dark の値は prefers-color-scheme: dark のブロックにあり、それより前が light。
  const cssPath = join(process.cwd(), "src/app/globals.css");
  const css = readFileSync(cssPath, "utf8");
  const [lightCss, darkCss] = css.split("@media (prefers-color-scheme: dark)");

  function readOklchTokenIn(block: string, name: string): string {
    const re = new RegExp(`--${name}:\\s*(oklch\\([^)]*\\))`);
    const m = block.match(re);
    if (!m) throw new Error(`token --${name} not found in globals.css`);
    return m[1];
  }
  const readOklchToken = (name: string): string =>
    readOklchTokenIn(lightCss, name);

  const CONTAINER_TOKENS: ReadonlyArray<[hex: string, token: string]> = [
    [PAPER, "paper"],
    [INK, "ink"],
    [INK_2, "ink-2"],
    // --rule は var(--ink) なので、墨の oklch と突き合わせる。
    [RULE, "ink"],
    [RULE_2, "rule-2"],
  ];

  test.each(CONTAINER_TOKENS)(
    "%s が globals.css の light トークン --%s から再現できる",
    (hex, token) => {
      const parsed = parseOklch(readOklchToken(token));
      expect(parsed).not.toBeNull();
      expect(oklchToHex(parsed!.l, parsed!.c, parsed!.h)).toBe(hex);
    },
  );

  const CONTAINER_DARK_TOKENS: ReadonlyArray<[hex: string, token: string]> = [
    [PAPER_DARK, "paper"],
  ];

  test.each(CONTAINER_DARK_TOKENS)(
    "%s が globals.css の dark トークン --%s から再現できる",
    (hex, token) => {
      const parsed = parseOklch(readOklchTokenIn(darkCss, token));
      expect(parsed).not.toBeNull();
      expect(oklchToHex(parsed!.l, parsed!.c, parsed!.h)).toBe(hex);
    },
  );
});

describe("parseOklch", () => {
  test("L C H を取り出す", () => {
    expect(parseOklch("oklch(0.5 0.17 18)")).toEqual({
      l: 0.5,
      c: 0.17,
      h: 18,
    });
  });
  test("alpha 付きは先頭3値だけ取る", () => {
    expect(parseOklch("oklch(0.51 0.16 32 / 0.12)")).toEqual({
      l: 0.51,
      c: 0.16,
      h: 32,
    });
  });
  test("非 oklch は null", () => {
    expect(parseOklch("#ffffff")).toBeNull();
  });
});
