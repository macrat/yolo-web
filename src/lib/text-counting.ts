/**
 * text-counting.ts — 文字数カウント共通実装（SSoT）
 *
 * char-count と byte-counter の両ツールが参照する、テキスト集計関数の
 * 単一の正答定義。この SSoT を変更することで、両ツールの数え方が
 * 同時に正しく保たれる（手動同期による再乖離を構造的に防ぐ）。
 *
 * カウント基準:
 *   - 文字数 / 空白と改行を除いた文字数: 来訪者が1文字と見るまとまり（書記素）の数。
 *     Intl.Segmenter（granularity: "grapheme"）で分け、ZWJ でつないだ絵文字・国旗・肌の色つきの絵文字・
 *     濁点を分けて書いた「が」も1文字。Intl.Segmenter が無い環境ではコードポイントで数える。
 *   - 単語数: Intl.Segmenter（ja, granularity: "word"）を優先。
 *     Intl.Segmenter が利用不可な環境ではスペース分割でフォールバック。
 *     同一環境では両ツールが必ず同一コードパスを通るため結果が一致する。
 *   - 行数: 改行文字（\n）の数 + 1。空文字列は 0。
 *   - バイト数: TextEncoder による UTF-8 バイト列の長さ。
 */

const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("ja", { granularity: "grapheme" })
    : null;

/** 文字数（書記素の数）をカウントする。 */
export function countChars(text: string): number {
  if (!graphemeSegmenter) return Array.from(text).length;
  return Array.from(graphemeSegmenter.segment(text)).length;
}

/** 空白（全角の空白を含む）・タブ・改行を除いた文字数（書記素の数）をカウントする。 */
export function countCharsNoSpaces(text: string): number {
  return countChars(text.replace(/\s/g, ""));
}

/**
 * 単語数をカウントする。
 * Intl.Segmenter が利用可能な場合は日本語形態素解析を行う。
 * 利用不可な場合はスペース区切りにフォールバックする。
 */
export function countWords(text: string): number {
  if (text.trim() === "") return 0;

  // Use Intl.Segmenter for Japanese word segmentation if available
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
    const segments = Array.from(segmenter.segment(text));
    return segments.filter((s) => s.isWordLike).length;
  }

  // Fallback: simple space-based splitting
  return text.trim().split(/\s+/).length;
}

/**
 * 行数をカウントする。
 * 空文字列は 0、それ以外は改行文字（\n）の数 + 1。
 */
export function countLines(text: string): number {
  if (text === "") return 0;
  return text.split("\n").length;
}

/**
 * UTF-8 エンコードされたバイト数をカウントする。
 */
export function countBytes(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}
