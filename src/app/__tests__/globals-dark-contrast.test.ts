/**
 * B-3: ダークモード CSS 変数のコントラスト比テスト
 *
 * globals.css の :root.dark に追加された新変数群が
 * WCAG AA を満たすことを数値で検証する。
 *
 * 使用方法: npm run test src/app/__tests__/globals-dark-contrast.test.ts
 *
 * !! 同期管理の注意 (Major-4 対応) !!
 * このテストの darkTokens は globals.css の :root.dark ブロックの値を手動コピーして
 * いる（jsdom での oklch() computed style 未対応のため）。
 * globals.css の :root.dark 内の変数値を変更した場合は、必ず以下も更新すること:
 *   1. darkTokens の対応エントリ（hex 値または oklchToHex() 引数）
 *   2. このコメントの最終同期日 → 2026-04-27
 * globals.css の :root.dark ブロック冒頭にも同じ警告コメントを記載している。
 */

import { describe, test, expect } from "vitest";

// OKLCH -> sRGB 変換
function oklchToHex(l: number, c: number, h: number): string {
  const hRad = (h * Math.PI) / 180;
  const L = l;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const lc = l_ * l_ * l_;
  const mc = m_ * m_ * m_;
  const sc = s_ * s_ * s_;

  const linearR = +4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
  const linearG = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
  const linearB = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc;

  const gamma = (v: number): number =>
    v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;

  const r = Math.round(Math.max(0, Math.min(1, gamma(linearR))) * 255);
  const g = Math.round(Math.max(0, Math.min(1, gamma(linearG))) * 255);
  const bv = Math.round(Math.max(0, Math.min(1, gamma(linearB))) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}

function hexToRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (v: number): number =>
    v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = hexToRelativeLuminance(fg);
  const l2 = hexToRelativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ダーク値（globals.css の :root.dark に追加する値と同期）
const darkTokens = {
  "--bg": "#1c1c1c",
  "--bg-soft": "#2a2a2a",
  "--bg-softer": "#383838",
  "--bg-invert": "#f0f0ed",
  "--bg-invert-soft": "#c0c0bc",
  "--fg": "#ededea",
  "--fg-soft": "#a8a8a4",
  "--fg-softer": "#9a9a96",
  "--fg-invert": "#1c1c1c",
  "--fg-invert-soft": "#2a2a2a",
  "--accent": oklchToHex(0.76, 0.19, 264),
  "--accent-strong": oklchToHex(0.88, 0.14, 264),
  "--accent-soft": oklchToHex(0.22, 0.06, 264),
  "--success": oklchToHex(0.76, 0.14, 162),
  "--success-strong": oklchToHex(0.88, 0.1, 162),
  "--success-soft": oklchToHex(0.22, 0.06, 162),
  "--warning": oklchToHex(0.76, 0.14, 80),
  "--warning-strong": oklchToHex(0.88, 0.1, 80),
  "--warning-soft": oklchToHex(0.22, 0.06, 80),
  "--danger": oklchToHex(0.76, 0.18, 35),
  "--danger-strong": oklchToHex(0.88, 0.13, 35),
  "--danger-soft": oklchToHex(0.22, 0.06, 35),
} as const;

type TokenKey = keyof typeof darkTokens;

function check(fg: TokenKey, bg: TokenKey, minRatio: number): void {
  const ratio = contrastRatio(darkTokens[fg], darkTokens[bg]);
  expect(
    ratio,
    `${fg} on ${bg}: ${ratio.toFixed(2)}:1 (need >= ${minRatio})`,
  ).toBeGreaterThanOrEqual(minRatio);
}

describe("ダーク変数の WCAG AA コントラスト", () => {
  describe("テキスト（4.5:1 以上）", () => {
    test("--fg on --bg", () => check("--fg", "--bg", 4.5));
    test("--fg-soft on --bg", () => check("--fg-soft", "--bg", 4.5));
    test("--fg-softer on --bg", () => check("--fg-softer", "--bg", 4.5));
    test("--fg-invert on --bg-invert (primary button)", () =>
      check("--fg-invert", "--bg-invert", 4.5));
    test("--fg-invert on --bg-invert-soft (primary hover)", () =>
      check("--fg-invert", "--bg-invert-soft", 4.5));
  });

  describe("アクセント（テキスト 4.5:1 / UI 3:1）", () => {
    test("--accent on --bg (text)", () => check("--accent", "--bg", 4.5));
    test("--accent on --bg-soft (focus ring 3:1)", () =>
      check("--accent", "--bg-soft", 3.0));
  });

  describe("Status on soft-bg（4.5:1 以上）", () => {
    test("--success on --success-soft", () =>
      check("--success", "--success-soft", 4.5));
    test("--success-strong on --success-soft", () =>
      check("--success-strong", "--success-soft", 4.5));
    test("--warning on --warning-soft", () =>
      check("--warning", "--warning-soft", 4.5));
    test("--warning-strong on --warning-soft", () =>
      check("--warning-strong", "--warning-soft", 4.5));
    test("--danger on --danger-soft", () =>
      check("--danger", "--danger-soft", 4.5));
    test("--danger-strong on --danger-soft", () =>
      check("--danger-strong", "--danger-soft", 4.5));
  });

  describe("hover 後のコントラスト（4.5:1 以上）", () => {
    // ghost button hover: fg on bg-softer
    test("dark ghost hover: --fg on --bg-softer", () =>
      check("--fg", "--bg-softer", 4.5));
    // primary button hover: fg-invert on bg-invert-soft（Major-2 で追加）
    test("dark primary hover: --fg-invert on --bg-invert-soft", () =>
      check("--fg-invert", "--bg-invert-soft", 4.5));
    // danger button hover: danger-strong on danger-soft
    test("dark danger hover: --danger-strong on --danger-soft", () =>
      check("--danger-strong", "--danger-soft", 4.5));
  });
});
