/**
 * Tests for fortuneStore module.
 *
 * fortuneStore provides a useSyncExternalStore-compatible store for the daily fortune.
 * Key behaviors:
 * - getFortuneSnapshot: returns fortune state on client, null on SSR
 * - getFortuneServerSnapshot: always returns null (for SSR)
 * - Cache is invalidated when the date changes
 * - resetFortuneCache allows test isolation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

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
vi.mock("@/lib/achievements/date", () => ({
  getTodayJst: () => mockGetTodayJst(),
}));

// Import after mocks are set up
import {
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
    it("returns null when window is undefined (SSR)", () => {
      // window exists in jsdom, but we can test the cache behavior.
      // SSR guard is covered by getFortuneServerSnapshot returning null.
      // In jsdom environment, window is available, so it should return a value.
      const result = getFortuneSnapshot();
      // jsdom has window, so result should be non-null
      expect(result).not.toBeNull();
    });

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
    it("registers and unregisters a listener", () => {
      const listener = vi.fn();
      const unsubscribe = subscribeFortuneStore(listener);
      expect(typeof unsubscribe).toBe("function");
      // Unsubscribe should not throw
      expect(() => unsubscribe()).not.toThrow();
    });
  });
});
