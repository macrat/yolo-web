/**
 * OKLCH → sRGB(hex) 変換ユーティリティ。
 *
 * 用途: 正典トークンは oklch（`globals.css`）で定義されるが、Satori（OG 画像生成）は
 * oklch を解釈できないため、成果物パレット（和色）を hex に固定して渡す必要がある
 * （`src/lib/wairoHex.ts`）。さらに、oklch→sRGB のガモット外クリップによる
 * 「正典 oklch と hex 表のサイレント乖離」を検知するテスト（wairoHex.test.ts）でも
 * 同じ変換を使う——生成と検査を同一ロジックにすることで、一致は構成上保証され、
 * 将来 globals.css の oklch を変えたら hex 表と食い違ってテストが落ちる。
 *
 * 変換式は CSS Color 4 / OKLab の標準係数に従う。ガモット外の色は
 * チャンネル単位でクランプする（CSS のクロマ低減マッピングとは厳密には異なるが、
 * 和色8色はいずれもほぼ sRGB 内で、クランプ結果がそのまま Satori へ渡る実 hex になる）。
 */

/** OKLCH 三要素（L=0..1・C=クロマ・H=色相 deg）。 */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** リニア sRGB（0..1）を 8bit ガンマ sRGB（0..255・クランプ済）に変換する。 */
function linearToSrgb8bit(linear: number): number {
  const gamma =
    linear <= 0.0031308
      ? 12.92 * linear
      : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  const clamped = Math.min(1, Math.max(0, gamma));
  return Math.round(clamped * 255);
}

/** 8bit 値（0..255）を 2 桁 16 進へ。 */
function toHexByte(value: number): string {
  return value.toString(16).padStart(2, "0");
}

/**
 * OKLCH を sRGB の hex 文字列（"#rrggbb"）へ変換する。
 * ガモット外はチャンネルクランプ。
 */
export function oklchToHex(l: number, c: number, h: number): string {
  // OKLCH → OKLab
  const hueRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hueRad);
  const b = c * Math.sin(hueRad);

  // OKLab → LMS（三乗の前の中間値）
  const lCube = l + 0.3963377774 * a + 0.2158037573 * b;
  const mCube = l - 0.1055613458 * a - 0.0638541728 * b;
  const sCube = l - 0.0894841775 * a - 1.291485548 * b;

  const lms0 = lCube ** 3;
  const lms1 = mCube ** 3;
  const lms2 = sCube ** 3;

  // LMS → リニア sRGB
  const rLin = 4.0767416621 * lms0 - 3.3077115913 * lms1 + 0.2309699292 * lms2;
  const gLin = -1.2684380046 * lms0 + 2.6097574011 * lms1 - 0.3413193965 * lms2;
  const bLin = -0.0041960863 * lms0 - 0.7034186147 * lms1 + 1.707614701 * lms2;

  const r = linearToSrgb8bit(rLin);
  const g = linearToSrgb8bit(gLin);
  const bb = linearToSrgb8bit(bLin);

  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(bb)}`;
}

/**
 * `oklch(L C H)` 形式の CSS 値文字列をパースする（alpha 付きも先頭3値だけ取る）。
 * パースできなければ null。globals.css の値をテストで読むために使う。
 */
export function parseOklch(input: string): Oklch | null {
  const match = input.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+(-?[\d.]+)/i);
  if (!match) return null;
  return {
    l: Number.parseFloat(match[1]),
    c: Number.parseFloat(match[2]),
    h: Number.parseFloat(match[3]),
  };
}
