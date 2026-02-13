import { describe, test, expect } from "vitest";
import {
  countBytes,
  countChars,
  countCharsNoSpaces,
  countLines,
  countWords,
  analyzeByteDistribution,
  analyzeText,
} from "../logic";

describe("countBytes", () => {
  test("ASCII characters are 1 byte each", () => {
    expect(countBytes("hello")).toBe(5);
  });

  test("Japanese hiragana is 3 bytes each", () => {
    expect(countBytes("あ")).toBe(3);
    expect(countBytes("あいう")).toBe(9);
  });

  test("Japanese kanji is 3 bytes each", () => {
    expect(countBytes("漢字")).toBe(6);
  });

  test("emoji is 4 bytes", () => {
    expect(countBytes("😀")).toBe(4);
  });

  test("mixed content", () => {
    // "Aあ" = 1 + 3 = 4
    expect(countBytes("Aあ")).toBe(4);
  });

  test("empty string is 0 bytes", () => {
    expect(countBytes("")).toBe(0);
  });

  test("newline is 1 byte", () => {
    expect(countBytes("\n")).toBe(1);
  });

  test("2-byte characters (Latin extended)", () => {
    // "ñ" (U+00F1) is 2 bytes in UTF-8
    expect(countBytes("ñ")).toBe(2);
  });
});

describe("countChars", () => {
  test("counts ASCII characters", () => {
    expect(countChars("hello")).toBe(5);
  });

  test("counts emoji as 1 character (not surrogate pair)", () => {
    expect(countChars("😀")).toBe(1);
  });

  test("counts Japanese characters", () => {
    expect(countChars("日本語")).toBe(3);
  });

  test("empty string", () => {
    expect(countChars("")).toBe(0);
  });
});

describe("countCharsNoSpaces", () => {
  test("excludes spaces", () => {
    expect(countCharsNoSpaces("hello world")).toBe(10);
  });

  test("excludes tabs and newlines", () => {
    expect(countCharsNoSpaces("a\tb\nc")).toBe(3);
  });
});

describe("countLines", () => {
  test("single line", () => {
    expect(countLines("hello")).toBe(1);
  });

  test("multiple lines", () => {
    expect(countLines("line1\nline2\nline3")).toBe(3);
  });

  test("empty string returns 0", () => {
    expect(countLines("")).toBe(0);
  });

  test("trailing newline", () => {
    expect(countLines("a\n")).toBe(2);
  });
});

describe("countWords", () => {
  test("counts words", () => {
    expect(countWords("hello world")).toBe(2);
  });

  test("empty string returns 0", () => {
    expect(countWords("")).toBe(0);
  });

  test("whitespace only returns 0", () => {
    expect(countWords("   ")).toBe(0);
  });

  test("multiple spaces between words", () => {
    expect(countWords("a  b  c")).toBe(3);
  });
});

describe("analyzeByteDistribution", () => {
  test("categorizes ASCII as 1-byte", () => {
    const r = analyzeByteDistribution("abc");
    expect(r.singleByteChars).toBe(3);
    expect(r.twoBytechars).toBe(0);
    expect(r.threeByteChars).toBe(0);
    expect(r.fourByteChars).toBe(0);
  });

  test("categorizes Japanese as 3-byte", () => {
    const r = analyzeByteDistribution("あいう");
    expect(r.threeByteChars).toBe(3);
  });

  test("categorizes emoji as 4-byte", () => {
    const r = analyzeByteDistribution("😀");
    expect(r.fourByteChars).toBe(1);
  });

  test("mixed content", () => {
    const r = analyzeByteDistribution("Aあ😀");
    expect(r.singleByteChars).toBe(1);
    expect(r.threeByteChars).toBe(1);
    expect(r.fourByteChars).toBe(1);
  });

  test("empty string", () => {
    const r = analyzeByteDistribution("");
    expect(r.singleByteChars).toBe(0);
  });
});

describe("analyzeText", () => {
  test("returns comprehensive analysis", () => {
    const r = analyzeText("Hello あいう");
    expect(r.byteLength).toBe(5 + 1 + 9); // "Hello" + space + 3 hiragana
    expect(r.charCount).toBe(9); // H,e,l,l,o, ,あ,い,う
    expect(r.charCountNoSpaces).toBe(8);
    expect(r.lineCount).toBe(1);
    expect(r.wordCount).toBe(2);
    expect(r.singleByteChars).toBe(6); // H,e,l,l,o,space
    expect(r.threeByteChars).toBe(3); // あ,い,う
  });

  test("handles empty string", () => {
    const r = analyzeText("");
    expect(r.byteLength).toBe(0);
    expect(r.charCount).toBe(0);
    expect(r.lineCount).toBe(0);
    expect(r.wordCount).toBe(0);
  });
});
