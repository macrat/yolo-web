import { describe, test, expect } from "vitest";
import {
  countChars,
  countCharsNoSpaces,
  countBytes,
  countWords,
  countLines,
  countParagraphs,
  analyzeText,
} from "../logic";

describe("countChars", () => {
  test("returns 0 for empty string", () => {
    expect(countChars("")).toBe(0);
  });

  test("counts ASCII characters", () => {
    expect(countChars("hello")).toBe(5);
  });

  test("counts Japanese characters", () => {
    expect(countChars("こんにちは")).toBe(5);
  });

  test("counts mixed content", () => {
    expect(countChars("Hello 世界")).toBe(8);
  });
});

describe("countCharsNoSpaces", () => {
  test("returns 0 for empty string", () => {
    expect(countCharsNoSpaces("")).toBe(0);
  });

  test("excludes spaces", () => {
    expect(countCharsNoSpaces("hello world")).toBe(10);
  });

  test("excludes tabs and newlines", () => {
    expect(countCharsNoSpaces("a\tb\nc")).toBe(3);
  });
});

describe("countBytes", () => {
  test("returns 0 for empty string", () => {
    expect(countBytes("")).toBe(0);
  });

  test("counts ASCII as 1 byte each", () => {
    expect(countBytes("hello")).toBe(5);
  });

  test("counts Japanese characters as 3 bytes each (UTF-8)", () => {
    expect(countBytes("あ")).toBe(3);
    expect(countBytes("こんにちは")).toBe(15);
  });
});

describe("countWords", () => {
  test("returns 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  test("returns 0 for whitespace-only string", () => {
    expect(countWords("   ")).toBe(0);
  });

  test("counts English words", () => {
    expect(countWords("hello world")).toBe(2);
  });

  test("counts words with multiple spaces", () => {
    expect(countWords("hello   world")).toBe(2);
  });
});

describe("countLines", () => {
  test("returns 0 for empty string", () => {
    expect(countLines("")).toBe(0);
  });

  test("returns 1 for single line", () => {
    expect(countLines("hello")).toBe(1);
  });

  test("counts newlines correctly", () => {
    expect(countLines("line1\nline2\nline3")).toBe(3);
  });

  test("counts trailing newline", () => {
    expect(countLines("line1\n")).toBe(2);
  });
});

describe("countParagraphs", () => {
  test("returns 0 for empty string", () => {
    expect(countParagraphs("")).toBe(0);
  });

  test("returns 1 for single paragraph", () => {
    expect(countParagraphs("hello world")).toBe(1);
  });

  test("counts paragraphs separated by blank lines", () => {
    expect(countParagraphs("para1\n\npara2\n\npara3")).toBe(3);
  });

  test("ignores extra blank lines", () => {
    expect(countParagraphs("para1\n\n\n\npara2")).toBe(2);
  });
});

describe("analyzeText", () => {
  test("returns all counts for empty string", () => {
    const result = analyzeText("");
    expect(result.chars).toBe(0);
    expect(result.charsNoSpaces).toBe(0);
    expect(result.bytes).toBe(0);
    expect(result.words).toBe(0);
    expect(result.lines).toBe(0);
    expect(result.paragraphs).toBe(0);
  });

  test("returns correct counts for sample text", () => {
    const result = analyzeText("Hello World");
    expect(result.chars).toBe(11);
    expect(result.charsNoSpaces).toBe(10);
    expect(result.bytes).toBe(11);
    expect(result.lines).toBe(1);
    expect(result.paragraphs).toBe(1);
  });
});
