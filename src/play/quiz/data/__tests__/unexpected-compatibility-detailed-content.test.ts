/**
 * Tests for detailedContent on all 8 unexpected-compatibility results.
 *
 * Migration status:
 *   - all 8 results: new "unexpected-compatibility" variant format
 *
 * This test covers:
 *   - every result has detailedContent
 *   - all results use the new variant format with lifeAdvice
 *   - behaviors: exactly 4 items in new variant format
 *   - all 8 type colors meet WCAG AA contrast requirements
 * Also verifies seoTitle is set on meta.
 */
import { describe, it, expect } from "vitest";
import type { UnexpectedCompatibilityDetailedContent } from "../../types";
import unexpectedCompatibilityQuiz from "../unexpected-compatibility";

/** WCAG 2.1 相対輝度計算 */
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

/**
 * ダークモードでの色計算: color-mix(in srgb, typeColor 70%, white) をシミュレート。
 * CSSの color-mix() と同様の計算。
 */
function mixWithWhite(hex: string, ratio: number): string {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mr = Math.round(r * ratio + 255 * (1 - ratio));
  const mg = Math.round(g * ratio + 255 * (1 - ratio));
  const mb = Math.round(b * ratio + 255 * (1 - ratio));
  return (
    "#" +
    mr.toString(16).padStart(2, "0") +
    mg.toString(16).padStart(2, "0") +
    mb.toString(16).padStart(2, "0")
  );
}

const allResults = unexpectedCompatibilityQuiz.results;

describe("unexpected-compatibility detailedContent", () => {
  it("all 8 results exist", () => {
    expect(allResults.length).toBe(8);
  });

  it("every result has detailedContent", () => {
    for (const result of allResults) {
      expect(
        result.detailedContent,
        `${result.id} is missing detailedContent`,
      ).toBeDefined();
    }
  });

  it("all results use the new variant format", () => {
    for (const result of allResults) {
      expect(
        result.detailedContent?.variant,
        `${result.id}: variant must be 'unexpected-compatibility'`,
      ).toBe("unexpected-compatibility");
    }
  });

  it("all results: behaviors has exactly 4 items and each is non-empty", () => {
    for (const result of allResults) {
      const behaviors = result.detailedContent!.behaviors;
      expect(
        behaviors.length,
        `${result.id}: behaviors must have exactly 4 items`,
      ).toBe(4);
      for (const behavior of behaviors) {
        expect(
          behavior.length,
          `${result.id}: each behavior must be non-empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("all results: behaviors items are reasonably sized (10-150 chars each)", () => {
    for (const result of allResults) {
      for (const behavior of result.detailedContent!.behaviors) {
        expect(
          behavior.length,
          `${result.id}: behavior too short`,
        ).toBeGreaterThanOrEqual(10);
        expect(
          behavior.length,
          `${result.id}: behavior too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      }
    }
  });

  it("all results: lifeAdvice is a non-empty string", () => {
    for (const result of allResults) {
      const dc =
        result.detailedContent as UnexpectedCompatibilityDetailedContent;
      expect(
        dc.lifeAdvice.length,
        `${result.id}: lifeAdvice must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("unexpected-compatibility meta — resultPageLabels removed", () => {
  it("resultPageLabels is not set on meta (uses dedicated UnexpectedCompatibilityContent component)", () => {
    expect(unexpectedCompatibilityQuiz.meta.resultPageLabels).toBeUndefined();
  });
});

describe("unexpected-compatibility type colors — WCAG AA compliance", () => {
  /**
   * 各タイプの color が以下の基準を満たすことを検証する:
   * 1. ライトモード: 白背景(#ffffff)上でWCAG AA（コントラスト比4.5:1以上）
   * 2. ダークモード: color-mix(in srgb, typeColor 70%, white) 後の色が
   *    ダーク背景(#1a1a2e)上でWCAG AA（コントラスト比4.5:1以上）
   */
  const DARK_BG = "#1a1a2e";
  const WHITE_BG = "#ffffff";
  const WCAG_AA_THRESHOLD = 4.5;

  for (const result of allResults) {
    describe(`${result.id} (${result.color})`, () => {
      it("has a color defined", () => {
        expect(result.color).toBeDefined();
        expect(result.color).toMatch(/^#[0-9a-f]{6}$/i);
      });

      it(`meets WCAG AA on white background (>= ${WCAG_AA_THRESHOLD}:1)`, () => {
        const ratio = getContrastRatio(result.color!, WHITE_BG);
        expect(
          ratio,
          `${result.id} (${result.color}): white background contrast ratio ${ratio.toFixed(2)} is below WCAG AA (${WCAG_AA_THRESHOLD})`,
        ).toBeGreaterThanOrEqual(WCAG_AA_THRESHOLD);
      });

      it(`dark mode color-mix(70%, white) meets WCAG AA on dark background (>= ${WCAG_AA_THRESHOLD}:1)`, () => {
        // ダークモードのsectionHeadingはcolor-mix(in srgb, typeColor 70%, white)で描画される
        const darkModeColor = mixWithWhite(result.color!, 0.7);
        const ratio = getContrastRatio(darkModeColor, DARK_BG);
        expect(
          ratio,
          `${result.id} (${result.color}): dark mode color ${darkModeColor} on ${DARK_BG} contrast ratio ${ratio.toFixed(2)} is below WCAG AA (${WCAG_AA_THRESHOLD})`,
        ).toBeGreaterThanOrEqual(WCAG_AA_THRESHOLD);
      });
    });
  }

  it("all 8 type colors are unique", () => {
    const colors = allResults.map((r) => r.color);
    const unique = new Set(colors);
    expect(unique.size).toBe(8);
  });
});

describe("unexpected-compatibility seoTitle", () => {
  it("meta has seoTitle set", () => {
    expect(unexpectedCompatibilityQuiz.meta.seoTitle).toBeDefined();
    expect(unexpectedCompatibilityQuiz.meta.seoTitle!.length).toBeGreaterThan(
      0,
    );
  });

  it("seoTitle contains 心理テスト keyword", () => {
    const seoTitle = unexpectedCompatibilityQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("心理テスト");
  });

  it("seoTitle contains 無料 keyword", () => {
    const seoTitle = unexpectedCompatibilityQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("無料");
  });
});
