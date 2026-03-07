import { describe, it, expect } from "vitest";
import { toUtcDaySerial, diffUtcCalendarDays } from "../utc-day-serial";

describe("toUtcDaySerial", () => {
  it("returns the same serial for the same local calendar date with different times", () => {
    const d1 = new Date(2024, 2, 10, 0, 30);
    const d2 = new Date(2024, 2, 10, 23, 30);

    expect(toUtcDaySerial(d1)).toBe(toUtcDaySerial(d2));
  });
});

describe("diffUtcCalendarDays", () => {
  it("returns 1 across DST boundary with explicit offsets", () => {
    const d1 = new Date("2024-03-10T00:00:00-08:00");
    const d2 = new Date("2024-03-11T00:00:00-07:00");

    expect(diffUtcCalendarDays(d1, d2)).toBe(1);
  });

  it("returns 2 across leap day boundary", () => {
    const d1 = new Date(2024, 1, 28);
    const d2 = new Date(2024, 2, 1);

    expect(diffUtcCalendarDays(d1, d2)).toBe(2);
  });
});
