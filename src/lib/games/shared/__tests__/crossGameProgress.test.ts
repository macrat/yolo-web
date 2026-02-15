import { describe, test, expect, vi, afterEach } from "vitest";
import {
  getTodayJst,
  getAllGameStatus,
  getPlayedCount,
  ALL_GAMES,
} from "../crossGameProgress";

describe("getTodayJst", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns a YYYY-MM-DD string", () => {
    const result = getTodayJst();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("returns correct JST date", () => {
    vi.useFakeTimers();
    // 2026-02-15 20:00:00 UTC = 2026-02-16 05:00:00 JST
    vi.setSystemTime(new Date("2026-02-15T20:00:00Z"));
    expect(getTodayJst()).toBe("2026-02-16");
  });

  test("returns correct JST date before midnight UTC", () => {
    vi.useFakeTimers();
    // 2026-02-15 14:00:00 UTC = 2026-02-15 23:00:00 JST
    vi.setSystemTime(new Date("2026-02-15T14:00:00Z"));
    expect(getTodayJst()).toBe("2026-02-15");
  });
});

describe("getAllGameStatus", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  test("returns all games as unplayed when localStorage is empty", () => {
    const statuses = getAllGameStatus();
    expect(statuses).toHaveLength(ALL_GAMES.length);
    for (const status of statuses) {
      expect(status.playedToday).toBe(false);
    }
  });

  test("detects game played today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    window.localStorage.setItem(
      "kanji-kanaru-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-15" }),
    );

    const statuses = getAllGameStatus();
    const kanjiStatus = statuses.find((s) => s.game.slug === "kanji-kanaru");
    expect(kanjiStatus?.playedToday).toBe(true);
  });

  test("detects game not played today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    window.localStorage.setItem(
      "kanji-kanaru-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-14" }),
    );

    const statuses = getAllGameStatus();
    const kanjiStatus = statuses.find((s) => s.game.slug === "kanji-kanaru");
    expect(kanjiStatus?.playedToday).toBe(false);
  });

  test("handles invalid JSON in localStorage", () => {
    window.localStorage.setItem("kanji-kanaru-stats", "not-json");

    const statuses = getAllGameStatus();
    const kanjiStatus = statuses.find((s) => s.game.slug === "kanji-kanaru");
    expect(kanjiStatus?.playedToday).toBe(false);
  });
});

describe("getPlayedCount", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  test("returns 0 when no games played", () => {
    expect(getPlayedCount()).toBe(0);
  });

  test("returns correct count when some games played", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    window.localStorage.setItem(
      "kanji-kanaru-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-15" }),
    );
    window.localStorage.setItem(
      "yoji-kimeru-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-15" }),
    );

    expect(getPlayedCount()).toBe(2);
  });
});
