import { describe, it, expect } from "vitest";
import {
  countChars,
  countCharsNoSpaces,
  countWords,
  countLines,
  countBytes,
} from "../text-counting";

// ── countChars ────────────────────────────────────────────────────────────────
describe("countChars", () => {
  it("空文字列は0を返す", () => {
    expect(countChars("")).toBe(0);
  });

  it("ASCII文字を正しくカウントする", () => {
    expect(countChars("hello")).toBe(5);
  });

  it("日本語文字を正しくカウントする", () => {
    expect(countChars("こんにちは")).toBe(5);
  });

  it("混在コンテンツを正しくカウントする", () => {
    expect(countChars("Hello 世界")).toBe(8);
  });

  it("絵文字（サロゲートペア）を1文字としてカウントする", () => {
    // UTF-16では2コードユニット（length=2）だが、コードポイントとしては1
    expect(countChars("😀")).toBe(1);
  });

  it("絵文字を含む混在文字列を正しくカウントする", () => {
    // "あ"(1) + "a"(1) + "😀"(1) = 3
    expect(countChars("あa😀")).toBe(3);
  });
});

// ── countCharsNoSpaces ────────────────────────────────────────────────────────
describe("countCharsNoSpaces", () => {
  it("空文字列は0を返す", () => {
    expect(countCharsNoSpaces("")).toBe(0);
  });

  it("スペースを除外してカウントする", () => {
    expect(countCharsNoSpaces("hello world")).toBe(10);
  });

  it("タブ・改行も除外する", () => {
    expect(countCharsNoSpaces("a\tb\nc")).toBe(3);
  });

  it("絵文字（サロゲートペア）はスペース除外後に1文字としてカウントする", () => {
    // "a"(1) + " "(除外) + "😀"(1) = 2
    expect(countCharsNoSpaces("a 😀")).toBe(2);
  });
});

// ── countWords ────────────────────────────────────────────────────────────────
describe("countWords", () => {
  it("空文字列は0を返す", () => {
    expect(countWords("")).toBe(0);
  });

  it("空白のみの文字列は0を返す", () => {
    expect(countWords("   ")).toBe(0);
  });

  it("英語の単語を正しくカウントする", () => {
    expect(countWords("hello world")).toBe(2);
  });

  it("複数スペースがあっても正しくカウントする", () => {
    expect(countWords("hello   world")).toBe(2);
  });
});

// ── countLines ────────────────────────────────────────────────────────────────
describe("countLines", () => {
  it("空文字列は0を返す", () => {
    expect(countLines("")).toBe(0);
  });

  it("1行は1を返す", () => {
    expect(countLines("hello")).toBe(1);
  });

  it("改行を正しくカウントする", () => {
    expect(countLines("line1\nline2\nline3")).toBe(3);
  });

  it("末尾の改行もカウントする", () => {
    expect(countLines("line1\n")).toBe(2);
  });
});

// ── countBytes ────────────────────────────────────────────────────────────────
describe("countBytes", () => {
  it("空文字列は0バイトを返す", () => {
    expect(countBytes("")).toBe(0);
  });

  it("ASCII文字は各1バイト", () => {
    expect(countBytes("hello")).toBe(5);
  });

  it("ひらがなはUTF-8で各3バイト", () => {
    expect(countBytes("あ")).toBe(3);
    expect(countBytes("こんにちは")).toBe(15);
  });

  it("絵文字はUTF-8で4バイト", () => {
    expect(countBytes("😀")).toBe(4);
  });
});
