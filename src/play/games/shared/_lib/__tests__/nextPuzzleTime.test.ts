import { describe, expect, test } from "vitest";
import { nextPuzzleAt, nextPuzzleTimeText } from "../nextPuzzleTime";

describe("nextPuzzleAt", () => {
  test("日本時間の 23:59:59 なら、その1秒後の日本時間の 0:00", () => {
    // 2026-09-26 23:59:59 JST
    expect(nextPuzzleAt(new Date("2026-09-26T14:59:59Z")).toISOString()).toBe(
      "2026-09-26T15:00:00.000Z",
    );
  });

  test("日本時間の 0:00 ちょうどなら、次の日の日本時間の 0:00", () => {
    // 2026-09-27 00:00:00 JST
    expect(nextPuzzleAt(new Date("2026-09-26T15:00:00Z")).toISOString()).toBe(
      "2026-09-27T15:00:00.000Z",
    );
  });

  test("UTC ではまだ前の日でも、日本時間の日付で数える", () => {
    // 2026-09-27 08:30 JST（UTC では 9月26日 23:30）
    expect(nextPuzzleAt(new Date("2026-09-26T23:30:00Z")).toISOString()).toBe(
      "2026-09-27T15:00:00.000Z",
    );
  });
});

describe("nextPuzzleTimeText", () => {
  test("日本時間の日付の変わり目の直前は、その日の翌日の 0:00 を言う", () => {
    // 2026-09-26 23:59:59 JST
    expect(nextPuzzleTimeText(new Date("2026-09-26T14:59:59Z"))).toBe(
      "次の問題は 9月27日 0:00（日本時間）に出ます",
    );
  });

  test("日本時間の日付の変わり目の直後は、次の日の 0:00 を言う", () => {
    // 2026-09-27 00:00:01 JST
    expect(nextPuzzleTimeText(new Date("2026-09-26T15:00:01Z"))).toBe(
      "次の問題は 9月28日 0:00（日本時間）に出ます",
    );
  });

  test("月と年の変わり目も日本時間で数える", () => {
    // 2026-12-31 23:00 JST
    expect(nextPuzzleTimeText(new Date("2026-12-31T14:00:00Z"))).toBe(
      "次の問題は 1月1日 0:00（日本時間）に出ます",
    );
    // 2027-01-01 00:30 JST（UTC ではまだ 2026年12月31日）
    expect(nextPuzzleTimeText(new Date("2026-12-31T15:30:00Z"))).toBe(
      "次の問題は 1月2日 0:00（日本時間）に出ます",
    );
  });
});
