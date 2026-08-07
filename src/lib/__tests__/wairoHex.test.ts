import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  WAIRO_HEX,
  WAIRO_INK_WHITE,
  WAIRO_INK_SUMI,
  type WairoHex,
} from "../wairoHex";
import { oklchToHex, parseOklch } from "../oklchToHex";
// 器定数の SSoT は中立モジュール utsuwaHex（fuda-image / ogp-image / 本テストの3者が import）。
// next/og に依存しない純粋な hex 定数なので ImageResponse のモックは不要。
import { PAPER, INK, INK_2, RULE, RULE_STRONG, ACCENT } from "../utsuwaHex";

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
  // DESIGN §2: 継承でなく生成 hex 値で 4.5:1（通常テキスト AA）を満たすこと。
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

describe("oklchToHex — 正典 oklch との乖離ガード", () => {
  // globals.css の :root（light）ブロックの和色 oklch を hex 化し、WAIRO_HEX と一致すること。
  // oklch→sRGB クリップによるサイレント乖離（globals.css だけ変えて hex 表を放置）を検知する。
  const cssPath = join(process.cwd(), "src/app/globals.css");
  const css = readFileSync(cssPath, "utf8");
  // ダークブロック（:root.dark）以降は除外し、light の宣言だけを対象にする。
  const lightCss = css.split(":root.dark")[0];

  function readOklchToken(name: string): string {
    // 例: "--wairo-kurenai: oklch(0.5 0.17 18);"
    const re = new RegExp(`--${name}:\\s*(oklch\\([^)]*\\))`);
    const m = lightCss.match(re);
    if (!m) throw new Error(`token --${name} not found in light globals.css`);
    return m[1];
  }

  test("中性文字色（ink-white / ink-sumi）が globals.css と一致", () => {
    const white = parseOklch(readOklchToken("wairo-ink-white"));
    const sumi = parseOklch(readOklchToken("wairo-ink-sumi"));
    expect(white).not.toBeNull();
    expect(sumi).not.toBeNull();
    expect(oklchToHex(white!.l, white!.c, white!.h)).toBe(WAIRO_INK_WHITE);
    expect(oklchToHex(sumi!.l, sumi!.c, sumi!.h)).toBe(WAIRO_INK_SUMI);
  });

  test.each(WAIRO_KEYS)(
    "%s の地色hex が globals.css の light oklch から再現できる",
    (key) => {
      const parsed = parseOklch(readOklchToken(`wairo-${key}`));
      expect(parsed).not.toBeNull();
      const regenerated = oklchToHex(parsed!.l, parsed!.c, parsed!.h);
      expect(regenerated).toBe(WAIRO_HEX[key].bg);
    },
  );

  // 器（紙・墨・罫・朱）の直書き hex 定数（utsuwaHex.ts）も、和色と同じく
  // globals.css の light トークンから生成した値。トークン名との対応（PAPER↔--paper 等）を
  // globals.css の oklch から再変換して突き合わせ、サイレント乖離を検知する。
  const CONTAINER_TOKENS: ReadonlyArray<[hex: string, token: string]> = [
    [PAPER, "paper"],
    [INK, "ink"],
    [INK_2, "ink-2"],
    [RULE, "rule"],
    [RULE_STRONG, "rule-strong"],
    [ACCENT, "accent"],
  ];

  test.each(CONTAINER_TOKENS)(
    "器定数 %s が globals.css の light トークン --%s から再現できる",
    (hex, token) => {
      const parsed = parseOklch(readOklchToken(token));
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
