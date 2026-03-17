/**
 * WCAG 2.1準拠のコントラスト計算ユーティリティ。
 * CTAボタンなど、背景色に対して適切なテキスト色を選択するために使用する。
 */

/**
 * sRGBの8bit値（0-255）をWCAG 2.1の相対輝度計算用のリニア値に変換する。
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function sRGBChannelToLinear(channel8bit: number): number {
  const sRGB = channel8bit / 255;
  if (sRGB <= 0.04045) {
    return sRGB / 12.92;
  }
  return Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

/**
 * 16進数カラー文字列をRGBコンポーネント（各0-255）に分解する。
 * 先頭の # は省略可。
 */
function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

/**
 * WCAG 2.1の相対輝度（Relative Luminance）を計算する。
 * 戻り値は0（最暗）〜1（最明）の範囲。
 */
function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRGB(hex);
  const R = sRGBChannelToLinear(r);
  const G = sRGBChannelToLinear(g);
  const B = sRGBChannelToLinear(b);
  // ITU-R BT.709の輝度係数
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * 2色間のWCAG 2.1コントラスト比を計算する。
 * 戻り値は1:1〜21:1の範囲。
 */
function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = getRelativeLuminance(hexA);
  const lumB = getRelativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA基準の最小コントラスト比（通常テキスト） */
const WCAG_AA_MIN_CONTRAST = 4.5;

/** 暗い背景用のフォールバックテキスト色（ほぼ黒） */
const DARK_TEXT_COLOR = "#1a1a1a";

/** 明るい背景用テキスト色（白） */
const LIGHT_TEXT_COLOR = "#ffffff";

/**
 * 背景色に対してWCAG AA基準（コントラスト比4.5:1以上）を満たすテキスト色を返す。
 *
 * - 白文字（#ffffff）との比が4.5:1以上 → "#ffffff" を返す
 * - そうでなければ暗いテキスト色（#1a1a1a）を返す
 *
 * @param hexColor - 背景の16進数カラー文字列（例: "#6c5ce7"）
 * @returns WCAG AAを満たすテキスト色の16進数文字列
 */
export function getContrastTextColor(hexColor: string): string {
  const contrastWithWhite = getContrastRatio(hexColor, LIGHT_TEXT_COLOR);
  if (contrastWithWhite >= WCAG_AA_MIN_CONTRAST) {
    return LIGHT_TEXT_COLOR;
  }
  return DARK_TEXT_COLOR;
}
