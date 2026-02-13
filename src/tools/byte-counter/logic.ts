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

export function countBytes(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

export function countChars(text: string): number {
  // Use Array.from to handle surrogate pairs correctly
  return Array.from(text).length;
}

export function countCharsNoSpaces(text: string): number {
  return Array.from(text.replace(/\s/g, "")).length;
}

export function countLines(text: string): number {
  if (text === "") return 0;
  return text.split("\n").length;
}

export function countWords(text: string): number {
  if (text.trim() === "") return 0;
  // Simple space-based word count
  return text.trim().split(/\s+/).length;
}

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
