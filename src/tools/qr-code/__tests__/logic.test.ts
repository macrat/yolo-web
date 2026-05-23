import { describe, test, expect, beforeAll, vi } from "vitest";
import { generateQrCode } from "../logic";

// jsdom は HTMLCanvasElement.getContext() が未実装のため、canvas 操作をモック化する。
// logic.ts が「image/png 形式を要求している」ことを assertion で確認する設計（計画書 T-2 E 手順3）。
function setupCanvasMock() {
  const mockCtx = {
    fillStyle: "",
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
  };

  // getContext は mockCtx を返し、toDataURL は PNG DataURL を返す
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    mockCtx as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(
    (type?: string) => `data:${type ?? "image/png"};base64,mockdata`,
  );
}

describe("generateQrCode", () => {
  beforeAll(() => {
    setupCanvasMock();
  });

  test("returns error for empty input", () => {
    const result = generateQrCode("");
    expect(result.success).toBe(false);
  });

  test("generates QR code for simple text", () => {
    const result = generateQrCode("Hello, World!");
    expect(result.success).toBe(true);
    expect(result.svgTag).toContain("<svg");
    // 案Y採択: logic.ts が toDataURL("image/png") を要求していることを確認する
    expect(result.dataUrl).toContain("data:image/png");
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
