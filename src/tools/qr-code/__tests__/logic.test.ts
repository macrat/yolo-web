import { describe, test, expect } from "vitest";
import { generateQrCode } from "../logic";

describe("generateQrCode", () => {
  test("returns error for empty input", () => {
    const result = generateQrCode("");
    expect(result.success).toBe(false);
  });

  test("generates QR code for simple text", () => {
    const result = generateQrCode("Hello, World!");
    expect(result.success).toBe(true);
    expect(result.svgTag).toContain("<svg");
    expect(result.dataUrl).toContain("data:image/gif");
  });

  test("generates QR code for URL", () => {
    const result = generateQrCode("https://example.com");
    expect(result.success).toBe(true);
    expect(result.svgTag).toContain("<svg");
  });

  test("generates QR code with different error correction levels", () => {
    const levels = ["L", "M", "Q", "H"] as const;
    for (const level of levels) {
      const result = generateQrCode("test", level);
      expect(result.success).toBe(true);
    }
  });

  test("generates QR code for Japanese text", () => {
    const result = generateQrCode("こんにちは");
    expect(result.success).toBe(true);
    expect(result.svgTag).toContain("<svg");
  });
});
