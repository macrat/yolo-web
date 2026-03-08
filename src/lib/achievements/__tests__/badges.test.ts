import { describe, it, expect } from "vitest";
import { ALL_CONTENT_IDS, BADGE_DEFINITIONS } from "../badges";
import { createDefaultStore } from "../storage";
import type { AchievementStore } from "../types";

/** Helper to create a store with specific overrides */
function makeStore(
  overrides: Partial<AchievementStore> = {},
): AchievementStore {
  return { ...createDefaultStore(), ...overrides };
}

describe("ALL_CONTENT_IDS", () => {
  it("contains 14 content IDs (4 games + 9 quizzes + 1 fortune)", () => {
    expect(ALL_CONTENT_IDS).toHaveLength(14);
  });

  it("contains all game slugs", () => {
    expect(ALL_CONTENT_IDS).toContain("irodori");
    expect(ALL_CONTENT_IDS).toContain("kanji-kanaru");
    expect(ALL_CONTENT_IDS).toContain("nakamawake");
    expect(ALL_CONTENT_IDS).toContain("yoji-kimeru");
  });

  it("contains all quiz slugs with quiz- prefix", () => {
    expect(ALL_CONTENT_IDS).toContain("quiz-traditional-color");
    expect(ALL_CONTENT_IDS).toContain("quiz-yoji-personality");
    expect(ALL_CONTENT_IDS).toContain("quiz-yoji-level");
    expect(ALL_CONTENT_IDS).toContain("quiz-kanji-level");
    expect(ALL_CONTENT_IDS).toContain("quiz-kotowaza-level");
    expect(ALL_CONTENT_IDS).toContain("quiz-contrarian-fortune");
  });

  it("contains fortune content ID", () => {
    expect(ALL_CONTENT_IDS).toContain("fortune-daily");
  });
});

describe("BADGE_DEFINITIONS", () => {
  it("defines 14 badges", () => {
    expect(BADGE_DEFINITIONS).toHaveLength(14);
  });

  it("has unique IDs for every badge", () => {
    const ids = BADGE_DEFINITIONS.map((b) => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every badge has a check function", () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(typeof badge.check).toBe("function");
    }
  });

  it("every badge has a valid rank", () => {
    const validRanks = ["bronze", "silver", "gold"];
    for (const badge of BADGE_DEFINITIONS) {
      expect(validRanks).toContain(badge.rank);
    }
  });
});

describe("badge condition checks", () => {
  describe("first-use", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "first-use")!;

    it("returns false for empty store", () => {
      expect(badge.check(createDefaultStore())).toBe(false);
    });

    it("returns true when one content has been used", () => {
      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: 1,
          perContent: {
            irodori: { count: 1, firstPlayedAt: "2026-03-07T00:00:00Z" },
          },
        },
      });
      expect(badge.check(store)).toBe(true);
    });
  });

  describe("all-once", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "all-once")!;

    it("returns false when not all content used", () => {
      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: 8,
          perContent: Object.fromEntries(
            ALL_CONTENT_IDS.slice(0, 8).map((id) => [
              id,
              { count: 1, firstPlayedAt: "2026-03-07T00:00:00Z" },
            ]),
          ),
        },
      });
      expect(badge.check(store)).toBe(false);
    });

    it("returns true when all content used at least once", () => {
      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: 13,
          perContent: Object.fromEntries(
            ALL_CONTENT_IDS.map((id) => [
              id,
              { count: 1, firstPlayedAt: "2026-03-07T00:00:00Z" },
            ]),
          ),
        },
      });
      expect(badge.check(store)).toBe(true);
    });
  });

  describe("streak badges", () => {
    const streak3 = BADGE_DEFINITIONS.find((b) => b.id === "streak-3")!;
    const streak7 = BADGE_DEFINITIONS.find((b) => b.id === "streak-7")!;
    const streak30 = BADGE_DEFINITIONS.find((b) => b.id === "streak-30")!;

    it("streak-3 requires longest >= 3", () => {
      expect(
        streak3.check(
          makeStore({
            streak: { current: 2, longest: 2, lastPlayDate: "2026-03-07" },
          }),
        ),
      ).toBe(false);

      expect(
        streak3.check(
          makeStore({
            streak: { current: 3, longest: 3, lastPlayDate: "2026-03-07" },
          }),
        ),
      ).toBe(true);
    });

    it("streak-7 requires longest >= 7", () => {
      expect(
        streak7.check(
          makeStore({
            streak: { current: 1, longest: 7, lastPlayDate: "2026-03-07" },
          }),
        ),
      ).toBe(true);
    });

    it("streak-30 requires longest >= 30", () => {
      expect(
        streak30.check(
          makeStore({
            streak: { current: 30, longest: 30, lastPlayDate: "2026-03-07" },
          }),
        ),
      ).toBe(true);
    });
  });

  describe("total usage badges", () => {
    const total50 = BADGE_DEFINITIONS.find((b) => b.id === "total-50")!;
    const total200 = BADGE_DEFINITIONS.find((b) => b.id === "total-200")!;
    const total1000 = BADGE_DEFINITIONS.find((b) => b.id === "total-1000")!;

    it("total-50 requires total play count >= 50", () => {
      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: 1,
          perContent: {
            irodori: { count: 49, firstPlayedAt: "2026-03-07T00:00:00Z" },
          },
        },
      });
      expect(total50.check(store)).toBe(false);

      store.totalStats.perContent["irodori"].count = 50;
      expect(total50.check(store)).toBe(true);
    });

    it("total-200 counts across all content types", () => {
      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: 2,
          perContent: {
            irodori: { count: 100, firstPlayedAt: "2026-03-07T00:00:00Z" },
            "quiz-kanji-level": {
              count: 100,
              firstPlayedAt: "2026-03-07T00:00:00Z",
            },
          },
        },
      });
      expect(total200.check(store)).toBe(true);
    });

    it("total-1000 requires 1000 total", () => {
      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: 1,
          perContent: {
            irodori: { count: 1000, firstPlayedAt: "2026-03-07T00:00:00Z" },
          },
        },
      });
      expect(total1000.check(store)).toBe(true);
    });
  });

  describe("quiz badges", () => {
    const quizFirst = BADGE_DEFINITIONS.find((b) => b.id === "quiz-first")!;
    const quizAll = BADGE_DEFINITIONS.find((b) => b.id === "quiz-all")!;

    it("quiz-first requires at least one quiz used", () => {
      expect(quizFirst.check(createDefaultStore())).toBe(false);

      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: 1,
          perContent: {
            "quiz-kanji-level": {
              count: 1,
              firstPlayedAt: "2026-03-07T00:00:00Z",
            },
          },
        },
      });
      expect(quizFirst.check(store)).toBe(true);
    });

    it("quiz-first does not trigger on game plays", () => {
      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: 1,
          perContent: {
            irodori: { count: 1, firstPlayedAt: "2026-03-07T00:00:00Z" },
          },
        },
      });
      expect(quizFirst.check(store)).toBe(false);
    });

    it("quiz-first does not trigger on fortune plays", () => {
      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: 1,
          perContent: {
            "fortune-daily": {
              count: 1,
              firstPlayedAt: "2026-03-07T00:00:00Z",
            },
          },
        },
      });
      expect(quizFirst.check(store)).toBe(false);
    });

    it("quiz-all requires all 8 quizzes used", () => {
      const quizIds = ALL_CONTENT_IDS.filter((id) => id.startsWith("quiz-"));
      const store = makeStore({
        totalStats: {
          totalDaysPlayed: 1,
          totalContentUsed: quizIds.length,
          perContent: Object.fromEntries(
            quizIds.map((id) => [
              id,
              { count: 1, firstPlayedAt: "2026-03-07T00:00:00Z" },
            ]),
          ),
        },
      });
      expect(quizAll.check(store)).toBe(true);
    });
  });

  describe("daily-all (consecutive all-content days)", () => {
    const dailyAll1 = BADGE_DEFINITIONS.find((b) => b.id === "daily-all-1")!;
    const dailyAll7 = BADGE_DEFINITIONS.find((b) => b.id === "daily-all-7")!;

    /** Create a dailyProgress entry with all content IDs set to true */
    function allContentDay(): Record<string, boolean> {
      return Object.fromEntries(ALL_CONTENT_IDS.map((id) => [id, true]));
    }

    it("daily-all-1 requires one day with all content used", () => {
      expect(dailyAll1.check(createDefaultStore())).toBe(false);

      const store = makeStore({
        dailyProgress: { "2026-03-07": allContentDay() },
      });
      expect(dailyAll1.check(store)).toBe(true);
    });

    it("daily-all-1 returns false when not all content used on any day", () => {
      const partial = { ...allContentDay() };
      delete partial["irodori"];

      const store = makeStore({
        dailyProgress: { "2026-03-07": partial },
      });
      expect(dailyAll1.check(store)).toBe(false);
    });

    it("daily-all-7 requires 7 consecutive days with all content", () => {
      const dailyProgress: Record<string, Record<string, boolean>> = {};
      for (let i = 1; i <= 7; i++) {
        dailyProgress[`2026-03-${String(i).padStart(2, "0")}`] =
          allContentDay();
      }

      const store = makeStore({ dailyProgress });
      expect(dailyAll7.check(store)).toBe(true);
    });

    it("does not count non-consecutive days as consecutive", () => {
      // Days 1, 2, 3, then gap, then day 5, 6, 7
      const dailyProgress: Record<string, Record<string, boolean>> = {};
      dailyProgress["2026-03-01"] = allContentDay();
      dailyProgress["2026-03-02"] = allContentDay();
      dailyProgress["2026-03-03"] = allContentDay();
      // Gap on 2026-03-04
      dailyProgress["2026-03-05"] = allContentDay();
      dailyProgress["2026-03-06"] = allContentDay();
      dailyProgress["2026-03-07"] = allContentDay();

      const store = makeStore({ dailyProgress });
      // Should count from the end: 3/5, 3/6, 3/7 = 3 consecutive
      expect(dailyAll7.check(store)).toBe(false);
    });

    it("handles gap in dailyProgress correctly (date continuity check)", () => {
      // This tests the bug noted in the review: entries might exist
      // for non-consecutive days but both have all content.
      // The function should NOT count them as consecutive.
      const dailyProgress: Record<string, Record<string, boolean>> = {};
      dailyProgress["2026-03-01"] = allContentDay();
      dailyProgress["2026-03-05"] = allContentDay(); // 4-day gap

      const store = makeStore({ dailyProgress });
      // Only the most recent day (03-05) counts, so consecutive = 1
      expect(dailyAll1.check(store)).toBe(true);
      expect(dailyAll7.check(store)).toBe(false);
    });

    it("counts from the most recent date backward", () => {
      const dailyProgress: Record<string, Record<string, boolean>> = {};
      // 5 consecutive days of all content
      for (let i = 3; i <= 7; i++) {
        dailyProgress[`2026-03-${String(i).padStart(2, "0")}`] =
          allContentDay();
      }
      // But the most recent day is incomplete
      const partial = { ...allContentDay() };
      delete partial["irodori"];
      dailyProgress["2026-03-08"] = partial;

      const store = makeStore({ dailyProgress });
      // Should return 0 because the most recent entry (03-08) is incomplete
      expect(dailyAll1.check(store)).toBe(false);
    });

    it("handles entries where most recent is complete but older break chain", () => {
      const dailyProgress: Record<string, Record<string, boolean>> = {};
      // Day 1 and 2 have all content
      dailyProgress["2026-03-06"] = allContentDay();
      dailyProgress["2026-03-07"] = allContentDay();
      // Day before that is partial (breaks chain)
      const partial = { ...allContentDay() };
      delete partial["irodori"];
      dailyProgress["2026-03-05"] = partial;

      const store = makeStore({ dailyProgress });
      // Count from most recent backward: 03-07 (all), 03-06 (all), 03-05 (partial) = 2
      const dailyAll = BADGE_DEFINITIONS.find((b) => b.id === "daily-all-1")!;
      expect(dailyAll.check(store)).toBe(true);
    });
  });
});
