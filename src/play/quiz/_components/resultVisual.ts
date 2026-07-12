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
 * 結果タイプ名から、包み（Tsutsumi）の記号面に立てる1字を取り出す。
 *
 * DESIGN.md §4「包み」の symbol は「絵文字ではなく漢字/かな1字の『顔』になる字」。
 * クイズデータの `result.icon` は絵文字（§8-6 禁止）なので使わず、タイプ名の
 * 先頭1書記素（サロゲートペア対応）を使う。
 */
export function pickResultSymbol(title: string): string {
  const trimmed = title.trim();
  if (trimmed === "") return "";
  return [...trimmed][0];
}
