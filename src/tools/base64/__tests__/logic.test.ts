import { describe, test, expect } from "vitest";
import { encodeBase64, decodeBase64, toUrlSafe, fromUrlSafe } from "../logic";

describe("encodeBase64", () => {
  test("encodes empty string", () => {
    const result = encodeBase64("");
    expect(result.success).toBe(true);
    expect(result.output).toBe("");
  });

  test("encodes ASCII text", () => {
    const result = encodeBase64("Hello, World!");
    expect(result.success).toBe(true);
    expect(result.output).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  test("encodes Japanese text (UTF-8)", () => {
    const result = encodeBase64("こんにちは");
    expect(result.success).toBe(true);
    expect(result.output).toBe("44GT44KT44Gr44Gh44Gv");
  });

  test("encodes mixed content", () => {
    const result = encodeBase64("Hello 世界");
    expect(result.success).toBe(true);
    // Verify round-trip
    const decoded = decodeBase64(result.output);
    expect(decoded.output).toBe("Hello 世界");
  });
});

describe("decodeBase64", () => {
  test("decodes empty string", () => {
    const result = decodeBase64("");
    expect(result.success).toBe(true);
    expect(result.output).toBe("");
  });

  test("decodes ASCII Base64", () => {
    const result = decodeBase64("SGVsbG8sIFdvcmxkIQ==");
    expect(result.success).toBe(true);
    expect(result.output).toBe("Hello, World!");
  });

  test("decodes Japanese Base64 (UTF-8)", () => {
    const result = decodeBase64("44GT44KT44Gr44Gh44Gv");
    expect(result.success).toBe(true);
    expect(result.output).toBe("こんにちは");
  });

  test("returns error for invalid Base64", () => {
    const result = decodeBase64("not-valid-base64!!!");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("URL-safe 文字を含む Base64 がデコード試行される（失敗も含む）", () => {
    // URL-safe 文字 '-'/'_' を含む文字列を渡しても例外を投げず
    // success または failure の結果オブジェクトを返すことを確認
    // "+/8=" の URL-safe 版: "-_8=" (0xfb, 0xff は UTF-8 不正なので failure になる)
    const result = decodeBase64("-_8=");
    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });
});

describe("toUrlSafe", () => {
  test("標準 Base64 を URL-safe Base64 に変換する", () => {
    // '+' → '-', '/' → '_' に置換。'=' のパディングは削除しない
    expect(toUrlSafe("SGVs+bG8/IFdvcmxk")).toBe("SGVs-bG8_IFdvcmxk");
  });

  test("変換不要な文字列はそのまま返す", () => {
    expect(toUrlSafe("SGVsbG8sIFdvcmxkIQ==")).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  test("空文字はそのまま返す", () => {
    expect(toUrlSafe("")).toBe("");
  });

  test("パディングなし URL-safe をそのまま返す", () => {
    expect(toUrlSafe("dGVzdA")).toBe("dGVzdA");
  });
});

describe("fromUrlSafe", () => {
  test("URL-safe Base64 の '-' を '+' に、'_' を '/' に変換する", () => {
    // パディング付き URL-safe → 標準 Base64（パディングはそのまま）
    // "aa-_aa==" → "aa+/aa=="
    expect(fromUrlSafe("aa-_aa==")).toBe("aa+/aa==");
  });

  test("変換不要な文字列はそのまま返す", () => {
    expect(fromUrlSafe("SGVsbG8sIFdvcmxkIQ==")).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  test("空文字はそのまま返す", () => {
    expect(fromUrlSafe("")).toBe("");
  });

  test("パディングなし URL-safe → パディング補完した標準 Base64 を返す", () => {
    // "dGVzdA" (6文字) → 6 % 4 = 2 余り → "==" を補完 → "dGVzdA=="
    expect(fromUrlSafe("dGVzdA")).toBe("dGVzdA==");
  });
});

describe("decodeBase64 with URL-safe input", () => {
  test("URL-safe 文字 '-' と '_' を含む Base64 が正常にデコードされる", () => {
    // "Hello, World!" の Base64: "SGVsbG8sIFdvcmxkIQ=="
    // 標準でエンコードしてからURL-safeへ変換し、デコードできるか確認
    const encoded = encodeBase64("テスト文字列");
    const urlSafe = toUrlSafe(encoded.output);
    // URL-safe 版をデコードできるか
    const decoded = decodeBase64(urlSafe);
    expect(decoded.success).toBe(true);
    expect(decoded.output).toBe("テスト文字列");
  });

  test("パディングなし URL-safe Base64 がデコードされる", () => {
    // "test" のエンコード: "dGVzdA==" → URL-safe かつパディングなし: "dGVzdA"
    const result = decodeBase64("dGVzdA");
    expect(result.success).toBe(true);
    expect(result.output).toBe("test");
  });
});
