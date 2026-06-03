// 文字数・単語数・行数・バイト数の共通実装を SSoT モジュールから import する。
// char-count も同一の SSoT を参照するため、両ツールは同一環境で必ず同一結果を返す。
import {
  countChars,
  countCharsNoSpaces,
  countWords,
  countLines,
  countBytes,
} from "@/lib/text-counting";

export interface ByteCountResult {
  byteLength: number;
  charCount: number;
  charCountNoSpaces: number;
  lineCount: number;
  wordCount: number;
  // Per-character byte breakdown
  singleByteChars: number; // 1-byte (ASCII)
  twoBytechars: number; // 2-byte
  threeByteChars: number; // 3-byte (most CJK)
  fourByteChars: number; // 4-byte (emoji, rare CJK)
}

// 共通関数を re-export する（ByteCounterTile.tsx 等が直接 import できるよう維持）
export { countChars, countCharsNoSpaces, countWords, countLines, countBytes };

// Analyze byte distribution per character
export function analyzeByteDistribution(
  text: string,
): Pick<
  ByteCountResult,
  "singleByteChars" | "twoBytechars" | "threeByteChars" | "fourByteChars"
> {
  let singleByteChars = 0;
  let twoBytechars = 0;
  let threeByteChars = 0;
  let fourByteChars = 0;

  for (const char of text) {
    const bytes = new TextEncoder().encode(char).byteLength;
    switch (bytes) {
      case 1:
        singleByteChars++;
        break;
      case 2:
        twoBytechars++;
        break;
      case 3:
        threeByteChars++;
        break;
      default:
        fourByteChars++;
        break;
    }
  }

  return { singleByteChars, twoBytechars, threeByteChars, fourByteChars };
}

export function analyzeText(text: string): ByteCountResult {
  const distribution = analyzeByteDistribution(text);
  return {
    byteLength: countBytes(text),
    charCount: countChars(text),
    charCountNoSpaces: countCharsNoSpaces(text),
    lineCount: countLines(text),
    wordCount: countWords(text),
    ...distribution,
  };
}
