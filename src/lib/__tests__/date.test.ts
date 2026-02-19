import { describe, it, expect } from "vitest";
import { formatDate } from "@/lib/date";

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
