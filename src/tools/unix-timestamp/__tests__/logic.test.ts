import { describe, test, expect } from "vitest";
import {
  getCurrentTimestamp,
  getCurrentTimestampMs,
  timestampToDate,
  dateToTimestamp,
} from "../logic";

describe("getCurrentTimestamp", () => {
  test("returns a number", () => {
    const ts = getCurrentTimestamp();
    expect(typeof ts).toBe("number");
    expect(ts).toBeGreaterThan(0);
  });

  test("returns seconds (not milliseconds)", () => {
    const ts = getCurrentTimestamp();
    // Reasonable range: after 2020-01-01 and before 2100-01-01
    expect(ts).toBeGreaterThan(1577836800);
    expect(ts).toBeLessThan(4102444800);
  });
});

describe("getCurrentTimestampMs", () => {
  test("returns milliseconds", () => {
    const ts = getCurrentTimestampMs();
    expect(ts).toBeGreaterThan(1577836800000);
  });
});

describe("timestampToDate", () => {
  test("converts Unix epoch 0", () => {
    const result = timestampToDate(0);
    expect(result).not.toBeNull();
    expect(result!.isoString).toBe("1970-01-01T00:00:00.000Z");
    expect(result!.seconds).toBe(0);
    expect(result!.milliseconds).toBe(0);
  });

  test("converts a known timestamp", () => {
    // 2024-01-01T00:00:00Z = 1704067200
    const result = timestampToDate(1704067200);
    expect(result).not.toBeNull();
    expect(result!.isoString).toBe("2024-01-01T00:00:00.000Z");
  });

  test("handles milliseconds flag", () => {
    const result = timestampToDate(1704067200000, true);
    expect(result).not.toBeNull();
    expect(result!.isoString).toBe("2024-01-01T00:00:00.000Z");
  });

  test("returns null for NaN", () => {
    const result = timestampToDate(NaN);
    expect(result).toBeNull();
  });

  test("includes date components", () => {
    const result = timestampToDate(1704067200);
    expect(result).not.toBeNull();
    expect(result!.date.year).toBe(2024);
    expect(result!.date.month).toBe(1);
    expect(result!.date.day).toBe(1);
  });
});

describe("dateToTimestamp", () => {
  test("converts a date to timestamp", () => {
    // Using UTC-equivalent local time is tricky, so just check it returns something valid
    const result = dateToTimestamp(2024, 1, 1, 0, 0, 0);
    expect(result).not.toBeNull();
    expect(result!.seconds).toBeGreaterThan(0);
    expect(result!.milliseconds).toBe(result!.seconds * 1000);
  });

  test("handles year, month, day only", () => {
    const result = dateToTimestamp(2024, 6, 15);
    expect(result).not.toBeNull();
  });

  test("returns null for invalid date", () => {
    const result = dateToTimestamp(NaN, 1, 1);
    expect(result).toBeNull();
  });
});
