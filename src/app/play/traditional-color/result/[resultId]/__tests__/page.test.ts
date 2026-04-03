/**
 * traditional-color 専用結果ページのテスト。
 * generateStaticParams と detailedContent variant の動作を検証する。
 */

import { describe, it, expect } from "vitest";
import traditionalColorQuiz from "@/play/quiz/data/traditional-color";
import { getResultIdsForQuiz } from "@/play/quiz/registry";

// ============================================================
// WCAGコントラスト計算ヘルパー（テスト内部用）
// ============================================================

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

/** WCAG AA 通常テキスト最小コントラスト比 */
const WCAG_AA = 4.5;

/**
 * color-mix(in srgb, color 70%, white) の近似計算。
 * ブラウザの color-mix の挙動をJS上でシミュレートする。
 */
function colorMixWithWhite70(hex: string): string {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  // 70% type-color + 30% white (#ffffff = 255,255,255)
  const mixR = Math.round(r * 0.7 + 255 * 0.3);
  const mixG = Math.round(g * 0.7 + 255 * 0.3);
  const mixB = Math.round(b * 0.7 + 255 * 0.3);
  return `#${mixR.toString(16).padStart(2, "0")}${mixG.toString(16).padStart(2, "0")}${mixB.toString(16).padStart(2, "0")}`;
}

/**
 * color-mix(in srgb, color 70%, black) の近似計算。
 * ライトモードでのキャッチコピー色を暗くするために使用。
 */
function colorMixWithBlack70(hex: string): string {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  // 70% type-color + 30% black (#000000 = 0,0,0)
  const mixR = Math.round(r * 0.7);
  const mixG = Math.round(g * 0.7);
  const mixB = Math.round(b * 0.7);
  return `#${mixR.toString(16).padStart(2, "0")}${mixG.toString(16).padStart(2, "0")}${mixB.toString(16).padStart(2, "0")}`;
}

const SLUG = "traditional-color";
const EXPECTED_TYPE_IDS = [
  "ai",
  "shu",
  "wakakusa",
  "fuji",
  "yamabuki",
  "kon",
  "sakura",
  "hisui",
];

describe("traditional-color 専用結果ページ: generateStaticParams", () => {
  it("全8タイプのIDを返す", () => {
    const ids = getResultIdsForQuiz(SLUG);
    expect(ids).toHaveLength(8);
    for (const id of EXPECTED_TYPE_IDS) {
      expect(ids).toContain(id);
    }
  });

  it("各IDに対応するresultが存在する", () => {
    const ids = getResultIdsForQuiz(SLUG);
    for (const id of ids) {
      const result = traditionalColorQuiz.results.find((r) => r.id === id);
      expect(result).toBeDefined();
    }
  });
});

describe("traditional-color 専用結果ページ: detailedContent の variant 確認", () => {
  it("全結果の detailedContent.variant が 'traditional-color'", () => {
    for (const result of traditionalColorQuiz.results) {
      expect(result.detailedContent).toBeDefined();
      expect(result.detailedContent?.variant).toBe("traditional-color");
    }
  });

  it("全結果に catchphrase が存在する", () => {
    for (const result of traditionalColorQuiz.results) {
      const dc = result.detailedContent;
      expect(dc).toBeDefined();
      if (dc && dc.variant === "traditional-color") {
        expect(dc.catchphrase).toBeTruthy();
        expect(typeof dc.catchphrase).toBe("string");
      }
    }
  });

  it("全結果に color が存在する（OGP画像用）", () => {
    for (const result of traditionalColorQuiz.results) {
      expect(result.color).toBeDefined();
      expect(typeof result.color).toBe("string");
      // HEXカラーコードのフォーマット検証
      expect(result.color).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    }
  });
});

describe("traditional-color クイズメタデータ", () => {
  it("accentColor が定義されている", () => {
    expect(traditionalColorQuiz.meta.accentColor).toBeTruthy();
    expect(typeof traditionalColorQuiz.meta.accentColor).toBe("string");
  });

  it("slug が 'traditional-color'", () => {
    expect(traditionalColorQuiz.meta.slug).toBe("traditional-color");
  });
});

// ============================================================
// コントラスト問題の修正確認テスト
// ============================================================

/**
 * MUST-1: CTA1ボタンのアクセシビリティ検証。
 *
 * 修正前: background-color: var(--type-color); color: white;
 *   → 桜色(#fedfe1)などで白テキストのコントラスト比が1.1:1程度（WCAG AA違反）
 *
 * 修正後: アウトライン型ボタン（background: white/transparent, color: --color-text）
 *   → テキスト色は var(--color-text) 相当の暗い色（#1a1a1a近似）を想定
 *   → 白（#ffffff）背景に対して暗いテキストなので十分なコントラスト比を確保
 *
 * このテストはCSSの実際の適用ではなく、修正アプローチの正しさを検証する。
 * 修正後は全8タイプ色において、「白背景 + 暗いテキスト色（#1a1a1a）」の
 * コントラスト比がWCAG AA（4.5:1）以上であることを確認する。
 */
describe("MUST-1: CTA1ボタン - アウトライン型のコントラスト比検証", () => {
  // 修正後のボタンは白(またはセカンダリ背景)に暗いテキスト色を使う想定
  const WHITE_BACKGROUND = "#ffffff";
  // var(--color-text) の典型的な値（ライトモード）
  const DARK_TEXT_COLOR = "#1a1a1a";

  it("白背景に対して暗いテキスト(#1a1a1a)はWCAG AAを満たす", () => {
    const ratio = getContrastRatio(WHITE_BACKGROUND, DARK_TEXT_COLOR);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA);
  });

  it("アウトライン型ボタンのテキスト色(#1a1a1a)は全タイプで固定のため、白背景との単一チェックで十分", () => {
    // アウトライン型ボタンでは border に --type-color を使い、
    // テキストは var(--color-text) を使う。背景は白なので問題なし。
    // テキスト色は全タイプで固定（var(--color-text)）なので、コントラスト比も固定。
    // そのため全8タイプをループする必要はなく、単一のアサーションで検証できる。
    const ratio = getContrastRatio(WHITE_BACKGROUND, DARK_TEXT_COLOR);
    expect(
      ratio,
      `白背景+暗いテキストのコントラスト比${ratio.toFixed(2)}がWCAG AAを下回っています`,
    ).toBeGreaterThanOrEqual(WCAG_AA);
  });

  // 修正前（white テキスト on type-color 背景）が問題を起こす色の確認
  it("修正前は桜色(#fedfe1)で白テキストがWCAG AA違反だった（問題の証明）", () => {
    const sakuraColor = "#fedfe1";
    const ratioWithWhite = getContrastRatio(sakuraColor, "#ffffff");
    // コントラスト比が4.5未満であることを確認（問題の証明）
    expect(ratioWithWhite).toBeLessThan(WCAG_AA);
  });

  it("修正前は山吹色(#ffb11b)で白テキストがWCAG AA違反だった（問題の証明）", () => {
    const yamabukiColor = "#ffb11b";
    const ratioWithWhite = getContrastRatio(yamabukiColor, "#ffffff");
    expect(ratioWithWhite).toBeLessThan(WCAG_AA);
  });

  it("修正前は若草色(#C3D825)で白テキストがWCAG AA違反だった（問題の証明）", () => {
    const wakakusaColor = "#C3D825";
    const ratioWithWhite = getContrastRatio(wakakusaColor, "#ffffff");
    expect(ratioWithWhite).toBeLessThan(WCAG_AA);
  });
});

/**
 * MUST-2 & MUST-3: catchphrase テキスト色のコントラスト検証。
 *
 * 修正方針:
 * - catchphrase の color を var(--type-color) から var(--color-text) に変更する
 * - --type-color は border-left などのアクセント装飾にのみ使用する
 * - これにより全8タイプ色・全モードで確実なコントラストを確保できる
 * - music-personality の catchphrase スタイルが同様のアプローチの前例
 *
 * color-mix アプローチは採用しない理由:
 * - 若草色(#C3D825)は color-mix(70%, black) でも3.04しか出ない
 * - 藍色(#0d5661)は color-mix(70%, white) でも4.37しか出ない
 * - 全8色で一貫してWCAG AAを確保するには var(--color-text) が最も確実
 */
describe("MUST-2 & MUST-3: catchphrase テキスト色のコントラスト検証", () => {
  // var(--color-bg-secondary) のライトモード近似（白に近い薄いグレー）
  const LIGHT_BG = "#f8f8f8";
  // ダークモード背景の近似（yolos.netのダーク背景）
  const DARK_BG = "#1a1a2e";
  // var(--color-text) のライトモード近似（ほぼ黒）
  const LIGHT_TEXT_COLOR = "#1a1a1a";
  // var(--color-text) のダークモード近似（ほぼ白）
  const DARK_TEXT_COLOR = "#f0f0f0";

  it("修正後: ライトモードでvar(--color-text)使用時にWCAG AAを満たす", () => {
    const ratio = getContrastRatio(LIGHT_BG, LIGHT_TEXT_COLOR);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA);
  });

  it("修正後: ダークモードでvar(--color-text)使用時にWCAG AAを満たす（全8色に依存しない）", () => {
    const ratio = getContrastRatio(DARK_BG, DARK_TEXT_COLOR);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA);
  });

  // color-mix アプローチが全8色で通らない問題の証明（採用しない理由）
  it("color-mix(70% black)アプローチでは若草色(#C3D825)がライトモードWCAG AA未達（3.04）", () => {
    const wakakusaColor = "#C3D825";
    const darkenedColor = colorMixWithBlack70(wakakusaColor);
    const ratio = getContrastRatio(LIGHT_BG, darkenedColor);
    // 3.04程度でWCAG AA(4.5:1)未達であることを確認
    expect(ratio).toBeLessThan(WCAG_AA);
  });

  it("color-mix(70% white)アプローチでは藍色(#0d5661)がダークモードWCAG AA未達（4.37）", () => {
    const aiColor = "#0d5661";
    const lightenedColor = colorMixWithWhite70(aiColor);
    const ratio = getContrastRatio(DARK_BG, lightenedColor);
    // 4.37程度でWCAG AA(4.5:1)未達であることを確認
    expect(ratio).toBeLessThan(WCAG_AA);
  });

  // 修正前の問題証明
  it("修正前: 桜色(#fedfe1)をテキスト色に使うと白背景でWCAG AA違反だった", () => {
    const sakuraColor = "#fedfe1";
    const ratioOnLightBg = getContrastRatio(LIGHT_BG, sakuraColor);
    expect(ratioOnLightBg).toBeLessThan(WCAG_AA);
  });

  it("修正前: 藍色(#0d5661)をテキスト色に使うとダーク背景でWCAG AA違反だった", () => {
    const aiColor = "#0d5661";
    const ratioOnDarkBg = getContrastRatio(DARK_BG, aiColor);
    expect(ratioOnDarkBg).toBeLessThan(WCAG_AA);
  });

  it("修正前: 紺色(#0f2540)をテキスト色に使うとダーク背景でWCAG AA違反だった", () => {
    const konColor = "#0f2540";
    const ratioOnDarkBg = getContrastRatio(DARK_BG, konColor);
    expect(ratioOnDarkBg).toBeLessThan(WCAG_AA);
  });
});

// ============================================================
// カラーヒーローエリアのコントラスト検証（MUST-1追加: ヒーロー背景対応）
// ============================================================

/**
 * color-mix(in srgb, color 12%, white) の近似計算。
 * ライトモードのヒーロー背景色（薄い伝統色）をシミュレートする。
 */
function colorMixWithWhite12(hex: string): string {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  // 12% type-color + 88% white
  const mixR = Math.round(r * 0.12 + 255 * 0.88);
  const mixG = Math.round(g * 0.12 + 255 * 0.88);
  const mixB = Math.round(b * 0.12 + 255 * 0.88);
  return `#${mixR.toString(16).padStart(2, "0")}${mixG.toString(16).padStart(2, "0")}${mixB.toString(16).padStart(2, "0")}`;
}

/**
 * color-mix(in srgb, color 20%, #1a1a2e) の近似計算。
 * ダークモードのヒーロー背景色をシミュレートする。
 */
function colorMixWithDarkBg20(hex: string): string {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  // ダーク背景色 #1a1a2e の RGB
  const bgR = 0x1a;
  const bgG = 0x1a;
  const bgB = 0x2e;
  // 20% type-color + 80% dark-bg
  const mixR = Math.round(r * 0.2 + bgR * 0.8);
  const mixG = Math.round(g * 0.2 + bgG * 0.8);
  const mixB = Math.round(b * 0.2 + bgB * 0.8);
  return `#${mixR.toString(16).padStart(2, "0")}${mixG.toString(16).padStart(2, "0")}${mixB.toString(16).padStart(2, "0")}`;
}

describe("MUST-1: カラーヒーロー背景 - テキストコントラスト検証", () => {
  // var(--color-text) の近似値（ライトモード・ダークモード）
  const LIGHT_TEXT_COLOR = "#1a1a1a";
  const DARK_TEXT_COLOR = "#f0f0f0";

  // 全8タイプの伝統色
  const allTypeColors: Array<{ name: string; hex: string }> = [
    { name: "藍色", hex: "#0d5661" },
    { name: "朱色", hex: "#cf3d23" },
    { name: "若草色", hex: "#C3D825" },
    { name: "藤色", hex: "#9b7ec8" },
    { name: "山吹色", hex: "#ffb11b" },
    { name: "紺色", hex: "#0f2540" },
    { name: "桜色", hex: "#fedfe1" },
    { name: "翡翠色", hex: "#38b48b" },
  ];

  it("ライトモード: 全8タイプで薄い伝統色背景(12%)に暗いテキストがWCAG AAを満たす", () => {
    for (const { name, hex } of allTypeColors) {
      const heroBg = colorMixWithWhite12(hex);
      const ratio = getContrastRatio(heroBg, LIGHT_TEXT_COLOR);
      expect(
        ratio,
        `${name}(${hex}) ヒーロー背景(${heroBg})に対して暗いテキストのコントラスト比${ratio.toFixed(2)}がWCAG AA未満`,
      ).toBeGreaterThanOrEqual(WCAG_AA);
    }
  });

  it("ダークモード: 全8タイプで伝統色を混ぜたダーク背景(20%)に明るいテキストがWCAG AAを満たす", () => {
    for (const { name, hex } of allTypeColors) {
      const heroBg = colorMixWithDarkBg20(hex);
      const ratio = getContrastRatio(heroBg, DARK_TEXT_COLOR);
      expect(
        ratio,
        `${name}(${hex}) ダークヒーロー背景(${heroBg})に対して明るいテキストのコントラスト比${ratio.toFixed(2)}がWCAG AA未満`,
      ).toBeGreaterThanOrEqual(WCAG_AA);
    }
  });
});
