import { describe, it, expect } from "vitest";
import { formatDate, getDayOfYearJst } from "@/lib/date";

describe("formatDate", () => {
  it("ISO 8601タイムスタンプからYYYY-MM-DD形式を返す", () => {
    expect(formatDate("2026-02-14T07:57:19+09:00")).toBe("2026-02-14");
  });

  it("日付のみの入力はそのまま返す", () => {
    expect(formatDate("2026-02-14")).toBe("2026-02-14");
  });

  it("深夜のJSTタイムスタンプが正しい日付を返す", () => {
    // 2026-02-15T01:09:04+09:00 はUTCだと2/14だがJSTでは2/15
    expect(formatDate("2026-02-15T01:09:04+09:00")).toBe("2026-02-15");
  });

  it("23時台のJSTタイムスタンプが正しい日付を返す", () => {
    expect(formatDate("2026-02-18T23:29:56+09:00")).toBe("2026-02-18");
  });
});

describe("getDayOfYearJst", () => {
  it("1月1日（JST）に1を返す", () => {
    // 2026-01-01T00:00:00+09:00 = 2025-12-31T15:00:00Z
    const jan1Jst = new Date("2025-12-31T15:00:00Z");
    expect(getDayOfYearJst(jan1Jst)).toBe(1);
  });

  it("1月2日（JST）に2を返す", () => {
    // 2026-01-02T00:00:00+09:00 = 2026-01-01T15:00:00Z
    const jan2Jst = new Date("2026-01-01T15:00:00Z");
    expect(getDayOfYearJst(jan2Jst)).toBe(2);
  });

  it("UTC深夜（JST未明）でもJSTの日付で計算する", () => {
    // 2026-01-01T15:00:00Z はUTCでは1月1日だがJSTでは1月2日の0:00
    // getDayOfYearJst は JST ベースで 2 を返す
    const utcJan1Night = new Date("2026-01-01T15:00:00Z");
    expect(getDayOfYearJst(utcJan1Night)).toBe(2);
  });

  it("12月31日（JST、平年）に365を返す", () => {
    // 2026-12-31T00:00:00+09:00 = 2026-12-30T15:00:00Z
    const dec31Jst = new Date("2026-12-30T15:00:00Z");
    expect(getDayOfYearJst(dec31Jst)).toBe(365);
  });

  it("UTC 23:59 が JST では翌日扱いになる境界ケース", () => {
    // 2026-01-01T23:59:00Z はUTCでは1月1日だが、JSTでは2026-01-02T08:59（2日目）
    const utcLastMinute = new Date("2026-01-01T23:59:00Z");
    expect(getDayOfYearJst(utcLastMinute)).toBe(2);
  });

  it("引数なし（現在時刻）で1以上の整数を返す", () => {
    const result = getDayOfYearJst();
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(366);
    expect(Number.isInteger(result)).toBe(true);
  });
});
