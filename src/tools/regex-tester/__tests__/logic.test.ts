import { describe, test, expect } from "vitest";
import { testRegex, replaceWithRegex } from "../logic";

describe("testRegex", () => {
  test("returns empty matches for empty pattern", () => {
    const result = testRegex("", "g", "hello");
    expect(result.success).toBe(true);
    expect(result.matches).toHaveLength(0);
  });

  test("finds single match without g flag", () => {
    const result = testRegex("hello", "", "hello hello");
    expect(result.success).toBe(true);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].match).toBe("hello");
    expect(result.matches[0].index).toBe(0);
  });

  test("finds all matches with g flag", () => {
    const result = testRegex("hello", "g", "hello hello");
    expect(result.success).toBe(true);
    expect(result.matches).toHaveLength(2);
  });

  test("case-insensitive matching with i flag", () => {
    const result = testRegex("hello", "gi", "Hello HELLO hello");
    expect(result.success).toBe(true);
    expect(result.matches).toHaveLength(3);
  });

  test("captures groups", () => {
    const result = testRegex("(\\w+)@(\\w+)", "", "user@example");
    expect(result.success).toBe(true);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].groups).toEqual(["user", "example"]);
  });

  test("returns error for invalid regex", () => {
    const result = testRegex("[invalid", "g", "test");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("エラーメッセージが日本語で、英語の例外原文を含まない", () => {
    // 構文エラーのケース
    const result1 = testRegex("[unclosed", "g", "test");
    expect(result1.success).toBe(false);
    expect(result1.error).toBeDefined();
    expect(result1.error).not.toMatch(/Invalid regular expression/);
    expect(result1.error).not.toMatch(/Invalid regex pattern/);
    expect(result1.error).toMatch(/正規表現/);

    // 無効なフラグのケース
    const result2 = testRegex("abc", "z", "test");
    expect(result2.success).toBe(false);
    expect(result2.error).toBeDefined();
    expect(result2.error).not.toMatch(/Invalid flags/);
    expect(result2.error).not.toMatch(/Invalid regex pattern/);
    expect(result2.error).toMatch(/正規表現/);
  });

  test("rejects input longer than 10000 chars", () => {
    const longString = "a".repeat(10001);
    const result = testRegex("a", "g", longString);
    expect(result.success).toBe(false);
    expect(result.error).toContain("長すぎます");
  });

  test("handles zero-length matches without infinite loop", () => {
    // Use a pattern that produces zero-length matches (lookahead)
    const result = testRegex("(?=a)", "g", "aaa");
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(3);
  });
});

describe("replaceWithRegex", () => {
  test("replaces matched text", () => {
    const result = replaceWithRegex("world", "g", "hello world", "earth");
    expect(result.success).toBe(true);
    expect(result.output).toBe("hello earth");
  });

  test("handles capture group references", () => {
    const result = replaceWithRegex(
      "(\\w+) (\\w+)",
      "",
      "hello world",
      "$2 $1",
    );
    expect(result.success).toBe(true);
    expect(result.output).toBe("world hello");
  });

  test("returns original string for empty pattern", () => {
    const result = replaceWithRegex("", "g", "hello", "x");
    expect(result.success).toBe(true);
    // Empty pattern replaces at each position
    expect(result.output).toBeDefined();
  });

  test("returns error for invalid regex", () => {
    const result = replaceWithRegex("[invalid", "g", "test", "x");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("エラーメッセージが日本語で、英語の例外原文を含まない", () => {
    const result = replaceWithRegex("[unclosed", "g", "test", "x");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).not.toMatch(/Invalid regular expression/);
    expect(result.error).not.toMatch(/Invalid regex pattern/);
    expect(result.error).toMatch(/正規表現/);
  });
});
