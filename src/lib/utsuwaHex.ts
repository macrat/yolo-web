/**
 * 器（うつわ）の色 — 紙・墨・罫・朱の直書き hex 定数の SSoT（DESIGN.md §2）。
 *
 * なぜ中立モジュールとして切り出すか: 器定数は札レンダラ（{@link import("./fuda-image")}）と
 * 看板レンダラ（{@link import("./ogp-image")}）の**両方**が使う。fuda-image は ogp-image を
 * import しているため、ogp-image が fuda-image から器定数を取ると循環 import になる。器定数を
 * どちらにも属さないこのモジュールへ置き、3者（fuda-image・ogp-image・乖離ガードテスト
 * `__tests__/wairoHex.test.ts`）がここから import することで循環を断ち、単一の真実にする。
 *
 * なぜ hex 直書きか: 正典トークンは `globals.css` に oklch で定義されるが、Satori（OG/札の
 * 画像生成）は oklch を解釈できない。ここで light トークンの hex を固定して Satori へ渡す。
 *
 * ライト固定の根拠: OG/札は 1 枚の PNG で light/dark を切り替えられないため light の地色を採る。
 *
 * 乖離ガード: 各定数のコメントに対応する globals.css の light トークン名（`--paper` 等）を残す。
 * `__tests__/wairoHex.test.ts` が globals.css の oklch を再変換して本表と一致することを検証し、
 * globals.css だけ変えて本表を放置するサイレント乖離を検知する。
 */

/** 紙地（全面の地色）。 */
export const PAPER = "#f8f7f2"; // --paper       oklch(0.975 0.006 90)
/** 墨（主文字色）。 */
export const INK = "#201e1a"; // --ink         oklch(0.235 0.008 80)
/** 墨（副次・薄い階層）。 */
export const INK_2 = "#58554f"; // --ink-2       oklch(0.45 0.01 80)
/** 罫（細い仕切り線）。 */
export const RULE = "#cdcac5"; // --rule        oklch(0.84 0.008 85)
/** 罫（強・器の枠）。 */
export const RULE_STRONG = "#302d28"; // --rule-strong oklch(0.30 0.01 80)
/** 朱（アクセント・印専用）。 */
export const ACCENT = "#af3622"; // --accent      oklch(0.51 0.16 32)
