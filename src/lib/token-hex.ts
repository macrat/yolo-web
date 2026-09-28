/**
 * UI の色のトークン（DESIGN.md §2）の hex。
 *
 * トークンは `src/app/globals.css` に oklch で定義されている。CSS のトークンを読めない所へは、
 * ここの hex を渡す: Satori で描く画像（oklch を解釈しない）、`theme-color` の meta、favicon。
 * 各値は、コメントに書いたトークンを oklch から変換した値で、`__tests__/token-hex.test.ts` が
 * globals.css との一致を確かめる。
 *
 * import を持たないモジュールなので、Edge で動く middleware からも読める。
 */

/** 紙（ライト）。 */
export const PAPER = "#fcfcfc"; // --paper   oklch(0.99 0 0)
/** 墨（ライト）。 */
export const INK = "#0b0b0b"; // --ink     oklch(0.15 0 0)
/** 前に出ない字（ライト）。 */
export const INK_2 = "#525252"; // --ink-2   oklch(0.44 0 0)
/** 太い線（ライト）。UI は無彩なので、太い線は字と同じ墨で引く。 */
export const RULE = INK; // --rule    var(--ink)
/** 細い線（ライト）。 */
export const RULE_2 = "#868686"; // --rule-2  oklch(0.62 0 0)

/** 紙（ダーク）。 */
export const PAPER_DARK = "#121212"; // --paper   oklch(0.18 0 0)
/** 墨（ダーク）。 */
export const INK_DARK = "#f5f5f5"; // --ink     oklch(0.97 0 0)
