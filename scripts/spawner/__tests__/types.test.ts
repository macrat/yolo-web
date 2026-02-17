import { describe, it, expect } from "vitest";
import {
  MONITORED_ROLES,
  RETRY_INTERVALS_MS,
  MAX_RETRIES,
  PM_CRASH_THRESHOLD_MS,
  DEFAULT_MAX_CONCURRENT,
  DEBOUNCE_MS,
} from "../types.js";

describe("types constants", () => {
  it("defines 6 monitored roles (excludes owner)", () => {
    expect(MONITORED_ROLES).toHaveLength(6);
    expect(MONITORED_ROLES).not.toContain("owner");
    expect(MONITORED_ROLES).toContain("project-manager");
    expect(MONITORED_ROLES).toContain("builder");
    expect(MONITORED_ROLES).toContain("reviewer");
    expect(MONITORED_ROLES).toContain("researcher");
    expect(MONITORED_ROLES).toContain("planner");
    expect(MONITORED_ROLES).toContain("process-engineer");
  });

  it("defines 3 retry intervals with exponential backoff", () => {
    expect(RETRY_INTERVALS_MS).toEqual([5000, 15000, 45000]);
    expect(RETRY_INTERVALS_MS).toHaveLength(MAX_RETRIES);
  });

  it("defines PM crash threshold at 30 seconds", () => {
    expect(PM_CRASH_THRESHOLD_MS).toBe(30000);
  });

  it("defines default max concurrent at 10", () => {
    expect(DEFAULT_MAX_CONCURRENT).toBe(10);
  });

  it("defines debounce at 500ms", () => {
    expect(DEBOUNCE_MS).toBe(500);
  });
});
