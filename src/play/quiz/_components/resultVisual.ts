import type { WairoColor } from "@/components/Tsutsumi";

/**
 * 和色8色（{@link WairoColor} と同じ並び）。結果タイプの id から決定的に1つ選ぶための
 * 固定順序テーブル（DESIGN.md §2「成果物パレット」）。
 */
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
 * 結果タイプの id から和色を決定的に1つ選ぶ。
 *
 * クイズデータ（`quiz.results[].color`）は任意の hex を持つが、DESIGN.md §2 は
 * 成果物パレットを和色8色に限定する（器へ漏らさない・任意色を直書きしない）。
 * ここでは元の hex を捨て、id の単純な多項式ハッシュで 8 色へ決定的に写像する
 * （暗号強度は不要——同じタイプが常に同じ色になり、インライン結果と第三者向け
 * 静的結果ページで見た目が揃うことだけが要件）。
 */
export function pickResultWairoColor(id: string): WairoColor {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return WAIRO_COLORS[hash % WAIRO_COLORS.length];
}

/**
 * 記号面の先頭でスキップする開き括弧・引用符（「顔」にしない字）。
 *
 * character-personality のタイプ名には会話の引用で始まるもの（例: 「よし行くぞ！」…）が
 * あり、そのまま先頭書記素を採ると記号面が孤立した開き鉤括弧「になってしまう。
 * 開き括弧・引用符・空白類を飛ばして、最初の意味のある字（漢字/かな/英数）に着地させる。
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

/** 記号面の先頭からスキップする字か（開き括弧・引用符 or 空白類・全角/半角）。 */
function isSkippableSymbolChar(grapheme: string): boolean {
  return SYMBOL_SKIP_CHARS.has(grapheme) || /\s/u.test(grapheme);
}

/**
 * 結果タイプ名から、包み（Tsutsumi）の記号面に立てる1字を取り出す。
 *
 * DESIGN.md §4「包み」の symbol は「絵文字ではなく漢字/かな1字の『顔』になる字」。
 * クイズデータの `result.icon` は絵文字（§8-6 禁止）なので使わず、タイプ名の
 * 先頭書記素（サロゲートペア対応）を使う。ただし開き括弧・引用符・空白類が先頭に
 * ある場合はそれを飛ばし、最初の意味のある書記素に着地させる（画面 Tsutsumi と
 * 札画像 fuda-image の共有ソース）。全字がスキップ対象という異常時は、空を返さず
 * 従来どおり先頭書記素へフォールバックする。
 */
export function pickResultSymbol(title: string): string {
  const graphemes = [...title.trim()];
  if (graphemes.length === 0) return "";
  const meaningful = graphemes.find((g) => !isSkippableSymbolChar(g));
  return meaningful ?? graphemes[0];
}
