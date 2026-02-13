import { describe, test, expect } from "vitest";
import { encodeBase64, decodeBase64 } from "../logic";

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
});
