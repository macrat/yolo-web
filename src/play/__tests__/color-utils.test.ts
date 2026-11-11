import { describe, test, expect } from "vitest";
import { getContrastTextColor } from "../color-utils";
import traditionalColorQuiz from "../quiz/data/traditional-color";

describe("getContrastTextColor", () => {
  // 暗い色 — 白文字のコントラスト比が4.5:1以上になるはずの色
  test("暗い紺色(#003366)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#003366")).toBe("#ffffff");
  });

  test("黒(#000000)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#000000")).toBe("#ffffff");
  });

  test("濃い赤(#8b0000)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#8b0000")).toBe("#ffffff");
  });

  test("濃い緑(#006400)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#006400")).toBe("#ffffff");
  });

  // 明るい色 — 白文字のコントラスト比が4.5:1未満になるはずの色
  test("白(#ffffff)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#ffffff")).toBe("#1a1a1a");
  });

  test("明るい黄色(#ffff00)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#ffff00")).toBe("#1a1a1a");
  });

  test("明るいシアン(#00ffff)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#00ffff")).toBe("#1a1a1a");
  });

  test("明るい緑(#00cc44)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#00cc44")).toBe("#1a1a1a");
  });

  // 境界値付近のテスト
  test("中間グレー(#767676)に対して白(#ffffff)を返す（コントラスト比ちょうど4.5:1近辺）", () => {
    // #767676 は白文字とのコントラスト比が約4.54:1 で4.5:1以上のため、白を返す
    expect(getContrastTextColor("#767676")).toBe("#ffffff");
  });

  test("やや暗いグレー(#595959)に対して白(#ffffff)を返す", () => {
    // #595959 は白とのコントラスト比が約7:1
    expect(getContrastTextColor("#595959")).toBe("#ffffff");
  });

  test("紫(#6c5ce7)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#6c5ce7")).toBe("#ffffff");
  });

  test("明るいオレンジ(#fdcb6e)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#fdcb6e")).toBe("#1a1a1a");
  });
});

/**
 * 伝統色診断の結果の色（札の記号面の地になる）すべてに対して、WCAG AA（4.5:1）を満たす
 * 字の色が選ばれることを確かめる。
 */
describe("伝統色診断の結果の色に対するWCAG AAコントラスト比検証", () => {
  /** WCAG 2.1の相対輝度計算（テスト内での検証用） */
  function sRGBChannelToLinear(channel8bit: number): number {
    const sRGB = channel8bit / 255;
    if (sRGB <= 0.04045) return sRGB / 12.92;
    return Math.pow((sRGB + 0.055) / 1.055, 2.4);
  }

  function getRelativeLuminance(hex: string): number {
    const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return (
      0.2126 * sRGBChannelToLinear(r) +
      0.7152 * sRGBChannelToLinear(g) +
      0.0722 * sRGBChannelToLinear(b)
    );
  }

  function getContrastRatio(hexA: string, hexB: string): number {
    const lumA = getRelativeLuminance(hexA);
    const lumB = getRelativeLuminance(hexB);
    const lighter = Math.max(lumA, lumB);
    const darker = Math.min(lumA, lumB);
    return (lighter + 0.05) / (darker + 0.05);
  }

  for (const { id: name, color } of traditionalColorQuiz.results) {
    test(`${name}(${color})の字の色がWCAG AA（4.5:1）を満たす`, () => {
      if (!color) throw new Error(`${name}: color がない`);
      const textColor = getContrastTextColor(color);
      const ratio = getContrastRatio(color, textColor);
      expect(
        ratio,
        `${name}(${color}): テキスト色${textColor}とのコントラスト比${ratio.toFixed(2)}がWCAG AA（4.5:1）を下回っています`,
      ).toBeGreaterThanOrEqual(4.5);
    });
  }
});
