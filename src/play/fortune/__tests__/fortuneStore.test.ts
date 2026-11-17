import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/play/fortune/logic", () => ({
  getUserSeed: () => 12345,
  selectFortune: () => ({
    id: "test-fortune",
    title: "テスト運勢タイトル",
    description: "テスト用の運勢説明文",
    luckyItem: "テストアイテム",
    luckyAction: "テストアクション",
    rating: 3.5,
  }),
}));

// date mock — controlled per test
const mockGetTodayJst = vi.fn(() => "2026-03-28");
vi.mock("@/play/games/shared/_lib/crossGameProgress", () => ({
  getTodayJst: () => mockGetTodayJst(),
}));

// Import after mocks are set up
import {
  msUntilNextJstMidnight,
  getFortuneSnapshot,
  getFortuneServerSnapshot,
  subscribeFortuneStore,
  resetFortuneCache,
} from "../fortuneStore";

describe("fortuneStore", () => {
  beforeEach(() => {
    resetFortuneCache();
    mockGetTodayJst.mockReturnValue("2026-03-28");
  });

  describe("getFortuneServerSnapshot", () => {
    it("always returns null", () => {
      expect(getFortuneServerSnapshot()).toBeNull();
    });
  });

  describe("getFortuneSnapshot", () => {
    it("returns fortune state with today's date", () => {
      const result = getFortuneSnapshot();
      expect(result).not.toBeNull();
      expect(result!.today).toBe("2026-03-28");
      expect(result!.fortune.title).toBe("テスト運勢タイトル");
    });

    it("returns the same reference on subsequent calls (cache hit)", () => {
      const first = getFortuneSnapshot();
      const second = getFortuneSnapshot();
      expect(first).toBe(second);
    });

    it("invalidates cache when date changes", () => {
      const first = getFortuneSnapshot();
      expect(first!.today).toBe("2026-03-28");

      // Simulate date change
      mockGetTodayJst.mockReturnValue("2026-03-29");

      const second = getFortuneSnapshot();
      expect(second!.today).toBe("2026-03-29");
      // Different reference because date changed
      expect(second).not.toBe(first);
    });
  });

  describe("resetFortuneCache", () => {
    it("clears the cache so next call recomputes", () => {
      const first = getFortuneSnapshot();
      expect(first).not.toBeNull();

      resetFortuneCache();

      // After reset, snapshot should recompute (new reference if date is same)
      const second = getFortuneSnapshot();
      expect(second).not.toBeNull();
      // Since date is still the same, values should match
      expect(second!.today).toBe(first!.today);
    });
  });

  describe("subscribeFortuneStore", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("notifies listeners at the next midnight in Japan", () => {
      vi.useFakeTimers();
      // 日本時間の 2026-03-28 23:59:00
      vi.setSystemTime(new Date("2026-03-28T14:59:00Z"));
      const listener = vi.fn();
      subscribeFortuneStore(listener);

      vi.advanceTimersByTime(59_000);
      expect(listener).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1_000);
      expect(listener).toHaveBeenCalledTimes(1);
      // 次の日の 0 時にも知らせる
      vi.advanceTimersByTime(24 * 60 * 60 * 1000);
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("notifies listeners when the tab becomes visible", () => {
      const listener = vi.fn();
      subscribeFortuneStore(listener);
      document.dispatchEvent(new Event("visibilitychange"));
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("stops the timer and the visibility listener after the last unsubscribe", () => {
      vi.useFakeTimers();
      const listener = vi.fn();
      const unsubscribe = subscribeFortuneStore(listener);
      unsubscribe();
      expect(vi.getTimerCount()).toBe(0);
      document.dispatchEvent(new Event("visibilitychange"));
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe("msUntilNextJstMidnight", () => {
  it("counts to 15:00 UTC, which is midnight in Japan", () => {
    expect(msUntilNextJstMidnight(Date.parse("2026-03-28T14:00:00Z"))).toBe(
      60 * 60 * 1000,
    );
    expect(msUntilNextJstMidnight(Date.parse("2026-03-28T15:00:00Z"))).toBe(
      24 * 60 * 60 * 1000,
    );
  });
});
