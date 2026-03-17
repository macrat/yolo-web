/**
 * Tests to verify that the fortune module has been correctly moved to src/play/fortune/.
 */

import { describe, it, expect } from "vitest";
import { hashDate, mulberry32, selectFortune } from "@/play/fortune/logic";
import { DAILY_FORTUNES } from "@/play/fortune/data/daily-fortunes";

describe("fortune module at src/play/fortune/", () => {
  it("hashDate returns a consistent value for the same input", () => {
    const hash1 = hashDate("2026-03-18");
    const hash2 = hashDate("2026-03-18");
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe("number");
  });

  it("hashDate returns different values for different dates", () => {
    const hash1 = hashDate("2026-03-18");
    const hash2 = hashDate("2026-03-19");
    expect(hash1).not.toBe(hash2);
  });

  it("mulberry32 returns a value in [0, 1)", () => {
    const result = mulberry32(12345);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });

  it("selectFortune returns a DailyFortuneEntry with required fields", () => {
    const entry = selectFortune("2026-03-18", 42);
    expect(entry).toHaveProperty("id");
    expect(entry).toHaveProperty("title");
    expect(entry).toHaveProperty("description");
    expect(entry).toHaveProperty("luckyItem");
    expect(entry).toHaveProperty("luckyAction");
    expect(entry).toHaveProperty("rating");
    expect(typeof entry.rating).toBe("number");
  });

  it("DAILY_FORTUNES is a non-empty array", () => {
    expect(Array.isArray(DAILY_FORTUNES)).toBe(true);
    expect(DAILY_FORTUNES.length).toBeGreaterThan(0);
  });

  it("each fortune entry has the required DailyFortuneEntry fields", () => {
    for (const entry of DAILY_FORTUNES) {
      expect(typeof entry.id).toBe("string");
      expect(typeof entry.title).toBe("string");
      expect(typeof entry.description).toBe("string");
      expect(typeof entry.luckyItem).toBe("string");
      expect(typeof entry.luckyAction).toBe("string");
      expect(typeof entry.rating).toBe("number");
    }
  });

  it("selectFortune always returns an entry from DAILY_FORTUNES", () => {
    const entry = selectFortune("2026-03-18", 42);
    const ids = DAILY_FORTUNES.map((f) => f.id);
    expect(ids).toContain(entry.id);
  });
});
