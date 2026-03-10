import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  migrateToV2,
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
  saveTodayGame,
} from "../storage";
import type { GameStats, GameHistory } from "../types";

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

describe("migrateToV2", () => {
  test("migrates legacy stats to beginner key", () => {
    const legacyStats: GameStats = {
      gamesPlayed: 10,
      gamesWon: 8,
      currentStreak: 3,
      maxStreak: 5,
      guessDistribution: [1, 2, 3, 1, 1, 0],
      lastPlayedDate: "2026-03-10",
    };
    localStorageMock.setItem("kanji-kanaru-stats", JSON.stringify(legacyStats));

    migrateToV2();

    expect(localStorageMock.getItem("kanji-kanaru-stats-beginner")).toBe(
      JSON.stringify(legacyStats),
    );
    // Legacy stats key is kept for cross-game tracking
    expect(localStorageMock.getItem("kanji-kanaru-stats")).not.toBeNull();
    expect(localStorageMock.getItem("kanji-kanaru-migrated-v2")).toBe("1");
  });

  test("migrates legacy history to beginner key", () => {
    const legacyHistory: GameHistory = {
      "2026-03-01": {
        guesses: ["\u5DDD", "\u5C71"],
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "kanji-kanaru-history",
      JSON.stringify(legacyHistory),
    );

    migrateToV2();

    expect(localStorageMock.getItem("kanji-kanaru-history-beginner")).toBe(
      JSON.stringify(legacyHistory),
    );
    expect(localStorageMock.getItem("kanji-kanaru-history")).toBeNull();
  });

  test("does not run twice (guarded by migration flag)", () => {
    localStorageMock.setItem(
      "kanji-kanaru-stats",
      JSON.stringify({ gamesPlayed: 5 }),
    );
    migrateToV2();
    // Set new legacy data to check it doesn't re-migrate
    localStorageMock.setItem(
      "kanji-kanaru-stats-beginner",
      JSON.stringify({ gamesPlayed: 42 }),
    );
    localStorageMock.setItem(
      "kanji-kanaru-stats",
      JSON.stringify({ gamesPlayed: 99 }),
    );
    migrateToV2();
    // Should still have the value from before the second call
    expect(localStorageMock.getItem("kanji-kanaru-stats-beginner")).toContain(
      "42",
    );
  });

  test("handles no legacy data gracefully", () => {
    migrateToV2();
    expect(localStorageMock.getItem("kanji-kanaru-migrated-v2")).toBe("1");
    expect(localStorageMock.getItem("kanji-kanaru-stats-beginner")).toBeNull();
  });
});

describe("loadStats", () => {
  test("returns default stats when no data is stored", () => {
    const stats = loadStats("intermediate");
    expect(stats.gamesPlayed).toBe(0);
    expect(stats.gamesWon).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(0);
    expect(stats.guessDistribution).toEqual([0, 0, 0, 0, 0, 0]);
    expect(stats.lastPlayedDate).toBeNull();
  });

  test("returns stored stats for given difficulty", () => {
    const storedStats: GameStats = {
      gamesPlayed: 10,
      gamesWon: 8,
      currentStreak: 3,
      maxStreak: 5,
      guessDistribution: [1, 2, 3, 1, 1, 0],
      lastPlayedDate: "2026-03-10",
    };
    localStorageMock.setItem(
      "kanji-kanaru-stats-advanced",
      JSON.stringify(storedStats),
    );
    const stats = loadStats("advanced");
    expect(stats).toEqual(storedStats);
  });

  test("different difficulties have independent stats", () => {
    const beginnerStats: GameStats = {
      gamesPlayed: 5,
      gamesWon: 4,
      currentStreak: 2,
      maxStreak: 3,
      guessDistribution: [0, 1, 2, 1, 0, 0],
      lastPlayedDate: "2026-03-05",
    };
    localStorageMock.setItem(
      "kanji-kanaru-stats-beginner",
      JSON.stringify(beginnerStats),
    );

    expect(loadStats("beginner").gamesPlayed).toBe(5);
    expect(loadStats("intermediate").gamesPlayed).toBe(0);
    expect(loadStats("advanced").gamesPlayed).toBe(0);
  });

  test("returns default stats on parse error", () => {
    localStorageMock.setItem("kanji-kanaru-stats-beginner", "invalid json");
    const stats = loadStats("beginner");
    expect(stats.gamesPlayed).toBe(0);
  });
});

describe("saveStats", () => {
  test("stores stats in localStorage with difficulty key", () => {
    const stats: GameStats = {
      gamesPlayed: 5,
      gamesWon: 4,
      currentStreak: 2,
      maxStreak: 3,
      guessDistribution: [0, 1, 2, 1, 0, 0],
      lastPlayedDate: "2026-03-05",
    };
    saveStats(stats, "intermediate");
    const raw = localStorageMock.getItem("kanji-kanaru-stats-intermediate");
    expect(raw).toBe(JSON.stringify(stats));
  });

  test("syncs lastPlayedDate to cross-game tracking key", () => {
    const stats: GameStats = {
      gamesPlayed: 1,
      gamesWon: 1,
      currentStreak: 1,
      maxStreak: 1,
      guessDistribution: [1, 0, 0, 0, 0, 0],
      lastPlayedDate: "2026-03-10",
    };
    saveStats(stats, "advanced");
    const crossGameRaw = localStorageMock.getItem("kanji-kanaru-stats");
    expect(crossGameRaw).not.toBeNull();
    const crossGame = JSON.parse(crossGameRaw!);
    expect(crossGame.lastPlayedDate).toBe("2026-03-10");
  });
});

describe("loadHistory", () => {
  test("returns empty object when no data is stored", () => {
    const history = loadHistory("beginner");
    expect(history).toEqual({});
  });

  test("returns stored history for given difficulty", () => {
    const storedHistory: GameHistory = {
      "2026-03-01": {
        guesses: ["\u5DDD", "\u5C71"],
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "kanji-kanaru-history-beginner",
      JSON.stringify(storedHistory),
    );
    const history = loadHistory("beginner");
    expect(history).toEqual(storedHistory);
  });
});

describe("saveHistory", () => {
  test("stores history in localStorage with difficulty key", () => {
    const history: GameHistory = {
      "2026-03-01": {
        guesses: ["\u65E5"],
        status: "won",
        guessCount: 1,
      },
    };
    saveHistory(history, "advanced");
    const raw = localStorageMock.getItem("kanji-kanaru-history-advanced");
    expect(raw).toBe(JSON.stringify(history));
  });
});

describe("loadTodayGame", () => {
  test("returns null when no game exists for the date", () => {
    const game = loadTodayGame("2026-03-01", "beginner");
    expect(game).toBeNull();
  });

  test("returns game record when it exists", () => {
    const history: GameHistory = {
      "2026-03-01": {
        guesses: ["\u5DDD", "\u5C71"],
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "kanji-kanaru-history-intermediate",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "intermediate");
    expect(game).toEqual({
      guesses: ["\u5DDD", "\u5C71"],
      status: "won",
      guessCount: 2,
    });
  });

  test("returns playing data as-is when status is playing", () => {
    const history: GameHistory = {
      "2026-03-01": {
        guesses: ["\u5DDD", "\u5C71", "\u65E5"],
        status: "playing",
        guessCount: 3,
      },
    };
    localStorageMock.setItem(
      "kanji-kanaru-history-beginner",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "beginner");
    expect(game).toEqual({
      guesses: ["\u5DDD", "\u5C71", "\u65E5"],
      status: "playing",
      guessCount: 3,
    });
  });

  test("migrates old lost data with guessCount < 6 to playing", () => {
    const history: GameHistory = {
      "2026-03-01": {
        guesses: ["\u5DDD", "\u5C71"],
        status: "lost",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "kanji-kanaru-history-beginner",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "beginner");
    expect(game).toEqual({
      guesses: ["\u5DDD", "\u5C71"],
      status: "playing",
      guessCount: 2,
    });
  });

  test("keeps lost status when guessCount >= 6 (real loss)", () => {
    const history: GameHistory = {
      "2026-03-01": {
        guesses: ["\u5DDD", "\u5C71", "\u65E5", "\u6708", "\u706B", "\u6C34"],
        status: "lost",
        guessCount: 6,
      },
    };
    localStorageMock.setItem(
      "kanji-kanaru-history-beginner",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "beginner");
    expect(game).toEqual({
      guesses: ["\u5DDD", "\u5C71", "\u65E5", "\u6708", "\u706B", "\u6C34"],
      status: "lost",
      guessCount: 6,
    });
  });

  test("keeps won status unchanged", () => {
    const history: GameHistory = {
      "2026-03-01": {
        guesses: ["\u5DDD", "\u5C71"],
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "kanji-kanaru-history-beginner",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "beginner");
    expect(game).toEqual({
      guesses: ["\u5DDD", "\u5C71"],
      status: "won",
      guessCount: 2,
    });
  });
});

describe("saveTodayGame", () => {
  test("saves a new game record with difficulty", () => {
    saveTodayGame(
      "2026-03-01",
      {
        guesses: ["\u65E5"],
        status: "won",
        guessCount: 1,
      },
      "intermediate",
    );
    const history = loadHistory("intermediate");
    expect(history["2026-03-01"]).toEqual({
      guesses: ["\u65E5"],
      status: "won",
      guessCount: 1,
    });
  });

  test("preserves existing game records within same difficulty", () => {
    saveTodayGame(
      "2026-03-01",
      { guesses: ["\u65E5"], status: "won", guessCount: 1 },
      "beginner",
    );
    saveTodayGame(
      "2026-03-02",
      { guesses: ["\u5DDD", "\u5C71"], status: "won", guessCount: 2 },
      "beginner",
    );
    const history = loadHistory("beginner");
    expect(Object.keys(history)).toHaveLength(2);
    expect(history["2026-03-01"]).toBeDefined();
    expect(history["2026-03-02"]).toBeDefined();
  });

  test("different difficulties store independently", () => {
    saveTodayGame(
      "2026-03-01",
      { guesses: ["\u65E5"], status: "won", guessCount: 1 },
      "beginner",
    );
    saveTodayGame(
      "2026-03-01",
      { guesses: ["\u5DDD", "\u5C71"], status: "won", guessCount: 2 },
      "advanced",
    );
    const beginnerHistory = loadHistory("beginner");
    const advancedHistory = loadHistory("advanced");
    expect(beginnerHistory["2026-03-01"]?.guessCount).toBe(1);
    expect(advancedHistory["2026-03-01"]?.guessCount).toBe(2);
  });
});
