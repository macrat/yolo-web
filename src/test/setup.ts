import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

/**
 * Provide a stable localStorage implementation that survives vi.useFakeTimers().
 * In vitest 4 + jsdom, fake timers can replace window globals including localStorage,
 * causing "not a function" errors. This mock avoids that issue.
 */
function createLocalStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem(key: string): string | null {
      return key in store ? store[key] : null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
  };
}

const localStorageMock = createLocalStorageMock();

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  localStorageMock.clear();
});
