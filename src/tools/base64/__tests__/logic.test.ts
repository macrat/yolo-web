import { describe, test, expect } from "vitest";
import { encodeBase64, decodeBase64, toUrlSafe, fromUrlSafe } from "../logic";

describe("encodeBase64", () => {
  test("空の文字列は空", () => {
    expect(encodeBase64("")).toBe("");
  });

  test("ASCII の文", () => {
    expect(encodeBase64("Hello, World!")).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  test("日本語の文（UTF-8）", () => {
    expect(encodeBase64("こんにちは")).toBe("44GT44KT44Gr44Gh44Gv");
  });

  test("和文と欧文の混ざった文をデコードで戻せる", () => {
    expect(decodeBase64(encodeBase64("Hello 世界"))).toEqual({
      success: true,
      output: "Hello 世界",
    });
  });
});

describe("decodeBase64", () => {
  test("空の文字列は空", () => {
    expect(decodeBase64("")).toEqual({ success: true, output: "" });
  });

  test("ASCII の Base64", () => {
    expect(decodeBase64("SGVsbG8sIFdvcmxkIQ==")).toEqual({
      success: true,
      output: "Hello, World!",
    });
  });

  test("日本語の Base64（UTF-8）", () => {
    expect(decodeBase64("44GT44KT44Gr44Gh44Gv")).toEqual({
      success: true,
      output: "こんにちは",
    });
  });

  test("URL-safe 形の Base64", () => {
    expect(decodeBase64(toUrlSafe(encodeBase64("テスト文字列")))).toEqual({
      success: true,
      output: "テスト文字列",
    });
  });

  test("URL-safe 形でパディングの無い Base64", () => {
    expect(decodeBase64("dGVzdA")).toEqual({ success: true, output: "test" });
  });

  test("末尾の「=」が多すぎても、字の数から補って読む", () => {
    expect(decodeBase64("SGVsbG8==")).toEqual({
      success: true,
      output: "Hello",
    });
  });

  describe("空白と改行を読み飛ばす", () => {
    test.each([
      ["末尾の改行（端末の出力を写したとき）", "SGVsbG8=\n", "Hello"],
      ["末尾の CRLF", "SGVsbG8=\r\n", "Hello"],
      ["4字の区切りでない所の改行", "SGVs\nbG8=", "Hello"],
      ["4字の区切りでの改行", "SGVsbG8gV29y\nbGQh", "Hello World!"],
      ["前後の空白", "  SGVsbG8=  ", "Hello"],
      ["タブ", "\tSGVsbG8=", "Hello"],
      ["パディングの無い入力の後ろの改行", "dGVzdA\n", "test"],
    ])("%s", (_, input, expected) => {
      expect(decodeBase64(input)).toEqual({ success: true, output: expected });
    });

    test("76字ごとに改行した MIME の形", () => {
      const text =
        "Base64は、画像やバイナリをテキストに埋め込む方式です。".repeat(4);
      const encoded = encodeBase64(text);
      const mime = encoded.match(/.{1,76}/g)!.join("\r\n") + "\r\n";
      expect(mime.split("\r\n").length).toBeGreaterThan(2);
      expect(decodeBase64(mime)).toEqual({ success: true, output: text });
    });

    test("空白だけの入力は空", () => {
      expect(decodeBase64(" \n ")).toEqual({ success: true, output: "" });
    });
  });

  describe("読めない理由", () => {
    test("Base64 に使わない字は、最初のその字を返す", () => {
      expect(decodeBase64("SGV$bG8!")).toEqual({
        success: false,
        error: { kind: "invalid-char", char: "$" },
      });
    });

    test("途中の「=」", () => {
      expect(decodeBase64("SGk=SGk=")).toEqual({
        success: false,
        error: { kind: "misplaced-padding" },
      });
    });

    test("字の数が4で割って1余る", () => {
      expect(decodeBase64("SGVsb")).toEqual({
        success: false,
        error: { kind: "incomplete" },
      });
    });

    test("中身が UTF-8 の文字でない", () => {
      // 0xfb 0xff は UTF-8 として読めないバイトの並び。
      expect(decodeBase64("-_8=")).toEqual({
        success: false,
        error: { kind: "not-text" },
      });
    });

    test("和文の字の途中で切れた入力は、文字として読めない", () => {
      expect(decodeBase64("44")).toEqual({
        success: false,
        error: { kind: "not-text" },
      });
    });
  });
});

describe("toUrlSafe", () => {
  test("'+' を '-' に、'/' を '_' にし、'=' は残す", () => {
    expect(toUrlSafe("SGVs+bG8/IFdvcmxk==")).toBe("SGVs-bG8_IFdvcmxk==");
  });

  test("変える字の無い文字列はそのまま", () => {
    expect(toUrlSafe("SGVsbG8sIFdvcmxkIQ==")).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  test("空の文字列は空", () => {
    expect(toUrlSafe("")).toBe("");
  });
});

describe("fromUrlSafe", () => {
  test("'-' を '+' に、'_' を '/' にする", () => {
    expect(fromUrlSafe("aa-_aa==")).toBe("aa+/aa==");
  });

  test("変える字の無い文字列はそのまま", () => {
    expect(fromUrlSafe("SGVsbG8sIFdvcmxkIQ==")).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  test("空の文字列は空", () => {
    expect(fromUrlSafe("")).toBe("");
  });

  test("足りないパディングを4字の区切りまで補う", () => {
    expect(fromUrlSafe("dGVzdA")).toBe("dGVzdA==");
  });
});
