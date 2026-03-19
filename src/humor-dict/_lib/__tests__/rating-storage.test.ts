import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { isRated, markAsRated } from "../rating-storage";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isRated", () => {
  test("未評価のslugに対して false を返す", () => {
    expect(isRated("some-slug")).toBe(false);
  });

  test("LocalStorageが使用不可の場合に false を返す", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    expect(isRated("some-slug")).toBe(false);
  });
});

describe("markAsRated + isRated", () => {
  test("評価後に true を返す", () => {
    markAsRated("test-slug");
    expect(isRated("test-slug")).toBe(true);
  });

  test("評価していない別slugには false を返す", () => {
    markAsRated("slug-a");
    expect(isRated("slug-b")).toBe(false);
  });
});

describe("markAsRated", () => {
  test("同じslugを2回呼んでも重複しない", () => {
    markAsRated("dup-slug");
    markAsRated("dup-slug");
    const raw = localStorage.getItem("humor-dictionary-ratings");
    const stored = JSON.parse(raw!) as string[];
    expect(stored.filter((s) => s === "dup-slug")).toHaveLength(1);
  });

  test("LocalStorageが使用不可の場合にエラーを投げない", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    expect(() => markAsRated("some-slug")).not.toThrow();
  });
});
