import { describe, test, expect } from "vitest";
import { isValidBase64Image, parseBase64Image, formatFileSize } from "../logic";

describe("isValidBase64Image", () => {
  test("valid PNG Data URI", () => {
    expect(isValidBase64Image("data:image/png;base64,iVBORw0KGgo=")).toBe(true);
  });

  test("valid JPEG Data URI", () => {
    expect(isValidBase64Image("data:image/jpeg;base64,/9j/4AAQ")).toBe(true);
  });

  test("valid pure base64 string", () => {
    expect(isValidBase64Image("iVBORw0KGgo=")).toBe(true);
  });

  test("invalid: random string", () => {
    expect(isValidBase64Image("hello world")).toBe(false);
  });

  test("invalid: empty string", () => {
    expect(isValidBase64Image("")).toBe(false);
  });

  test("invalid: whitespace only", () => {
    expect(isValidBase64Image("   ")).toBe(false);
  });
});

describe("parseBase64Image", () => {
  test("parses PNG Data URI", () => {
    const result = parseBase64Image("data:image/png;base64,iVBORw0KGgo=");
    expect(result).not.toBeNull();
    expect(result!.mimeType).toBe("image/png");
    expect(result!.base64).toBe("iVBORw0KGgo=");
  });

  test("rejects SVG Data URI to prevent XSS", () => {
    const result = parseBase64Image("data:image/svg+xml;base64,PHN2Zz4=");
    expect(result).toBeNull();
  });

  test("parses pure base64 as PNG", () => {
    const result = parseBase64Image("iVBORw0KGgo=");
    expect(result).not.toBeNull();
    expect(result!.mimeType).toBe("image/png");
    expect(result!.dataUri).toBe("data:image/png;base64,iVBORw0KGgo=");
  });

  test("returns null for invalid input", () => {
    expect(parseBase64Image("hello world")).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(parseBase64Image("")).toBeNull();
  });
});

describe("formatFileSize", () => {
  test("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  test("formats KB", () => {
    expect(formatFileSize(1024)).toBe("1.00 KB");
  });

  test("formats MB", () => {
    expect(formatFileSize(1048576)).toBe("1.00 MB");
  });

  test("formats zero", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  test("formats fractional KB", () => {
    expect(formatFileSize(1536)).toBe("1.50 KB");
  });
});
