/**
 * 記号面の先頭で飛ばす開き括弧・引用符。
 *
 * character-personality のタイプ名には会話の引用で始まるもの（例: 「よし行くぞ！」…）が
 * あり、先頭の書記素をそのまま採ると記号面が開き鉤括弧「だけになる。
 */
const SYMBOL_SKIP_CHARS: ReadonlySet<string> = new Set([
  "「",
  "『",
  "（",
  "(",
  "【",
  "〔",
  "〈",
  "《",
  "｢",
  "”",
  "“",
  '"',
  "'",
  "〝",
]);

/** 記号面の先頭で飛ばす字か（開き括弧・引用符・全角と半角の空白類）。 */
function isSkippableSymbolChar(grapheme: string): boolean {
  return SYMBOL_SKIP_CHARS.has(grapheme) || /\s/u.test(grapheme);
}

/**
 * 結果タイプ名から、札の画像の記号面に立てる1字を取り出す。
 *
 * タイプ名の先頭の書記素（サロゲートペア対応）を使う。先頭の開き括弧・引用符・空白類は
 * 飛ばし、最初の意味のある書記素を採る。全字が飛ばす字のときは、空を返さず
 * 先頭の書記素を返す。
 */
export function pickResultSymbol(title: string): string {
  const graphemes = [...title.trim()];
  if (graphemes.length === 0) return "";
  const meaningful = graphemes.find((g) => !isSkippableSymbolChar(g));
  return meaningful ?? graphemes[0];
}
