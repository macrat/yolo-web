import { describe, test, expect, vi, afterEach } from "vitest";
import { isWebShareSupported, shareGameResult } from "../webShare";

describe("isWebShareSupported", () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  test("returns true when navigator.share is a function", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { share: vi.fn() },
      writable: true,
      configurable: true,
    });
    expect(isWebShareSupported()).toBe(true);
  });

  test("returns false when navigator.share is not available", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });
    expect(isWebShareSupported()).toBe(false);
  });
});

describe("shareGameResult", () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  test("returns true on successful share", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: { share: mockShare },
      writable: true,
      configurable: true,
    });

    const result = await shareGameResult({
      title: "Test",
      text: "Test text",
      url: "https://example.com",
    });

    expect(result).toBe(true);
    expect(mockShare).toHaveBeenCalledWith({
      title: "Test",
      text: "Test text",
      url: "https://example.com",
    });
  });

  test("returns false when user cancels", async () => {
    const mockShare = vi.fn().mockRejectedValue(new Error("User cancelled"));
    Object.defineProperty(globalThis, "navigator", {
      value: { share: mockShare },
      writable: true,
      configurable: true,
    });

    const result = await shareGameResult({
      title: "Test",
      text: "Test text",
      url: "https://example.com",
    });

    expect(result).toBe(false);
  });

  test("returns false when Web Share API is not supported", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });

    const result = await shareGameResult({
      title: "Test",
      text: "Test text",
      url: "https://example.com",
    });

    expect(result).toBe(false);
  });
});
