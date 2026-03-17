import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
  saveTodayGame,
} from "../storage";
import type { NakamawakeGameStats, NakamawakeGameHistory } from "../types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn(() => null),
  };
})();

beforeEach(() => {
  localStorageMock.clear();
  vi.stubGlobal("localStorage", localStorageMock);
});

describe("loadStats", () => {
  test("returns default stats when no data is stored", () => {
    const stats = loadStats();
    expect(stats.gamesPlayed).toBe(0);
    expect(stats.gamesWon).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(0);
    expect(stats.mistakeDistribution).toEqual([0, 0, 0, 0, 0]);
    expect(stats.lastPlayedDate).toBeNull();
  });

  test("returns stored stats when data exists", () => {
    const storedStats: NakamawakeGameStats = {
      gamesPlayed: 10,
      gamesWon: 8,
      currentStreak: 3,
      maxStreak: 5,
      mistakeDistribution: [2, 3, 2, 1, 0],
      lastPlayedDate: "2026-03-10",
    };
    localStorageMock.setItem("nakamawake-stats", JSON.stringify(storedStats));
    const stats = loadStats();
    expect(stats).toEqual(storedStats);
  });

  test("returns default stats on parse error", () => {
    localStorageMock.setItem("nakamawake-stats", "invalid json");
    const stats = loadStats();
    expect(stats.gamesPlayed).toBe(0);
  });
});

describe("saveStats", () => {
  test("stores stats in localStorage", () => {
    const stats: NakamawakeGameStats = {
      gamesPlayed: 5,
      gamesWon: 4,
      currentStreak: 2,
      maxStreak: 3,
      mistakeDistribution: [1, 2, 1, 0, 0],
      lastPlayedDate: "2026-03-05",
    };
    saveStats(stats);
    const raw = localStorageMock.getItem("nakamawake-stats");
    expect(raw).toBe(JSON.stringify(stats));
  });
});

describe("loadHistory", () => {
  test("returns empty object when no data is stored", () => {
    const history = loadHistory();
    expect(history).toEqual({});
  });

  test("returns stored history when data exists", () => {
    const storedHistory: NakamawakeGameHistory = {
      "2026-03-01": {
        solvedGroups: [1, 2, 3, 4],
        mistakes: 1,
        status: "won",
      },
    };
    localStorageMock.setItem(
      "nakamawake-history",
      JSON.stringify(storedHistory),
    );
    const history = loadHistory();
    expect(history).toEqual(storedHistory);
  });
});

describe("saveHistory", () => {
  test("stores history in localStorage", () => {
    const history: NakamawakeGameHistory = {
      "2026-03-01": {
        solvedGroups: [1, 2, 3, 4],
        mistakes: 0,
        status: "won",
      },
    };
    saveHistory(history);
    const raw = localStorageMock.getItem("nakamawake-history");
    expect(raw).toBe(JSON.stringify(history));
  });
});

describe("loadTodayGame", () => {
  test("returns null when no game exists for the date", () => {
    const game = loadTodayGame("2026-03-01");
    expect(game).toBeNull();
  });

  test("returns game record when it exists", () => {
    const history: NakamawakeGameHistory = {
      "2026-03-01": {
        solvedGroups: [1, 2, 3, 4],
        mistakes: 2,
        status: "won",
      },
    };
    localStorageMock.setItem("nakamawake-history", JSON.stringify(history));
    const game = loadTodayGame("2026-03-01");
    expect(game).toEqual({
      solvedGroups: [1, 2, 3, 4],
      mistakes: 2,
      status: "won",
    });
  });
});

describe("saveTodayGame", () => {
  test("saves a new game record", () => {
    saveTodayGame("2026-03-01", {
      solvedGroups: [1, 2, 3, 4],
      mistakes: 1,
      status: "won",
    });
    const history = loadHistory();
    expect(history["2026-03-01"]).toEqual({
      solvedGroups: [1, 2, 3, 4],
      mistakes: 1,
      status: "won",
    });
  });

  test("preserves existing game records", () => {
    saveTodayGame("2026-03-01", {
      solvedGroups: [1, 2, 3, 4],
      mistakes: 0,
      status: "won",
    });
    saveTodayGame("2026-03-02", {
      solvedGroups: [1, 2],
      mistakes: 4,
      status: "lost",
    });
    const history = loadHistory();
    expect(Object.keys(history)).toHaveLength(2);
    expect(history["2026-03-01"]).toBeDefined();
    expect(history["2026-03-02"]).toBeDefined();
  });
});
