/**
 * 器（うつわ）の色 — 紙・墨・線の hex 定数の SSoT（DESIGN.md §2）。
 *
 * なぜ hex 直書きか: 正典トークンは `globals.css` に oklch で定義されるが、トークンを参照できない
 * 面がある。Satori（OG/札の画像生成）は oklch を解釈できず、`theme-color` の meta は CSS の
 * トークンを読めない。ここで各トークンの hex を固定して、それらの面へ渡す。
 *
 * なぜ中立モジュールとして切り出すか: 器定数は札レンダラ（{@link import("./fuda-image")}）と
 * 看板レンダラ（{@link import("./ogp-image")}）の**両方**が使う。fuda-image は ogp-image を
 * import しているため、ogp-image が fuda-image から器定数を取ると循環 import になる。
 * import を持たない葉のモジュールなので、Edge で動く middleware からも安全に読める。
 *
 * OG/札は 1 枚の PNG で light/dark を切り替えられないため light の値を使う。
 * `theme-color` は、端末の設定に従って light と dark の紙の値を使い分ける。
 *
 * 乖離ガード: 各定数のコメントに対応する globals.css のトークン名（`--paper` 等）を残す。
 * `__tests__/wairoHex.test.ts` が globals.css の oklch を再変換して本表と一致することを検証し、
 * globals.css だけ変えて本表を放置するサイレント乖離を検知する。
 */

/** 紙（全面の地色）。 */
export const PAPER = "#fcfcfc"; // --paper   oklch(0.99 0 0)
/** 墨（主文字色）。 */
export const INK = "#0b0b0b"; // --ink     oklch(0.15 0 0)
/** 墨（前に出ない文字）。 */
export const INK_2 = "#525252"; // --ink-2   oklch(0.44 0 0)
/** 太い線。UI は無彩なので、太い線は文字と同じ墨で引く。 */
export const RULE = INK; // --rule    var(--ink)
/** 細い線。 */
export const RULE_2 = "#868686"; // --rule-2  oklch(0.62 0 0)

/** dark の紙。 */
export const PAPER_DARK = "#121212"; // --paper   oklch(0.18 0 0)
