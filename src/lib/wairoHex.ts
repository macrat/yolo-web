import type { WairoColor } from "@/components/Tsutsumi";

/**
 * 成果物パレット「和色」8色の hex ルックアップ表（DESIGN.md §2）。
 *
 * なぜ hex が要るか: 正典トークンは `globals.css` に oklch で定義されるが、Satori
 * （札＝OG 画像生成・`src/lib/fuda-image.tsx`）は oklch を解釈できない。ここで hex に
 * 固定して Satori へ渡す。
 *
 * ライト固定の根拠（DESIGN §2/§4「札」）: OG は 1枚の PNG で light/dark を切り替えられない。
 * よって **light の地色hex** を採用する（暗所で開くユーザもライトの札を保存する前提）。
 * 文字色 `on`（墨 `--wairo-ink-sumi` / 白 `--wairo-ink-white`）は両モード共通のため、
 * light 地色hex に対して AA を担保すれば足りる。
 *
 * AA 実測（このファイルの hex 値そのもので再計測——継承でなく生成値で 4.5:1 を満たすこと。
 *  WCAG 2.1 相対輝度・sRGB。変換元は `globals.css` の light oklch を `oklchToHex` で hex 化した値。
 *  乖離ガードは `__tests__/wairoHex.test.ts` が globals.css からの再変換と突き合わせて担保する）:
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
 *   （全色 4.5:1 以上・最小は柿 5.50:1。DESIGN §2「トークン値を変更したら必ず再計測」に従い、
 *    globals.css の oklch を変えたら本表と AA コメントも更新すること——テストが不一致を検知する。）
 */

/** 成果物の文字色（色相を持たない中性の白/墨・両モード共通。`--wairo-ink-*` の hex 化）。 */
export const WAIRO_INK_WHITE = "#fafafa";
export const WAIRO_INK_SUMI = "#201e1a";

/** 1つの和色の「地色hex」と「その上の文字色hex（AA 担保済）」。 */
export interface WairoHex {
  /** 記号面の地に使う和色（light の生成 hex）。 */
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
