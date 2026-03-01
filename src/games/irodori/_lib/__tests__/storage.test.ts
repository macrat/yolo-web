import { describe, expect, test, beforeEach, vi } from "vitest";
import {
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
  saveTodayGame,
} from "../storage";
import { ROUNDS_PER_GAME } from "../daily";

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
        "2026-02-20": {
          scores: [80, 70, 90, 60, 50],
          totalScore: 70,
          currentRound: 5,
          status: "completed" as const,
        },
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
      const game = {
        scores: [80, 70, 90, 60, 50],
        totalScore: 70,
        currentRound: 5,
        status: "completed" as const,
      };
      saveTodayGame("2026-02-20", game);
      expect(loadTodayGame("2026-02-20")).toEqual(game);
    });

    test("saves and loads a playing (in-progress) game", () => {
      const game = {
        scores: [80, 70, null, null, null] as (number | null)[],
        totalScore: null,
        currentRound: 2,
        status: "playing" as const,
      };
      saveTodayGame("2026-02-20", game);
      const loaded = loadTodayGame("2026-02-20");
      expect(loaded).toEqual(game);
      expect(loaded?.status).toBe("playing");
      expect(loaded?.currentRound).toBe(2);
    });

    test("saves and loads a completed game", () => {
      const game = {
        scores: [80, 70, 90, 60, 50],
        totalScore: 70,
        currentRound: 5,
        status: "completed" as const,
      };
      saveTodayGame("2026-02-20", game);
      const loaded = loadTodayGame("2026-02-20");
      expect(loaded).toEqual(game);
      expect(loaded?.status).toBe("completed");
      expect(loaded?.currentRound).toBe(5);
    });

    test("migrates old format data without currentRound/status to completed with currentRound=5", () => {
      // Simulate old format by writing directly to localStorage
      const oldData = {
        "2026-02-20": {
          scores: [80, 70, 90, 60, 50],
          totalScore: 70,
        },
      };
      window.localStorage.setItem("irodori-history", JSON.stringify(oldData));

      const loaded = loadTodayGame("2026-02-20");
      expect(loaded).not.toBeNull();
      expect(loaded?.status).toBe("completed");
      expect(loaded?.currentRound).toBe(ROUNDS_PER_GAME);
    });

    test("saves and loads scores containing null values", () => {
      const game = {
        scores: [80, null, null, null, null] as (number | null)[],
        totalScore: null,
        currentRound: 1,
        status: "playing" as const,
      };
      saveTodayGame("2026-02-20", game);
      const loaded = loadTodayGame("2026-02-20");
      expect(loaded?.scores).toEqual([80, null, null, null, null]);
    });

    test("saves and loads totalScore as null", () => {
      const game = {
        scores: [80, 70, null, null, null] as (number | null)[],
        totalScore: null,
        currentRound: 2,
        status: "playing" as const,
      };
      saveTodayGame("2026-02-20", game);
      const loaded = loadTodayGame("2026-02-20");
      expect(loaded?.totalScore).toBeNull();
    });

    test("preserves currentRound value on save and load for in-progress game", () => {
      const game = {
        scores: [80, 70, null, null, null] as (number | null)[],
        totalScore: null,
        currentRound: 2,
        status: "playing" as const,
      };
      saveTodayGame("2026-02-20", game);
      const loaded = loadTodayGame("2026-02-20");
      expect(loaded?.currentRound).toBe(2);
    });

    test("scores array length is always ROUNDS_PER_GAME", () => {
      // In-progress game
      const playingGame = {
        scores: [80, 70, null, null, null] as (number | null)[],
        totalScore: null,
        currentRound: 2,
        status: "playing" as const,
      };
      saveTodayGame("2026-02-20", playingGame);
      const loadedPlaying = loadTodayGame("2026-02-20");
      expect(loadedPlaying?.scores).toHaveLength(ROUNDS_PER_GAME);

      // Completed game
      const completedGame = {
        scores: [80, 70, 90, 60, 50],
        totalScore: 70,
        currentRound: 5,
        status: "completed" as const,
      };
      saveTodayGame("2026-02-21", completedGame);
      const loadedCompleted = loadTodayGame("2026-02-21");
      expect(loadedCompleted?.scores).toHaveLength(ROUNDS_PER_GAME);
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
