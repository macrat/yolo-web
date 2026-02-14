import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
  saveTodayGame,
} from "../storage";
import type { YojiGameStats, YojiGameHistory } from "../types";

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
    expect(stats.guessDistribution).toEqual([0, 0, 0, 0, 0, 0]);
    expect(stats.lastPlayedDate).toBeNull();
  });

  test("returns stored stats when data exists", () => {
    const storedStats: YojiGameStats = {
      gamesPlayed: 10,
      gamesWon: 8,
      currentStreak: 3,
      maxStreak: 5,
      guessDistribution: [1, 2, 3, 1, 1, 0],
      lastPlayedDate: "2026-03-10",
    };
    localStorageMock.setItem("yoji-kimeru-stats", JSON.stringify(storedStats));
    const stats = loadStats();
    expect(stats).toEqual(storedStats);
  });

  test("returns default stats on parse error", () => {
    localStorageMock.setItem("yoji-kimeru-stats", "invalid json");
    const stats = loadStats();
    expect(stats.gamesPlayed).toBe(0);
  });
});

describe("saveStats", () => {
  test("stores stats in localStorage", () => {
    const stats: YojiGameStats = {
      gamesPlayed: 5,
      gamesWon: 4,
      currentStreak: 2,
      maxStreak: 3,
      guessDistribution: [0, 1, 2, 1, 0, 0],
      lastPlayedDate: "2026-03-05",
    };
    saveStats(stats);
    const raw = localStorageMock.getItem("yoji-kimeru-stats");
    expect(raw).toBe(JSON.stringify(stats));
  });
});

describe("loadHistory", () => {
  test("returns empty object when no data is stored", () => {
    const history = loadHistory();
    expect(history).toEqual({});
  });

  test("returns stored history when data exists", () => {
    const storedHistory: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["花鳥風月", "一期一会"],
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "yoji-kimeru-history",
      JSON.stringify(storedHistory),
    );
    const history = loadHistory();
    expect(history).toEqual(storedHistory);
  });
});

describe("saveHistory", () => {
  test("stores history in localStorage", () => {
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["一期一会"],
        status: "won",
        guessCount: 1,
      },
    };
    saveHistory(history);
    const raw = localStorageMock.getItem("yoji-kimeru-history");
    expect(raw).toBe(JSON.stringify(history));
  });
});

describe("loadTodayGame", () => {
  test("returns null when no game exists for the date", () => {
    const game = loadTodayGame("2026-03-01");
    expect(game).toBeNull();
  });

  test("returns game record when it exists", () => {
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["花鳥風月", "一期一会"],
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem("yoji-kimeru-history", JSON.stringify(history));
    const game = loadTodayGame("2026-03-01");
    expect(game).toEqual({
      guesses: ["花鳥風月", "一期一会"],
      status: "won",
      guessCount: 2,
    });
  });
});

describe("saveTodayGame", () => {
  test("saves a new game record", () => {
    saveTodayGame("2026-03-01", {
      guesses: ["一期一会"],
      status: "won",
      guessCount: 1,
    });
    const history = loadHistory();
    expect(history["2026-03-01"]).toEqual({
      guesses: ["一期一会"],
      status: "won",
      guessCount: 1,
    });
  });

  test("preserves existing game records", () => {
    saveTodayGame("2026-03-01", {
      guesses: ["一期一会"],
      status: "won",
      guessCount: 1,
    });
    saveTodayGame("2026-03-02", {
      guesses: ["花鳥風月", "切磋琢磨"],
      status: "won",
      guessCount: 2,
    });
    const history = loadHistory();
    expect(Object.keys(history)).toHaveLength(2);
    expect(history["2026-03-01"]).toBeDefined();
    expect(history["2026-03-02"]).toBeDefined();
  });
});
