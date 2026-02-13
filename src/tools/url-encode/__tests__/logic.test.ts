import { describe, test, expect } from "vitest";
import { encodeUrl, decodeUrl } from "../logic";

describe("encodeUrl", () => {
  test("encodes Japanese text (component mode)", () => {
    const result = encodeUrl("こんにちは", "component");
    expect(result.success).toBe(true);
    expect(result.output).toBe("%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF");
  });

  test("encodes spaces and special chars (component mode)", () => {
    const result = encodeUrl("hello world&foo=bar", "component");
    expect(result.success).toBe(true);
    expect(result.output).toBe("hello%20world%26foo%3Dbar");
  });

  test("encodes in full URL mode (preserves structure)", () => {
    const result = encodeUrl("https://example.com/path?q=こんにちは", "full");
    expect(result.success).toBe(true);
    // encodeURI preserves :, /, ?, = but encodes Japanese chars
    expect(result.output).toContain("https://example.com/path?q=");
  });
});

describe("decodeUrl", () => {
  test("decodes percent-encoded Japanese", () => {
    const result = decodeUrl(
      "%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF",
      "component",
    );
    expect(result.success).toBe(true);
    expect(result.output).toBe("こんにちは");
  });

  test("decodes encoded spaces", () => {
    const result = decodeUrl("hello%20world", "component");
    expect(result.success).toBe(true);
    expect(result.output).toBe("hello world");
  });

  test("returns error for malformed encoding", () => {
    const result = decodeUrl("%ZZ", "component");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
