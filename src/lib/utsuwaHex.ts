/**
 * 器（うつわ）の色 — 紙・墨・線の直書き hex 定数の SSoT（DESIGN.md §2）。
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

/** 紙（全面の地色）。 */
export const PAPER = "#fcfcfc"; // --paper   oklch(0.99 0 0)
/** 墨（主文字色）。 */
export const INK = "#0b0b0b"; // --ink     oklch(0.15 0 0)
/** 墨（前に出ない文字）。 */
export const INK_2 = "#525252"; // --ink-2   oklch(0.44 0 0)
/** 細い線。 */
export const RULE = "#868686"; // --rule-2  oklch(0.62 0 0)
/** 太い線。UI は無彩なので、太い線は文字と同じ墨で引く。 */
export const RULE_STRONG = INK; // --rule    var(--ink)
/** 印（y の字）。UI は無彩なので墨で描く。 */
export const ACCENT = INK; // --ink
