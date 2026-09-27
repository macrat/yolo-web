import { describe, test, expect, beforeEach, vi } from "vitest";
import { generateQrCode } from "../logic";

// jsdom はキャンバスを描けないので、描く先を差し替え、PNG を求めていることと描いた大きさを確かめる。
function mockCanvas() {
  const ctx = {
    fillStyle: "",
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(
    (type?: string) => `data:${type};base64,mock`,
  );
  return ctx;
}

/** 型の一辺のモジュールの数から、周りの4モジュールの余白を含めた、画面に見せる一辺の CSS px（1モジュール 4px）。 */
function displaySize(modules: number): number {
  return (modules + 4 * 2) * 4;
}

describe("generateQrCode", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("PNG の data URL と、画面に見せる一辺の大きさを返す", () => {
    mockCanvas();
    const result = generateQrCode("Hello, World!");
    expect(result).toEqual({
      success: true,
      dataUrl: "data:image/png;base64,mock",
      size: displaySize(21),
    });
  });

  test("PNG は画面の2倍の画素で描き、周りの4モジュールを白で塗り、モジュールをその内側に描く", () => {
    const ctx = mockCanvas();
    generateQrCode("https://example.com");
    const pixels = displaySize(25) * 2;
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, pixels, pixels);
    expect(ctx.translate).toHaveBeenCalledWith(4 * 8, 4 * 8);
  });

  test("どのエラー訂正レベルでも作れ、レベルが高いほど型が大きくなりうる", () => {
    mockCanvas();
    const sizes = (["L", "M", "Q", "H"] as const).map((level) => {
      const result = generateQrCode("https://yolos.net/tools/qr-code", level);
      if (!result.success) throw new Error(level);
      return result.size;
    });
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(sizes[3]).toBeGreaterThan(sizes[0]);
  });

  test("日本語の文を UTF-8 のバイトで符号にする", () => {
    mockCanvas();
    // 「こんにちは」は UTF-8 で15バイト。M の1型のバイトの容量（14）を超えるので2型（25モジュール）になる。
    // 字のコードの下位8ビットだけを取ると5バイトになり、1型（21モジュール）に収まってしまう。
    const result = generateQrCode("こんにちは");
    expect(result).toMatchObject({ success: true, size: displaySize(25) });
  });

  test("容量を超える文は tooLong を返す", () => {
    mockCanvas();
    expect(generateQrCode("a".repeat(3000), "H")).toEqual({
      success: false,
      error: "tooLong",
    });
  });

  test("キャンバスを描けないときは failed を返す", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(generateQrCode("hello")).toEqual({
      success: false,
      error: "failed",
    });
  });
});
