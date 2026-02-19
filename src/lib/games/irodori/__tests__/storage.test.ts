import { describe, expect, test, beforeEach, vi } from "vitest";
import {
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
  saveTodayGame,
} from "../storage";

describe("storage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  describe("loadStats", () => {
    test("returns default stats when no data stored", () => {
      const stats = loadStats();
      expect(stats.gamesPlayed).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.bestScore).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.maxStreak).toBe(0);
      expect(stats.lastPlayedDate).toBeNull();
      expect(stats.scoreDistribution).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    test("returns saved stats", () => {
      const stats = {
        gamesPlayed: 5,
        averageScore: 75,
        bestScore: 90,
        currentStreak: 3,
        maxStreak: 5,
        lastPlayedDate: "2026-02-20",
        scoreDistribution: [0, 0, 0, 0, 0, 1, 2, 1, 1, 0],
      };
      saveStats(stats);
      const loaded = loadStats();
      expect(loaded).toEqual(stats);
    });
  });

  describe("loadHistory / saveHistory", () => {
    test("returns empty object when no data stored", () => {
      expect(loadHistory()).toEqual({});
    });

    test("saves and loads history", () => {
      const history = {
        "2026-02-20": { scores: [80, 70, 90, 60, 50], totalScore: 70 },
      };
      saveHistory(history);
      expect(loadHistory()).toEqual(history);
    });
  });

  describe("loadTodayGame / saveTodayGame", () => {
    test("returns null when no game exists for date", () => {
      expect(loadTodayGame("2026-02-20")).toBeNull();
    });

    test("saves and loads today's game", () => {
      const game = { scores: [80, 70, 90, 60, 50], totalScore: 70 };
      saveTodayGame("2026-02-20", game);
      expect(loadTodayGame("2026-02-20")).toEqual(game);
    });
  });

  describe("handles localStorage unavailability", () => {
    test("returns defaults when localStorage throws", () => {
      const spy = vi
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("quota exceeded");
        });
      const stats = loadStats();
      expect(stats.gamesPlayed).toBe(0);
      spy.mockRestore();
    });
  });
});
