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
import {
  PAPER,
  INK,
  INK_2,
  RULE,
  RULE_STRONG,
  ACCENT,
  PAPER_DARK,
  INK_DARK,
  INK_2_DARK,
  RULE_DARK,
  RULE_STRONG_DARK,
  ACCENT_DARK,
} from "../utsuwaHex";

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

describe("oklchToHex — 出どころ oklch との乖離ガード", () => {
  // globals.css のトークンを hex 化し、直書き hex 表と一致すること。
  // oklch→sRGB クリップによるサイレント乖離（globals.css だけ変えて hex 表を放置）を検知する。
  const cssPath = join(process.cwd(), "src/app/globals.css");
  const css = readFileSync(cssPath, "utf8");
  // light は :root、dark は :root.dark。同名トークンが両方にあるので、
  // ブロックを切り分けてから読む——切らないと dark の値を light として拾う。
  const DARK_SELECTOR = ":root.dark";
  const lightCss = css.split(DARK_SELECTOR)[0];
  const darkCss = css.split(DARK_SELECTOR)[1]?.split("}")[0] ?? "";

  function readOklchToken(block: string, name: string): string {
    // 例: "--wairo-kurenai: oklch(0.5 0.17 18);"
    const re = new RegExp(`--${name}:\\s*(oklch\\([^)]*\\))`);
    const m = block.match(re);
    if (!m) throw new Error(`token --${name} not found`);
    return m[1];
  }

  function hexOfToken(block: string, name: string): string {
    const parsed = parseOklch(readOklchToken(block, name));
    expect(parsed).not.toBeNull();
    return oklchToHex(parsed!.l, parsed!.c, parsed!.h);
  }

  test("中性文字色（ink-white / ink-sumi）が globals.css と一致", () => {
    expect(hexOfToken(lightCss, "wairo-ink-white")).toBe(WAIRO_INK_WHITE);
    expect(hexOfToken(lightCss, "wairo-ink-sumi")).toBe(WAIRO_INK_SUMI);
  });

  test.each(WAIRO_KEYS)(
    "%s の地色hex が globals.css の light oklch から再現できる",
    (key) => {
      expect(hexOfToken(lightCss, `wairo-${key}`)).toBe(WAIRO_HEX[key].bg);
    },
  );

  // DESIGN §2 は和色に「light/dark の AA 検証値を持たせる」ことを求めている。
  // WAIRO_HEX は札画像（1枚の PNG）のための light 固定表なので、ダークの地色は
  // この表に載らない——載らないものは誰も検査しない。画面のダークで和色の上の
  // 文字が読めるかは、globals.css の `:root.dark` から直に測る。
  // 文字色は両モード共通なので、light と同じ `on` を当てる。
  test.each(WAIRO_KEYS)("%s はダークの地色×文字色が AA 4.5:1 以上", (key) => {
    const darkBg = hexOfToken(darkCss, `wairo-${key}`);
    expect(contrastRatio(darkBg, WAIRO_HEX[key].on)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  // 器（紙・墨・罫・朱）の直書き hex 定数（utsuwaHex.ts）も、和色と同じく
  // globals.css のトークンから生成した値。トークン名との対応（PAPER↔--paper 等）を
  // globals.css の oklch から再変換して突き合わせ、サイレント乖離を検知する。
  // light と dark を同じ網に掛ける——片方だけ見張ると、見張られていない側が静かにずれる。
  const CONTAINER_TOKENS: ReadonlyArray<
    [hex: string, token: string, mode: "light" | "dark"]
  > = [
    [PAPER, "paper", "light"],
    [INK, "ink", "light"],
    [INK_2, "ink-2", "light"],
    [RULE, "rule", "light"],
    [RULE_STRONG, "rule-strong", "light"],
    [ACCENT, "accent", "light"],
    [PAPER_DARK, "paper", "dark"],
    [INK_DARK, "ink", "dark"],
    [INK_2_DARK, "ink-2", "dark"],
    [RULE_DARK, "rule", "dark"],
    [RULE_STRONG_DARK, "rule-strong", "dark"],
    [ACCENT_DARK, "accent", "dark"],
  ];

  test.each(CONTAINER_TOKENS)(
    "器定数 %s が globals.css の %s トークン（%s）から再現できる",
    (hex, token, mode) => {
      expect(hexOfToken(mode === "light" ? lightCss : darkCss, token)).toBe(
        hex,
      );
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
