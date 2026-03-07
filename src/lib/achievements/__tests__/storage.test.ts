import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createDefaultStore,
  loadStore,
  saveStore,
  pruneDailyProgress,
} from "../storage";
import { STORAGE_KEY } from "../badges";
import type { AchievementStore } from "../types";

/** Helper to create a store with specific overrides */
function makeStore(
  overrides: Partial<AchievementStore> = {},
): AchievementStore {
  return { ...createDefaultStore(), ...overrides };
}

describe("createDefaultStore", () => {
  it("returns a store with schema version 1", () => {
    const store = createDefaultStore();
    expect(store.schemaVersion).toBe(1);
  });

  it("returns a store with zero streak", () => {
    const store = createDefaultStore();
    expect(store.streak.current).toBe(0);
    expect(store.streak.longest).toBe(0);
    expect(store.streak.lastPlayDate).toBe("");
  });

  it("returns a store with empty stats", () => {
    const store = createDefaultStore();
    expect(store.totalStats.totalDaysPlayed).toBe(0);
    expect(store.totalStats.totalContentUsed).toBe(0);
    expect(store.totalStats.perContent).toEqual({});
  });

  it("returns a store with empty achievements and daily progress", () => {
    const store = createDefaultStore();
    expect(store.achievements).toEqual({});
    expect(store.dailyProgress).toEqual({});
  });
});

describe("loadStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns a default store when no data exists", () => {
    const store = loadStore();
    expect(store).toEqual(createDefaultStore());
  });

  it("returns parsed store when valid data exists", () => {
    const saved = makeStore({
      streak: { current: 5, longest: 10, lastPlayDate: "2026-03-07" },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    const loaded = loadStore();
    expect(loaded).toEqual(saved);
  });

  it("returns a default store when data is invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json{{{");

    const store = loadStore();
    expect(store).toEqual(createDefaultStore());
  });

  it("returns a default store when data has wrong shape", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: "bar" }));

    const store = loadStore();
    expect(store).toEqual(createDefaultStore());
  });

  it("returns a default store when data is null object", () => {
    localStorage.setItem(STORAGE_KEY, "null");

    const store = loadStore();
    expect(store).toEqual(createDefaultStore());
  });

  it("returns a default store when schemaVersion is missing", () => {
    const invalid = {
      streak: { current: 0, longest: 0, lastPlayDate: "" },
      totalStats: { totalDaysPlayed: 0, totalContentUsed: 0, perContent: {} },
      achievements: {},
      dailyProgress: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

    const store = loadStore();
    expect(store).toEqual(createDefaultStore());
  });
});

describe("saveStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the store to localStorage", () => {
    const store = makeStore({
      streak: { current: 3, longest: 7, lastPlayDate: "2026-03-07" },
    });

    saveStore(store);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(store);
  });

  it("handles QuotaExceededError gracefully", () => {
    const spy = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    const store = createDefaultStore();
    // Should not throw
    expect(() => saveStore(store)).not.toThrow();

    spy.mockRestore();
  });
});

describe("pruneDailyProgress", () => {
  it("does nothing when entries are within the limit", () => {
    const dailyProgress: Record<string, Record<string, boolean>> = {};
    for (let i = 0; i < 90; i++) {
      const day = String(i + 1).padStart(2, "0");
      dailyProgress[`2026-01-${day}`] = { irodori: true };
    }

    const store = makeStore({ dailyProgress });
    pruneDailyProgress(store);
    expect(Object.keys(store.dailyProgress)).toHaveLength(90);
  });

  it("removes oldest entries when exceeding 90-day limit", () => {
    const dailyProgress: Record<string, Record<string, boolean>> = {};
    // Create 95 entries across Jan-Apr
    for (let i = 1; i <= 95; i++) {
      const date = new Date(2026, 0, i); // Jan 1 + i days
      const formatted = date.toISOString().slice(0, 10);
      dailyProgress[formatted] = { irodori: true };
    }

    const store = makeStore({ dailyProgress });
    pruneDailyProgress(store);

    const remaining = Object.keys(store.dailyProgress).sort();
    expect(remaining).toHaveLength(90);

    // The 5 oldest entries should be removed
    expect(remaining[0]).not.toBe("2026-01-01");
  });

  it("returns the store for chaining", () => {
    const store = createDefaultStore();
    const result = pruneDailyProgress(store);
    expect(result).toBe(store);
  });

  it("handles empty daily progress", () => {
    const store = createDefaultStore();
    pruneDailyProgress(store);
    expect(Object.keys(store.dailyProgress)).toHaveLength(0);
  });
});
