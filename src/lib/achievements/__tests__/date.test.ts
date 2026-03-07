import { describe, it, expect, vi, afterEach } from "vitest";
import { getTodayJst } from "../date";

describe("getTodayJst", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a string in YYYY-MM-DD format", () => {
    const result = getTodayJst();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns JST date, not UTC date, near midnight boundary", () => {
    // 2026-03-07T23:30:00 UTC = 2026-03-08T08:30:00 JST
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T23:30:00Z"));

    const result = getTodayJst();
    // In JST (UTC+9), this is March 8
    expect(result).toBe("2026-03-08");
  });

  it("returns correct JST date when UTC is previous day", () => {
    // 2026-01-01T00:00:00 UTC = 2026-01-01T09:00:00 JST
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const result = getTodayJst();
    expect(result).toBe("2026-01-01");
  });

  it("handles JST midnight correctly (UTC 15:00 previous day)", () => {
    // 2025-12-31T15:00:00 UTC = 2026-01-01T00:00:00 JST
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-31T15:00:00Z"));

    const result = getTodayJst();
    expect(result).toBe("2026-01-01");
  });

  it("handles late evening JST correctly", () => {
    // 2026-06-15T14:59:59 UTC = 2026-06-15T23:59:59 JST
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T14:59:59Z"));

    const result = getTodayJst();
    expect(result).toBe("2026-06-15");
  });
});
