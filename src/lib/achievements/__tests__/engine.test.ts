import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { recordPlay } from "../engine";
import { STORAGE_KEY, ALL_CONTENT_IDS } from "../badges";
import { createDefaultStore } from "../storage";
import type { AchievementStore } from "../types";

/** Helper to seed localStorage with a specific store */
function seedStore(store: AchievementStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

describe("recordPlay", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    // Set a fixed date: 2026-03-07 JST (2026-03-06T15:00:00Z)
    vi.setSystemTime(new Date("2026-03-06T15:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a new store and records the play when no store exists", () => {
    const result = recordPlay("irodori");
    expect(result).not.toBeNull();
    expect(result!.store.dailyProgress["2026-03-07"]).toEqual({
      irodori: true,
    });
    expect(result!.store.totalStats.perContent["irodori"].count).toBe(1);
  });

  it("increments count on every call including re-plays", () => {
    const result1 = recordPlay("irodori");
    expect(result1!.store.totalStats.perContent["irodori"].count).toBe(1);

    const result2 = recordPlay("irodori");
    expect(result2!.store.totalStats.perContent["irodori"].count).toBe(2);

    const result3 = recordPlay("irodori");
    expect(result3!.store.totalStats.perContent["irodori"].count).toBe(3);
  });

  it("keeps dailyProgress idempotent for same content on same day", () => {
    recordPlay("irodori");
    const result = recordPlay("irodori");
    // dailyProgress is boolean, not a count - still just true
    expect(result!.store.dailyProgress["2026-03-07"]["irodori"]).toBe(true);
  });

  it("tracks multiple content types independently", () => {
    recordPlay("irodori");
    const result = recordPlay("quiz-kanji-level");

    expect(result!.store.dailyProgress["2026-03-07"]).toEqual({
      irodori: true,
      "quiz-kanji-level": true,
    });
    expect(result!.store.totalStats.perContent["irodori"].count).toBe(1);
    expect(result!.store.totalStats.perContent["quiz-kanji-level"].count).toBe(
      1,
    );
    expect(result!.store.totalStats.totalContentUsed).toBe(2);
  });

  it("updates totalDaysPlayed correctly", () => {
    recordPlay("irodori");
    const result = recordPlay("quiz-kanji-level");
    // Same day, should still be 1
    expect(result!.store.totalStats.totalDaysPlayed).toBe(1);
  });

  it("sets firstPlayedAt on first use of a content", () => {
    const result = recordPlay("irodori");
    const firstPlayed =
      result!.store.totalStats.perContent["irodori"].firstPlayedAt;
    expect(firstPlayed).toBeTruthy();
    // Should be a valid ISO date
    expect(new Date(firstPlayed).toISOString()).toBe(firstPlayed);
  });

  it("does not change firstPlayedAt on subsequent plays", () => {
    const result1 = recordPlay("irodori");
    const first = result1!.store.totalStats.perContent["irodori"].firstPlayedAt;

    // Advance time slightly
    vi.advanceTimersByTime(60_000);
    const result2 = recordPlay("irodori");
    expect(result2!.store.totalStats.perContent["irodori"].firstPlayedAt).toBe(
      first,
    );
  });
});

describe("streak calculation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts streak at 1 on first play", () => {
    vi.setSystemTime(new Date("2026-03-06T15:00:00Z")); // 2026-03-07 JST
    const result = recordPlay("irodori");
    expect(result!.store.streak.current).toBe(1);
    expect(result!.store.streak.longest).toBe(1);
  });

  it("does not change streak for multiple plays on same day", () => {
    vi.setSystemTime(new Date("2026-03-06T15:00:00Z")); // 2026-03-07 JST
    recordPlay("irodori");
    const result = recordPlay("quiz-kanji-level");
    expect(result!.store.streak.current).toBe(1);
  });

  it("increments streak on consecutive days", () => {
    // Day 1: 2026-03-07 JST
    vi.setSystemTime(new Date("2026-03-06T15:00:00Z"));
    recordPlay("irodori");

    // Day 2: 2026-03-08 JST
    vi.setSystemTime(new Date("2026-03-07T15:00:00Z"));
    const result = recordPlay("irodori");
    expect(result!.store.streak.current).toBe(2);
    expect(result!.store.streak.longest).toBe(2);
  });

  it("resets streak after a gap day", () => {
    // Day 1
    vi.setSystemTime(new Date("2026-03-06T15:00:00Z")); // 2026-03-07 JST
    recordPlay("irodori");

    // Day 2 (consecutive)
    vi.setSystemTime(new Date("2026-03-07T15:00:00Z")); // 2026-03-08 JST
    recordPlay("irodori");

    // Skip day 3, play on day 4
    vi.setSystemTime(new Date("2026-03-09T15:00:00Z")); // 2026-03-10 JST
    const result = recordPlay("irodori");

    expect(result!.store.streak.current).toBe(1);
    // Longest should still reflect the previous best
    expect(result!.store.streak.longest).toBe(2);
  });

  it("updates longest streak when current exceeds it", () => {
    // Build up a 3-day streak
    for (let i = 0; i < 3; i++) {
      vi.setSystemTime(
        new Date(`2026-03-${String(6 + i).padStart(2, "0")}T15:00:00Z`),
      );
      recordPlay("irodori");
    }

    const result = recordPlay("irodori"); // Same day, no change
    expect(result!.store.streak.longest).toBe(3);
  });

  it("preserves longest streak across resets", () => {
    // Build a 5-day streak
    for (let i = 0; i < 5; i++) {
      vi.setSystemTime(
        new Date(`2026-03-${String(1 + i).padStart(2, "0")}T15:00:00Z`),
      );
      recordPlay("irodori");
    }

    // Gap, then new streak
    vi.setSystemTime(new Date("2026-03-10T15:00:00Z"));
    recordPlay("irodori");

    vi.setSystemTime(new Date("2026-03-11T15:00:00Z"));
    const result = recordPlay("irodori");

    expect(result!.store.streak.current).toBe(2);
    expect(result!.store.streak.longest).toBe(5);
  });
});

describe("badge evaluation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-06T15:00:00Z")); // 2026-03-07 JST
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("unlocks 'first-use' badge on first play", () => {
    const result = recordPlay("irodori");
    expect(result!.newlyUnlocked).toContain("first-use");
  });

  it("does not re-unlock already unlocked badges", () => {
    const result1 = recordPlay("irodori");
    expect(result1!.newlyUnlocked).toContain("first-use");

    const result2 = recordPlay("irodori");
    expect(result2!.newlyUnlocked).not.toContain("first-use");
  });

  it("unlocks 'quiz-first' when a quiz is played", () => {
    const result = recordPlay("quiz-traditional-color");
    expect(result!.newlyUnlocked).toContain("quiz-first");
  });

  it("unlocks 'all-once' when all content types are used", () => {
    // Play all except last
    for (let i = 0; i < ALL_CONTENT_IDS.length - 1; i++) {
      recordPlay(ALL_CONTENT_IDS[i]);
    }

    // Play the last one
    const result = recordPlay(ALL_CONTENT_IDS[ALL_CONTENT_IDS.length - 1]);
    expect(result!.newlyUnlocked).toContain("all-once");
  });

  it("unlocks 'streak-3' after 3 consecutive days", () => {
    vi.setSystemTime(new Date("2026-03-04T15:00:00Z")); // Day 1
    recordPlay("irodori");

    vi.setSystemTime(new Date("2026-03-05T15:00:00Z")); // Day 2
    recordPlay("irodori");

    vi.setSystemTime(new Date("2026-03-06T15:00:00Z")); // Day 3
    const result = recordPlay("irodori");
    expect(result!.newlyUnlocked).toContain("streak-3");
  });

  it("unlocks 'quiz-all' when all quiz types are used", () => {
    const quizIds = ALL_CONTENT_IDS.filter((id) => id.startsWith("quiz-"));
    for (let i = 0; i < quizIds.length - 1; i++) {
      recordPlay(quizIds[i]);
    }

    const result = recordPlay(quizIds[quizIds.length - 1]);
    expect(result!.newlyUnlocked).toContain("quiz-all");
  });

  it("unlocks 'total-50' after 50 total plays", () => {
    // Play 49 times
    for (let i = 0; i < 49; i++) {
      recordPlay("irodori");
    }

    // 50th play
    const result = recordPlay("irodori");
    expect(result!.newlyUnlocked).toContain("total-50");
  });

  it("unlocks 'daily-all-1' when all content is used in one day", () => {
    // Play all content types
    for (let i = 0; i < ALL_CONTENT_IDS.length - 1; i++) {
      recordPlay(ALL_CONTENT_IDS[i]);
    }

    const result = recordPlay(ALL_CONTENT_IDS[ALL_CONTENT_IDS.length - 1]);
    expect(result!.newlyUnlocked).toContain("daily-all-1");
  });

  it("records achievement unlockedAt timestamp", () => {
    const result = recordPlay("irodori");
    const badge = result!.store.achievements["first-use"];
    expect(badge).toBeDefined();
    expect(badge.unlockedAt).toBeTruthy();
    expect(new Date(badge.unlockedAt).toISOString()).toBe(badge.unlockedAt);
  });
});

describe("daily progress pruning via recordPlay", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("prunes entries beyond 90-day limit after recordPlay", () => {
    // Seed a store with 95 days of progress
    const store = createDefaultStore();
    for (let i = 0; i < 95; i++) {
      const date = new Date(2025, 0, i + 1);
      const formatted = date.toISOString().slice(0, 10);
      store.dailyProgress[formatted] = { irodori: true };
    }
    store.streak.lastPlayDate = "2025-04-05";
    store.streak.current = 1;
    store.streak.longest = 1;
    seedStore(store);

    // Play on a new day - this should trigger pruning
    vi.setSystemTime(new Date("2025-04-06T15:00:00Z")); // 2025-04-07 JST
    const result = recordPlay("irodori");

    // 95 + 1 = 96 entries, pruned to 90
    expect(Object.keys(result!.store.dailyProgress).length).toBeLessThanOrEqual(
      90,
    );
  });
});
