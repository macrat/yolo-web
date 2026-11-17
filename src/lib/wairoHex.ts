/**
 * 札の画像（`src/lib/fuda-image.tsx`）の記号面に敷く和色8色と、その上の文字色の hex 表。
 *
 * Satori は oklch を解釈できないので、色は hex で持つ。OG 画像は1枚の PNG で明暗を
 * 切り替えられないため、明るい地の値だけを持つ。
 *
 * 地色と文字色のコントラスト比（WCAG 2.1 の相対輝度・sRGB。`__tests__/wairoHex.test.ts` が
 * この表の値そのもので 4.5:1 以上を確かめる）:
 *
 *   色      地hex     文字   文字hex   コントラスト比
 *   紅      #af283d   白     #fafafa   6.30:1
 *   柿      #dd7b2b   墨     #201e1a   5.50:1
 *   山吹    #e3b842   墨     #201e1a   8.88:1
 *   萌黄    #89ce5f   墨     #201e1a   8.76:1
 *   常磐    #156f41   白     #fafafa   5.95:1
 *   藍      #2b568b   白     #fafafa   7.17:1
 *   藤      #ad98d5   墨     #201e1a   6.52:1
 *   蘇芳    #923558   白     #fafafa   7.00:1
 */

/** 和色8色のキー。 */
export type WairoColor =
  "kurenai" | "kaki" | "yamabuki" | "moegi" | "tokiwa" | "ai" | "fuji" | "suou";

/** 記号面の文字色（色相を持たない白と墨）。 */
export const WAIRO_INK_WHITE = "#fafafa";
export const WAIRO_INK_SUMI = "#201e1a";

/** 1つの和色の「地色hex」と「その上の文字色hex（AA 担保済）」。 */
export interface WairoHex {
  /** 記号面の地の和色。 */
  bg: string;
  /** 地色の上で AA 4.5:1 を満たす文字色hex（墨 or 白）。 */
  on: string;
}

/**
 * 和色キー（{@link WairoColor}）→ hex。`pickResultWairoColor` が返すキーで引ける。
 */
export const WAIRO_HEX: Record<WairoColor, WairoHex> = {
  kurenai: { bg: "#af283d", on: WAIRO_INK_WHITE }, // 紅 6.30:1
  kaki: { bg: "#dd7b2b", on: WAIRO_INK_SUMI }, // 柿 5.50:1
  yamabuki: { bg: "#e3b842", on: WAIRO_INK_SUMI }, // 山吹 8.88:1
  moegi: { bg: "#89ce5f", on: WAIRO_INK_SUMI }, // 萌黄 8.76:1
  tokiwa: { bg: "#156f41", on: WAIRO_INK_WHITE }, // 常磐 5.95:1
  ai: { bg: "#2b568b", on: WAIRO_INK_WHITE }, // 藍 7.17:1
  fuji: { bg: "#ad98d5", on: WAIRO_INK_SUMI }, // 藤 6.52:1
  suou: { bg: "#923558", on: WAIRO_INK_WHITE }, // 蘇芳 7.00:1
};

/** {@link pickResultWairoColor} が id のハッシュで引く和色の並び。 */
const WAIRO_COLORS: readonly WairoColor[] = [
  "kurenai",
  "kaki",
  "yamabuki",
  "moegi",
  "tokiwa",
  "ai",
  "fuji",
  "suou",
];

/**
 * 結果タイプの id から和色を1つ選ぶ。id の多項式ハッシュで8色へ写すので、
 * 同じタイプはいつも同じ色になる。
 */
export function pickResultWairoColor(id: string): WairoColor {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return WAIRO_COLORS[hash % WAIRO_COLORS.length];
}
