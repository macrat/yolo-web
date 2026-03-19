/**
 * Tests for the showHowToPlay SSR/CSR hydration fix in GameContainer.
 *
 * The fix ensures that useState initializer always returns `false` (SSR-safe default),
 * and initial first-visit detection happens in useEffect only on the client side.
 *
 * These tests verify the expected behavior via the localStorage-based logic
 * that should live exclusively in useEffect after the fix.
 */
import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import React, { useState, useEffect, useRef } from "react";

const FIRST_VISIT_KEY = "nakamawake-first-visit";

/**
 * Records the initial (synchronous render-phase) value of showHowToPlay,
 * then runs the useEffect logic, and records the post-effect value.
 *
 * This isolates the logic we want to test from GameContainer's heavy
 * dependencies (puzzle JSON, modals, etc.).
 */
function UseShowHowToPlayFixed({
  onInitialValue,
  onFinalValue,
}: {
  onInitialValue: (v: boolean) => void;
  onFinalValue: (v: boolean) => void;
}) {
  // SSR-safe initial value: always false (matches server render)
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Record initial (render-phase) value only once using a ref guard
  const initialRecorded = useRef<boolean | null>(null);
  if (initialRecorded.current == null) {
    initialRecorded.current = true;
    onInitialValue(showHowToPlay);
  }

  useEffect(() => {
    // First-visit detection runs only on the client after hydration
    try {
      const visited = window.localStorage.getItem(FIRST_VISIT_KEY);
      if (!visited) {
        // Write before setState to handle React StrictMode double-invocation
        window.localStorage.setItem(FIRST_VISIT_KEY, "1");
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Mirrors the actual GameContainer implementation: reading localStorage is an external system sync
        setShowHowToPlay(true);
      }
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, []);

  // Track the current value after each render for final-value assertion
  useEffect(() => {
    onFinalValue(showHowToPlay);
  });

  return null;
}

/**
 * Reproduces the old (pre-fix) pattern.
 * The useState lazy initializer reads localStorage synchronously, causing
 * SSR/CSR mismatch: server returns false (window undefined), client returns
 * true on first visit (window.localStorage has no flag yet).
 */
function UseShowHowToPlayBroken({
  onInitialValue,
}: {
  onInitialValue: (v: boolean) => void;
}) {
  const [showHowToPlay] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const visited = window.localStorage.getItem(FIRST_VISIT_KEY);
      if (!visited) {
        window.localStorage.setItem(FIRST_VISIT_KEY, "1");
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  });

  const initialRecorded = useRef<boolean | null>(null);
  if (initialRecorded.current == null) {
    initialRecorded.current = true;
    onInitialValue(showHowToPlay);
  }

  return null;
}

describe("showHowToPlay SSR/CSR hydration fix", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Fixed pattern (useState(false) + useEffect)", () => {
    test("initial render value is false (SSR-safe default)", async () => {
      let initialValue: boolean | undefined;
      await act(async () => {
        render(
          <UseShowHowToPlayFixed
            onInitialValue={(v) => {
              initialValue = v;
            }}
            onFinalValue={() => {}}
          />,
        );
      });
      // The synchronous render-phase value must be false to match SSR output
      expect(initialValue).toBe(false);
    });

    test("shows modal (true) after effect runs on first visit", async () => {
      let finalValue: boolean | undefined;
      await act(async () => {
        render(
          <UseShowHowToPlayFixed
            onInitialValue={() => {}}
            onFinalValue={(v) => {
              finalValue = v;
            }}
          />,
        );
      });
      // After useEffect runs, first-visit flag triggers modal
      expect(finalValue).toBe(true);
    });

    test("does NOT show modal on second visit", async () => {
      // Pre-populate localStorage to simulate a returning visitor
      window.localStorage.setItem(FIRST_VISIT_KEY, "1");

      let finalValue: boolean | undefined;
      await act(async () => {
        render(
          <UseShowHowToPlayFixed
            onInitialValue={() => {}}
            onFinalValue={(v) => {
              finalValue = v;
            }}
          />,
        );
      });
      expect(finalValue).toBe(false);
    });

    test("writes FIRST_VISIT_KEY to localStorage on first visit", async () => {
      await act(async () => {
        render(
          <UseShowHowToPlayFixed
            onInitialValue={() => {}}
            onFinalValue={() => {}}
          />,
        );
      });
      expect(window.localStorage.getItem(FIRST_VISIT_KEY)).toBe("1");
    });

    test("does NOT write FIRST_VISIT_KEY again on second visit", async () => {
      window.localStorage.setItem(FIRST_VISIT_KEY, "1");
      const setItemSpy = vi.spyOn(window.localStorage, "setItem");

      await act(async () => {
        render(
          <UseShowHowToPlayFixed
            onInitialValue={() => {}}
            onFinalValue={() => {}}
          />,
        );
      });
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe("Broken pattern (useState lazy initializer reading localStorage)", () => {
    test("initial render is true (not false) on first visit in browser environment — documents the hydration bug", () => {
      // In jsdom (browser-like env), window is defined, so the lazy initializer
      // reads localStorage and returns true immediately.
      // On SSR (window undefined), it returns false.
      // This mismatch causes the Next.js hydration warning.
      let initialValue: boolean | undefined;
      render(
        <UseShowHowToPlayBroken
          onInitialValue={(v) => {
            initialValue = v;
          }}
        />,
      );
      // Documents the broken behavior: true in browser, false in SSR
      expect(initialValue).toBe(true);
    });
  });
});
