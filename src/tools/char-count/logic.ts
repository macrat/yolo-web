// 文字数・単語数・行数・バイト数の共通実装を SSoT モジュールから import する。
// byte-counter も同一の SSoT を参照するため、両ツールは同一環境で必ず同一結果を返す。
import {
  countChars,
  countCharsNoSpaces,
  countWords,
  countLines,
  countBytes,
} from "@/lib/text-counting";

export interface CharCountResult {
  chars: number;
  charsNoSpaces: number;
  bytes: number;
  words: number;
  lines: number;
  paragraphs: number;
}

// 共通関数を re-export する（CharCountTile.tsx 等が直接 import できるよう維持）
export { countChars, countCharsNoSpaces, countBytes, countWords, countLines };

/** 段落数は char-count 固有の集計項目（SSoT 対象外）*/
export function countParagraphs(text: string): number {
  if (text.trim() === "") return 0;
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

export function analyzeText(text: string): CharCountResult {
  return {
    chars: countChars(text),
    charsNoSpaces: countCharsNoSpaces(text),
    bytes: countBytes(text),
    words: countWords(text),
    lines: countLines(text),
    paragraphs: countParagraphs(text),
  };
}
