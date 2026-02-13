import { describe, test, expect } from "vitest";
import {
  generateText,
  countGeneratedWords,
  countGeneratedChars,
} from "../logic";

describe("generateText", () => {
  test("generates lorem ipsum paragraphs", () => {
    const text = generateText({
      language: "lorem",
      paragraphs: 2,
      sentencesPerParagraph: 3,
    });
    expect(text).toContain("Lorem ipsum");
    // Two paragraphs separated by double newline
    expect(text.split("\n\n")).toHaveLength(2);
  });

  test("generates japanese paragraphs", () => {
    const text = generateText({
      language: "japanese",
      paragraphs: 2,
      sentencesPerParagraph: 3,
    });
    // Should contain Japanese characters
    expect(text).toMatch(/[\u3000-\u9FFF]/);
    expect(text.split("\n\n")).toHaveLength(2);
  });

  test("clamps paragraphs to 1-20", () => {
    const textMin = generateText({
      language: "lorem",
      paragraphs: 0,
      sentencesPerParagraph: 1,
    });
    expect(textMin.split("\n\n")).toHaveLength(1);

    const textMax = generateText({
      language: "lorem",
      paragraphs: 100,
      sentencesPerParagraph: 1,
    });
    expect(textMax.split("\n\n")).toHaveLength(20);
  });

  test("clamps sentences to 1-20", () => {
    const text = generateText({
      language: "lorem",
      paragraphs: 1,
      sentencesPerParagraph: 0,
    });
    // Should still have at least one sentence
    expect(text.length).toBeGreaterThan(0);
  });

  test("cycles through sentences when exceeding pool size", () => {
    // 20 sentences in pool, request 25 sentences total
    const text = generateText({
      language: "lorem",
      paragraphs: 5,
      sentencesPerParagraph: 5,
    });
    expect(text).toContain("Lorem ipsum"); // first sentence should appear again
  });

  test("lorem uses space as joiner", () => {
    const text = generateText({
      language: "lorem",
      paragraphs: 1,
      sentencesPerParagraph: 2,
    });
    // Should have sentences joined by space
    expect(text).not.toContain("\n");
  });

  test("japanese uses no space as joiner", () => {
    const text = generateText({
      language: "japanese",
      paragraphs: 1,
      sentencesPerParagraph: 2,
    });
    // Japanese sentences should be concatenated directly
    expect(text.includes("\u3002")).toBe(true);
  });
});

describe("countGeneratedWords", () => {
  test("counts words in text", () => {
    expect(countGeneratedWords("hello world foo")).toBe(3);
  });

  test("returns 0 for empty text", () => {
    expect(countGeneratedWords("")).toBe(0);
  });

  test("returns 0 for whitespace-only text", () => {
    expect(countGeneratedWords("   ")).toBe(0);
  });
});

describe("countGeneratedChars", () => {
  test("counts characters", () => {
    expect(countGeneratedChars("hello")).toBe(5);
  });

  test("returns 0 for empty string", () => {
    expect(countGeneratedChars("")).toBe(0);
  });

  test("counts Japanese characters", () => {
    expect(countGeneratedChars("日本語")).toBe(3);
  });
});
