import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Tests for SSR-safe A/B arm assignment.
 *
 * jsdom provides a real `window` and `localStorage`, so most tests run in the
 * client path. The SSR test deletes `window` to simulate the server.
 *
 * The module keeps a per-page in-memory fallback map (for the
 * localStorage-unavailable case). To keep that state from leaking between
 * tests, every test loads a FRESH module instance via vi.resetModules() +
 * dynamic import in beforeEach. localStorage is cleared around each test too.
 */

const EXPERIMENT_ID = "quiz_result_visual_v1";

type AssignModule = typeof import("@/lib/ab/assign");

describe("getAbArm", () => {
  let getAbArm: AssignModule["getAbArm"];
  let AB_STORAGE_KEY: AssignModule["AB_STORAGE_KEY"];

  beforeEach(async () => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    // Fresh module so the in-memory fallback map starts empty each test.
    vi.resetModules();
    const mod = await import("@/lib/ab/assign");
    getAbArm = mod.getAbArm;
    AB_STORAGE_KEY = mod.AB_STORAGE_KEY;
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("on first call with no stored arm, picks a random arm and persists it", () => {
    // Force the random draw to "A" (Math.random() < 0.5).
    vi.spyOn(Math, "random").mockReturnValue(0.1);

    const arm = getAbArm(EXPERIMENT_ID);

    expect(arm).toBe("A");
    const stored = JSON.parse(
      window.localStorage.getItem(AB_STORAGE_KEY) ?? "{}",
    );
    expect(stored).toEqual({ [EXPERIMENT_ID]: "A" });
  });

  it("picks B when Math.random() >= 0.5", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);

    const arm = getAbArm(EXPERIMENT_ID);

    expect(arm).toBe("B");
  });

  it("is fixed: a subsequent read returns the same arm even if random changes", () => {
    // First call assigns "A".
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.2);
    const first = getAbArm(EXPERIMENT_ID);
    expect(first).toBe("A");

    // Even if a later draw would have produced "B", the stored arm wins.
    randomSpy.mockReturnValue(0.99);
    const second = getAbArm(EXPERIMENT_ID);
    const third = getAbArm(EXPERIMENT_ID);

    expect(second).toBe("A");
    expect(third).toBe("A");
  });

  it("reads a pre-existing stored arm without calling Math.random()", () => {
    window.localStorage.setItem(
      AB_STORAGE_KEY,
      JSON.stringify({ [EXPERIMENT_ID]: "B" }),
    );
    const randomSpy = vi.spyOn(Math, "random");

    const arm = getAbArm(EXPERIMENT_ID);

    expect(arm).toBe("B");
    expect(randomSpy).not.toHaveBeenCalled();
  });

  it("keeps independent arms per experiment id and preserves other entries", () => {
    window.localStorage.setItem(
      AB_STORAGE_KEY,
      JSON.stringify({ other_experiment: "A" }),
    );
    vi.spyOn(Math, "random").mockReturnValue(0.9); // -> "B" for the new one

    const arm = getAbArm(EXPERIMENT_ID);

    expect(arm).toBe("B");
    const stored = JSON.parse(
      window.localStorage.getItem(AB_STORAGE_KEY) ?? "{}",
    );
    // The unrelated experiment's arm must be preserved.
    expect(stored).toEqual({ other_experiment: "A", [EXPERIMENT_ID]: "B" });
  });

  it("ignores malformed JSON in storage and re-assigns", () => {
    window.localStorage.setItem(AB_STORAGE_KEY, "{ not valid json");
    vi.spyOn(Math, "random").mockReturnValue(0.1); // -> "A"

    const arm = getAbArm(EXPERIMENT_ID);

    expect(arm).toBe("A");
  });

  it("ignores a stored value that is not a valid arm label", () => {
    window.localStorage.setItem(
      AB_STORAGE_KEY,
      JSON.stringify({ [EXPERIMENT_ID]: "Z" }),
    );
    vi.spyOn(Math, "random").mockReturnValue(0.9); // -> "B"

    const arm = getAbArm(EXPERIMENT_ID);

    // "Z" is dropped as invalid, so a fresh valid arm is assigned.
    expect(arm).toBe("B");
  });

  describe("localStorage unavailable (private mode etc.)", () => {
    it("falls back to an in-memory arm and does not throw or persist", () => {
      // Make every localStorage access throw, like Safari private mode.
      // Spy on the actual localStorage instance (jsdom's storage object is not
      // necessarily a Storage.prototype instance), so the guard is exercised.
      vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
        throw new DOMException("denied");
      });
      const setItemSpy = vi
        .spyOn(window.localStorage, "setItem")
        .mockImplementation(() => {
          throw new DOMException("denied");
        });
      vi.spyOn(Math, "random").mockReturnValue(0.1); // -> "A"

      let arm: string | null = null;
      expect(() => {
        arm = getAbArm(EXPERIMENT_ID);
      }).not.toThrow();
      expect(arm).toBe("A");

      // A write was attempted (and threw); nothing was persisted.
      expect(setItemSpy).toHaveBeenCalled();

      // The arm stays consistent within the page lifetime via the in-memory
      // map even though storage keeps throwing.
      const again = getAbArm(EXPERIMENT_ID);
      expect(again).toBe("A");
    });
  });

  describe("SSR (no window)", () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      originalWindow = globalThis.window;
      // Simulate a server environment where window is undefined.
      // @ts-expect-error intentionally removing window for the SSR guard test
      delete globalThis.window;
    });

    afterEach(() => {
      globalThis.window = originalWindow;
    });

    it("returns null and does not throw when window is undefined", () => {
      let arm: string | null = "unset";
      expect(() => {
        arm = getAbArm(EXPERIMENT_ID);
      }).not.toThrow();
      expect(arm).toBeNull();
    });

    it("does not call Math.random() during SSR", () => {
      const randomSpy = vi.spyOn(Math, "random");
      getAbArm(EXPERIMENT_ID);
      expect(randomSpy).not.toHaveBeenCalled();
    });
  });
});
