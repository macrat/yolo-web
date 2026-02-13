import { describe, test, expect } from "vitest";
import { toHalfwidth, toFullwidth, convert } from "../logic";

describe("toHalfwidth", () => {
  test("converts fullwidth alphanumeric to halfwidth", () => {
    expect(toHalfwidth("\uFF21\uFF42\uFF43\uFF11\uFF12\uFF13")).toBe("Abc123");
  });

  test("converts fullwidth katakana to halfwidth", () => {
    expect(toHalfwidth("\u30A2\u30A4\u30A6\u30A8\u30AA")).toBe(
      "\uFF71\uFF72\uFF73\uFF74\uFF75",
    );
  });

  test("converts dakuten katakana", () => {
    expect(toHalfwidth("\u30AC\u30AE\u30B0\u30B2\u30B4")).toBe(
      "\uFF76\uFF9E\uFF77\uFF9E\uFF78\uFF9E\uFF79\uFF9E\uFF7A\uFF9E",
    );
  });

  test("converts handakuten katakana", () => {
    expect(toHalfwidth("\u30D1\u30D4\u30D7\u30DA\u30DD")).toBe(
      "\uFF8A\uFF9F\uFF8B\uFF9F\uFF8C\uFF9F\uFF8D\uFF9F\uFF8E\uFF9F",
    );
  });

  test("converts fullwidth space", () => {
    expect(toHalfwidth("\u3000")).toBe(" ");
  });

  test("leaves halfwidth unchanged", () => {
    expect(toHalfwidth("abc123")).toBe("abc123");
  });

  test("respects options: alphanumeric only", () => {
    expect(
      toHalfwidth("\uFF21\u30A2\u30A4", {
        alphanumeric: true,
        katakana: false,
        symbol: false,
      }),
    ).toBe("A\u30A2\u30A4");
  });

  test("returns empty string for empty input", () => {
    expect(toHalfwidth("")).toBe("");
  });
});

describe("toFullwidth", () => {
  test("converts halfwidth alphanumeric to fullwidth", () => {
    expect(toFullwidth("Abc123")).toBe("\uFF21\uFF42\uFF43\uFF11\uFF12\uFF13");
  });

  test("converts halfwidth katakana to fullwidth", () => {
    expect(toFullwidth("\uFF71\uFF72\uFF73\uFF74\uFF75")).toBe(
      "\u30A2\u30A4\u30A6\u30A8\u30AA",
    );
  });

  test("converts halfwidth katakana with dakuten", () => {
    expect(toFullwidth("\uFF76\uFF9E\uFF77\uFF9E\uFF78\uFF9E")).toBe(
      "\u30AC\u30AE\u30B0",
    );
  });

  test("converts halfwidth katakana with handakuten", () => {
    expect(toFullwidth("\uFF8A\uFF9F\uFF8B\uFF9F\uFF8C\uFF9F")).toBe(
      "\u30D1\u30D4\u30D7",
    );
  });

  test("converts halfwidth space to fullwidth", () => {
    expect(toFullwidth(" ")).toBe("\u3000");
  });

  test("returns empty string for empty input", () => {
    expect(toFullwidth("")).toBe("");
  });
});

describe("convert", () => {
  test("delegates to toHalfwidth", () => {
    expect(convert("\uFF21", "toHalfwidth")).toBe("A");
  });

  test("delegates to toFullwidth", () => {
    expect(convert("A", "toFullwidth")).toBe("\uFF21");
  });
});
