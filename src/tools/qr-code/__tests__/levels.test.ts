import { describe, test, expect, beforeAll, vi } from "vitest";
import { generateQrCode } from "../logic";
import {
  DEFAULT_LEVEL,
  MAX_BYTES,
  levelName,
  maxChars,
  type ErrorCorrectionLevel,
} from "../levels";
import { meta } from "../meta";

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
  test("M と L で入る字の数", () => {
    expect(maxChars("M")).toEqual({ ascii: 2331, japanese: 777 });
    expect(maxChars("L")).toEqual({ ascii: 2953, japanese: 984 });
  });

  test("FAQ の長さの答えが、既定のレベル（中）と L の名前と入る字の数を言う", () => {
    expect(DEFAULT_LEVEL).toBe("M");
    const answer = meta.faq!.find((entry) =>
      entry.question.includes("長さ"),
    )!.answer;
    expect(answer).toContain(
      "既定のエラー訂正レベル「中（M）」では、半角英数（数字だけの文も同じ）なら2,331字、日本語なら777字まで入ります。",
    );
    expect(answer).toContain(
      "いちばん低いレベル「低（L）」にすると、半角英数なら2,953字、日本語なら984字まで増えます。",
    );
  });

  test("レベルを文の中で名前で指す", () => {
    expect(levelName("L")).toBe("低（L）");
    expect(levelName("H")).toBe("最高（H）");
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
