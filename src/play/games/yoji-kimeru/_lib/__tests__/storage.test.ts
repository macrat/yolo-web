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
import type {
  YojiGameStats,
  YojiGameHistory,
  YojiGuessFeedback,
} from "../types";

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
  test("migrates legacy stats to intermediate difficulty", () => {
    const legacyStats: YojiGameStats = {
      gamesPlayed: 5,
      gamesWon: 3,
      currentStreak: 2,
      maxStreak: 3,
      guessDistribution: [0, 1, 1, 1, 0, 0],
      lastPlayedDate: "2026-03-10",
    };
    localStorageMock.setItem("yoji-kimeru-stats", JSON.stringify(legacyStats));
    localStorageMock.setItem(
      "yoji-kimeru-history",
      JSON.stringify({
        "2026-03-10": { guesses: ["一期一会"], status: "won", guessCount: 1 },
      }),
    );

    migrateToV2();

    // Stats should be copied to intermediate key
    const intermediateStats = localStorageMock.getItem(
      "yoji-kimeru-stats-intermediate",
    );
    expect(intermediateStats).toBe(JSON.stringify(legacyStats));

    // History should be moved to intermediate key and legacy removed
    const intermediateHistory = localStorageMock.getItem(
      "yoji-kimeru-history-intermediate",
    );
    expect(intermediateHistory).not.toBeNull();
    expect(localStorageMock.getItem("yoji-kimeru-history")).toBeNull();

    // Migration flag should be set
    expect(localStorageMock.getItem("yoji-kimeru-migrated-v2")).toBe("1");
  });

  test("does not run twice", () => {
    localStorageMock.setItem("yoji-kimeru-migrated-v2", "1");
    localStorageMock.setItem(
      "yoji-kimeru-stats",
      JSON.stringify({ gamesPlayed: 1 }),
    );

    migrateToV2();

    // Should not create intermediate key since migration already ran
    expect(
      localStorageMock.getItem("yoji-kimeru-stats-intermediate"),
    ).toBeNull();
  });

  test("handles missing legacy data gracefully", () => {
    migrateToV2();
    expect(localStorageMock.getItem("yoji-kimeru-migrated-v2")).toBe("1");
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

  test("returns stored stats for specified difficulty", () => {
    const storedStats: YojiGameStats = {
      gamesPlayed: 10,
      gamesWon: 8,
      currentStreak: 3,
      maxStreak: 5,
      guessDistribution: [1, 2, 3, 1, 1, 0],
      lastPlayedDate: "2026-03-10",
    };
    localStorageMock.setItem(
      "yoji-kimeru-stats-beginner",
      JSON.stringify(storedStats),
    );
    const stats = loadStats("beginner");
    expect(stats).toEqual(storedStats);
  });

  test("returns default stats on parse error", () => {
    localStorageMock.setItem("yoji-kimeru-stats-intermediate", "invalid json");
    const stats = loadStats("intermediate");
    expect(stats.gamesPlayed).toBe(0);
  });

  test("different difficulties have separate stats", () => {
    const beginnerStats: YojiGameStats = {
      gamesPlayed: 5,
      gamesWon: 4,
      currentStreak: 2,
      maxStreak: 3,
      guessDistribution: [0, 1, 2, 1, 0, 0],
      lastPlayedDate: "2026-03-05",
    };
    const advancedStats: YojiGameStats = {
      gamesPlayed: 3,
      gamesWon: 1,
      currentStreak: 0,
      maxStreak: 1,
      guessDistribution: [0, 0, 0, 0, 1, 0],
      lastPlayedDate: "2026-03-07",
    };
    localStorageMock.setItem(
      "yoji-kimeru-stats-beginner",
      JSON.stringify(beginnerStats),
    );
    localStorageMock.setItem(
      "yoji-kimeru-stats-advanced",
      JSON.stringify(advancedStats),
    );

    expect(loadStats("beginner")).toEqual(beginnerStats);
    expect(loadStats("advanced")).toEqual(advancedStats);
    expect(loadStats("intermediate").gamesPlayed).toBe(0);
  });
});

describe("saveStats", () => {
  test("stores stats with difficulty key", () => {
    const stats: YojiGameStats = {
      gamesPlayed: 5,
      gamesWon: 4,
      currentStreak: 2,
      maxStreak: 3,
      guessDistribution: [0, 1, 2, 1, 0, 0],
      lastPlayedDate: "2026-03-05",
    };
    saveStats(stats, "beginner");
    const raw = localStorageMock.getItem("yoji-kimeru-stats-beginner");
    expect(raw).toBe(JSON.stringify(stats));
  });

  test("updates cross-game tracking key", () => {
    const stats: YojiGameStats = {
      gamesPlayed: 1,
      gamesWon: 1,
      currentStreak: 1,
      maxStreak: 1,
      guessDistribution: [1, 0, 0, 0, 0, 0],
      lastPlayedDate: "2026-03-10",
    };
    saveStats(stats, "intermediate");
    const crossGame = localStorageMock.getItem("yoji-kimeru-stats");
    expect(crossGame).not.toBeNull();
    expect(JSON.parse(crossGame!).lastPlayedDate).toBe("2026-03-10");
  });
});

describe("loadHistory", () => {
  test("returns empty object when no data is stored", () => {
    const history = loadHistory("intermediate");
    expect(history).toEqual({});
  });

  test("returns stored history for specified difficulty", () => {
    const storedHistory: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["花鳥風月", "一期一会"],
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "yoji-kimeru-history-intermediate",
      JSON.stringify(storedHistory),
    );
    const history = loadHistory("intermediate");
    expect(history).toEqual(storedHistory);
  });
});

describe("saveHistory", () => {
  test("stores history with difficulty key", () => {
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["一期一会"],
        status: "won",
        guessCount: 1,
      },
    };
    saveHistory(history, "beginner");
    const raw = localStorageMock.getItem("yoji-kimeru-history-beginner");
    expect(raw).toBe(JSON.stringify(history));
  });
});

// Feedbacks fixture for tests that require API-based save format
const sampleFeedbacks: YojiGuessFeedback[] = [
  {
    guess: "花鳥風月",
    charFeedbacks: ["absent", "absent", "absent", "absent"],
  },
  {
    guess: "一期一会",
    charFeedbacks: ["correct", "correct", "correct", "correct"],
  },
];

describe("loadTodayGame", () => {
  test("returns null when no game exists for the date", () => {
    const game = loadTodayGame("2026-03-01", "intermediate");
    expect(game).toBeNull();
  });

  // API化以前の保存データ（feedbacksなし）はnullを返すべき
  test("returns null for old data without feedbacks (pre-API format)", () => {
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["花鳥風月", "一期一会"],
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "yoji-kimeru-history-intermediate",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "intermediate");
    // feedbacksがない古い保存データはnullを返す（再初期化が必要）
    expect(game).toBeNull();
  });

  test("returns game record when feedbacks are present (API format)", () => {
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["花鳥風月", "一期一会"],
        feedbacks: sampleFeedbacks,
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "yoji-kimeru-history-intermediate",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "intermediate");
    expect(game).not.toBeNull();
    expect(game!.status).toBe("won");
    expect(game!.feedbacks).toEqual(sampleFeedbacks);
    expect(game!.guessCount).toBe(2);
  });

  test("returns playing data as-is when status is playing with feedbacks", () => {
    const playingFeedbacks: YojiGuessFeedback[] = [
      {
        guess: "花鳥風月",
        charFeedbacks: ["absent", "absent", "absent", "absent"],
      },
    ];
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["花鳥風月"],
        feedbacks: playingFeedbacks,
        status: "playing",
        guessCount: 1,
      },
    };
    localStorageMock.setItem(
      "yoji-kimeru-history-beginner",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "beginner");
    expect(game).not.toBeNull();
    expect(game!.status).toBe("playing");
    expect(game!.guessCount).toBe(1);
    expect(game!.feedbacks).toEqual(playingFeedbacks);
  });

  test("returns null for old lost data without feedbacks (pre-API format)", () => {
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["花鳥風月", "一期一会", "切磋琢磨"],
        status: "lost",
        guessCount: 3,
      },
    };
    localStorageMock.setItem(
      "yoji-kimeru-history-intermediate",
      JSON.stringify(history),
    );
    // feedbacksがないので古いデータとしてnullを返す
    const game = loadTodayGame("2026-03-01", "intermediate");
    expect(game).toBeNull();
  });

  test("migrates old lost data to playing when guessCount < MAX_GUESSES (with feedbacks)", () => {
    const partialFeedbacks: YojiGuessFeedback[] = [
      {
        guess: "花鳥風月",
        charFeedbacks: ["absent", "absent", "absent", "absent"],
      },
      {
        guess: "一期一会",
        charFeedbacks: ["absent", "absent", "absent", "absent"],
      },
      {
        guess: "切磋琢磨",
        charFeedbacks: ["absent", "absent", "absent", "absent"],
      },
    ];
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["花鳥風月", "一期一会", "切磋琢磨"],
        feedbacks: partialFeedbacks,
        status: "lost",
        guessCount: 3,
      },
    };
    localStorageMock.setItem(
      "yoji-kimeru-history-intermediate",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "intermediate");
    expect(game).not.toBeNull();
    expect(game!.status).toBe("playing");
    expect(game!.guessCount).toBe(3);
    expect(game!.guesses).toEqual(["花鳥風月", "一期一会", "切磋琢磨"]);
  });

  test("keeps lost status when guessCount >= MAX_GUESSES (real loss, with feedbacks)", () => {
    const lostFeedbacks: YojiGuessFeedback[] = Array.from(
      { length: 6 },
      (_, i) => ({
        guess: [
          "花鳥風月",
          "一期一会",
          "切磋琢磨",
          "四面楚歌",
          "臥薪嘗胆",
          "温故知新",
        ][i]!,
        charFeedbacks: ["absent", "absent", "absent", "absent"] as [
          "absent",
          "absent",
          "absent",
          "absent",
        ],
      }),
    );
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: [
          "花鳥風月",
          "一期一会",
          "切磋琢磨",
          "四面楚歌",
          "臥薪嘗胆",
          "温故知新",
        ],
        feedbacks: lostFeedbacks,
        status: "lost",
        guessCount: 6,
      },
    };
    localStorageMock.setItem(
      "yoji-kimeru-history-advanced",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "advanced");
    expect(game).not.toBeNull();
    expect(game!.status).toBe("lost");
    expect(game!.guessCount).toBe(6);
  });

  test("keeps won status unchanged (with feedbacks)", () => {
    const history: YojiGameHistory = {
      "2026-03-01": {
        guesses: ["花鳥風月", "一期一会"],
        feedbacks: sampleFeedbacks,
        status: "won",
        guessCount: 2,
      },
    };
    localStorageMock.setItem(
      "yoji-kimeru-history-intermediate",
      JSON.stringify(history),
    );
    const game = loadTodayGame("2026-03-01", "intermediate");
    expect(game).not.toBeNull();
    expect(game!.status).toBe("won");
    expect(game!.guessCount).toBe(2);
  });
});

describe("saveTodayGame", () => {
  test("saves a new game record with difficulty", () => {
    saveTodayGame(
      "2026-03-01",
      {
        guesses: ["一期一会"],
        status: "won",
        guessCount: 1,
      },
      "beginner",
    );
    const history = loadHistory("beginner");
    expect(history["2026-03-01"]).toEqual({
      guesses: ["一期一会"],
      status: "won",
      guessCount: 1,
    });
  });

  test("saves game record with feedbacks", () => {
    const feedbacks: YojiGuessFeedback[] = [
      {
        guess: "一期一会",
        charFeedbacks: ["correct", "correct", "correct", "correct"],
      },
    ];
    saveTodayGame(
      "2026-03-01",
      {
        guesses: ["一期一会"],
        feedbacks,
        status: "won",
        guessCount: 1,
      },
      "beginner",
    );
    const history = loadHistory("beginner");
    expect(history["2026-03-01"]!.feedbacks).toEqual(feedbacks);
  });

  test("preserves existing game records within same difficulty", () => {
    saveTodayGame(
      "2026-03-01",
      {
        guesses: ["一期一会"],
        status: "won",
        guessCount: 1,
      },
      "intermediate",
    );
    saveTodayGame(
      "2026-03-02",
      {
        guesses: ["花鳥風月", "切磋琢磨"],
        status: "won",
        guessCount: 2,
      },
      "intermediate",
    );
    const history = loadHistory("intermediate");
    expect(Object.keys(history)).toHaveLength(2);
    expect(history["2026-03-01"]).toBeDefined();
    expect(history["2026-03-02"]).toBeDefined();
  });

  test("different difficulties maintain separate histories", () => {
    saveTodayGame(
      "2026-03-01",
      {
        guesses: ["一期一会"],
        status: "won",
        guessCount: 1,
      },
      "beginner",
    );
    saveTodayGame(
      "2026-03-01",
      {
        guesses: ["花鳥風月", "切磋琢磨"],
        status: "won",
        guessCount: 2,
      },
      "advanced",
    );

    const beginnerHistory = loadHistory("beginner");
    const advancedHistory = loadHistory("advanced");
    expect(beginnerHistory["2026-03-01"]!.guessCount).toBe(1);
    expect(advancedHistory["2026-03-01"]!.guessCount).toBe(2);
  });
});
