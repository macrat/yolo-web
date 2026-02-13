export interface CharCountResult {
  chars: number;
  charsNoSpaces: number;
  bytes: number;
  words: number;
  lines: number;
  paragraphs: number;
}

export function countChars(text: string): number {
  return text.length;
}

export function countCharsNoSpaces(text: string): number {
  return text.replace(/\s/g, "").length;
}

export function countBytes(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

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

export function countLines(text: string): number {
  if (text === "") return 0;
  return text.split("\n").length;
}

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
