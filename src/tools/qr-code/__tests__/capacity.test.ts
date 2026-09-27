import { describe, test, expect, beforeAll, vi } from "vitest";
import { generateQrCode, type ErrorCorrectionLevel } from "../logic";
import { MAX_BYTES, maxChars } from "../capacity";

const LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

// 容量の表を、道具が実際に作れる境で確かめる。jsdom はキャンバスを描けないので描く先だけ差し替える。
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,mock",
  );
});

describe("QRコードに入る字の数", () => {
  test("既定（M）と L の数は、FAQ で言う数と同じ", () => {
    expect(maxChars("M")).toEqual({ ascii: 2331, japanese: 777 });
    expect(maxChars("L")).toEqual({ ascii: 2953, japanese: 984 });
  });

  test.each(LEVELS)(
    "%s: 半角英数も数字だけの文も、表の数ちょうどまで入る",
    (level) => {
      const max = maxChars(level).ascii;
      for (const char of ["a", "1"]) {
        expect(generateQrCode(char.repeat(max), level).success).toBe(true);
        expect(generateQrCode(char.repeat(max + 1), level)).toEqual({
          success: false,
          error: "tooLong",
        });
      }
    },
  );

  test.each(LEVELS)(
    "%s: 日本語は1字3バイトで、表の数ちょうどまで入る",
    (level) => {
      const max = maxChars(level).japanese;
      expect(max).toBe(Math.floor(MAX_BYTES[level] / 3));
      expect(generateQrCode("あ".repeat(max), level).success).toBe(true);
      expect(generateQrCode("あ".repeat(max + 1), level)).toEqual({
        success: false,
        error: "tooLong",
      });
    },
  );
});
