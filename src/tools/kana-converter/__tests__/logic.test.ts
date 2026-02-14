import { describe, test, expect } from "vitest";
import { convertKana } from "../logic";

describe("hiragana-to-katakana", () => {
  test("converts basic hiragana", () => {
    expect(convertKana("あいうえお", "hiragana-to-katakana")).toBe(
      "アイウエオ",
    );
  });

  test("converts dakuon", () => {
    expect(convertKana("がぎぐげご", "hiragana-to-katakana")).toBe(
      "ガギグゲゴ",
    );
  });

  test("converts handakuon", () => {
    expect(convertKana("ぱぴぷぺぽ", "hiragana-to-katakana")).toBe(
      "パピプペポ",
    );
  });

  test("converts small kana", () => {
    expect(convertKana("ぁぃぅぇぉ", "hiragana-to-katakana")).toBe(
      "ァィゥェォ",
    );
  });

  test("leaves non-hiragana characters unchanged", () => {
    expect(convertKana("ひらがなとASCII123", "hiragana-to-katakana")).toBe(
      "ヒラガナトASCII123",
    );
  });

  test("converts vu (ゔ -> ヴ)", () => {
    expect(convertKana("ゔ", "hiragana-to-katakana")).toBe("ヴ");
  });

  test("handles empty string", () => {
    expect(convertKana("", "hiragana-to-katakana")).toBe("");
  });
});

describe("katakana-to-hiragana", () => {
  test("converts basic katakana", () => {
    expect(convertKana("アイウエオ", "katakana-to-hiragana")).toBe(
      "あいうえお",
    );
  });

  test("converts vu (ヴ -> ゔ)", () => {
    expect(convertKana("ヴ", "katakana-to-hiragana")).toBe("ゔ");
  });

  test("leaves katakana-only characters unchanged", () => {
    // ヷヸヹヺ are U+30F7-U+30FA, outside the convertible range
    expect(convertKana("ヷヸヹヺ", "katakana-to-hiragana")).toBe("ヷヸヹヺ");
  });

  test("handles empty string", () => {
    expect(convertKana("", "katakana-to-hiragana")).toBe("");
  });
});

describe("to-fullwidth-katakana", () => {
  test("converts basic halfwidth katakana", () => {
    expect(convertKana("ｱｲｳ", "to-fullwidth-katakana")).toBe("アイウ");
  });

  test("combines dakuten", () => {
    expect(convertKana("ｶﾞ", "to-fullwidth-katakana")).toBe("ガ");
  });

  test("combines handakuten", () => {
    expect(convertKana("ﾊﾟ", "to-fullwidth-katakana")).toBe("パ");
  });

  test("handles empty string", () => {
    expect(convertKana("", "to-fullwidth-katakana")).toBe("");
  });

  test("leaves non-halfwidth characters unchanged", () => {
    expect(convertKana("ABCアイウ", "to-fullwidth-katakana")).toBe(
      "ABCアイウ",
    );
  });
});

describe("to-halfwidth-katakana", () => {
  test("converts basic fullwidth katakana", () => {
    expect(convertKana("アイウ", "to-halfwidth-katakana")).toBe("ｱｲｳ");
  });

  test("decomposes dakuten", () => {
    expect(convertKana("ガ", "to-halfwidth-katakana")).toBe("ｶﾞ");
  });

  test("decomposes handakuten", () => {
    expect(convertKana("パ", "to-halfwidth-katakana")).toBe("ﾊﾟ");
  });

  test("handles empty string", () => {
    expect(convertKana("", "to-halfwidth-katakana")).toBe("");
  });
});
