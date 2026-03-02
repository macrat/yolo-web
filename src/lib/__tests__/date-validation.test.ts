import { describe, test, expect } from "vitest";
import { parseDate, formatDate } from "../date-validation";

describe("parseDate", () => {
  // --- 正常系 ---

  test("parses a valid date correctly", () => {
    const d = parseDate("2026-02-14");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(1);
    expect(d!.getDate()).toBe(14);
  });

  test("parses leap year Feb 29 correctly", () => {
    const d = parseDate("2024-02-29");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2024);
    expect(d!.getMonth()).toBe(1);
    expect(d!.getDate()).toBe(29);
  });

  test("parses first day of month correctly", () => {
    const d = parseDate("2026-01-01");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(0);
    expect(d!.getDate()).toBe(1);
  });

  test("parses last day of month correctly", () => {
    const d = parseDate("2026-01-31");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(0);
    expect(d!.getDate()).toBe(31);
  });

  test("round-trips with formatDate", () => {
    const original = new Date(1990, 5, 15);
    const formatted = formatDate(original);
    const parsed = parseDate(formatted);
    expect(parsed).not.toBeNull();
    expect(parsed!.getFullYear()).toBe(1990);
    expect(parsed!.getMonth()).toBe(5);
    expect(parsed!.getDate()).toBe(15);
  });

  // --- 異常系: ラウンドトリップ検証で弾かれるケース ---

  test("rejects Feb 31 (does not exist)", () => {
    expect(parseDate("2026-02-31")).toBeNull();
  });

  test("rejects Feb 29 in non-leap year", () => {
    expect(parseDate("2026-02-29")).toBeNull();
  });

  test("rejects Apr 31 (does not exist)", () => {
    expect(parseDate("2026-04-31")).toBeNull();
  });

  test("rejects Jun 31 (does not exist)", () => {
    expect(parseDate("2026-06-31")).toBeNull();
  });

  test("rejects month 13 (does not exist)", () => {
    expect(parseDate("2026-13-01")).toBeNull();
  });

  test("rejects month 0 (does not exist)", () => {
    expect(parseDate("2026-00-01")).toBeNull();
  });

  test("rejects day 0 (does not exist)", () => {
    expect(parseDate("2026-01-00")).toBeNull();
  });

  // --- 形式検証 ---

  test("rejects non-date string", () => {
    expect(parseDate("invalid")).toBeNull();
  });

  test("rejects slash-separated format", () => {
    expect(parseDate("2026/02/14")).toBeNull();
  });

  test("rejects hyphen-less format", () => {
    expect(parseDate("20260214")).toBeNull();
  });

  test("rejects empty string", () => {
    expect(parseDate("")).toBeNull();
  });
});

describe("formatDate", () => {
  test("formats date as YYYY-MM-DD", () => {
    expect(formatDate(new Date(2026, 1, 14))).toBe("2026-02-14");
  });

  test("zero-pads single-digit month and day", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
