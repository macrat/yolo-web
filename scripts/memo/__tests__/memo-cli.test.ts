/**
 * Tests for memo CLI body resolution logic (resolveBody function).
 *
 * Covers:
 *   A. --body - reads from stdin
 *   B. 10-character minimum validation
 *   C. Backward compatibility
 *   D. Error message content
 */

import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { resolveBody } from "../../memo.js";

beforeEach(() => {
  vi.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
    throw new Error(`process.exit(${code})`);
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// A. --body - reads from stdin
// ---------------------------------------------------------------------------

describe("A. --body - reads from stdin", () => {
  test("A-1: --body - with sufficient stdin body returns the body", () => {
    const stdinBody = "This is a sufficient body from stdin.";
    const result = resolveBody("-", true, () => stdinBody);
    expect(result).toBe(stdinBody);
  });

  test("A-2: --body - with empty stdin exits with error", () => {
    expect(() => resolveBody("-", true, () => "")).toThrow("process.exit(1)");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("body is required"),
    );
  });
});

// ---------------------------------------------------------------------------
// B. 10-character minimum validation
// ---------------------------------------------------------------------------

describe("B. 10-character minimum validation", () => {
  test("B-1: 9-character body exits with too short error", () => {
    expect(() =>
      resolveBody("123456789", true, () => ""),
    ).toThrow("process.exit(1)");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("too short"),
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("9 characters"),
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("10 characters required"),
    );
  });

  test("B-2: 10-character body succeeds", () => {
    const result = resolveBody("1234567890", true, () => "");
    expect(result).toBe("1234567890");
  });

  test("B-3: 11-character body succeeds", () => {
    const result = resolveBody("12345678901", true, () => "");
    expect(result).toBe("12345678901");
  });

  test("B-4: whitespace-only body (9 spaces) exits with error", () => {
    expect(() =>
      resolveBody("         ", true, () => ""),
    ).toThrow("process.exit(1)");
    // whitespace-only body is treated as empty/too short
    const errorArgs = (console.error as ReturnType<typeof vi.spyOn>).mock.calls.flat();
    const hasBodyRequired = errorArgs.some(
      (a: unknown) => typeof a === "string" && a.includes("body is required"),
    );
    const hasTooShort = errorArgs.some(
      (a: unknown) => typeof a === "string" && a.includes("too short"),
    );
    expect(hasBodyRequired || hasTooShort).toBe(true);
  });

  test("B-5: body with surrounding whitespace, trim >= 10 chars, succeeds", () => {
    const body = "  hello world  ";
    const result = resolveBody(body, true, () => "");
    expect(result).toBe(body);
  });

  test("B-5b: body with surrounding whitespace, trim < 10 chars, exits with error", () => {
    // "  hi  " trims to "hi" which is 2 chars
    expect(() =>
      resolveBody("  hi  ", true, () => ""),
    ).toThrow("process.exit(1)");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("too short"),
    );
  });
});

// ---------------------------------------------------------------------------
// C. Backward compatibility
// ---------------------------------------------------------------------------

describe("C. Backward compatibility", () => {
  test("C-1: no --body flag and isTTY=false reads from stdin", () => {
    const stdinBody = "This comes from a pipe and is long enough.";
    const result = resolveBody(undefined, false, () => stdinBody);
    expect(result).toBe(stdinBody);
  });

  test("C-2: --body with sufficient value (>= 10 chars) succeeds", () => {
    const body = "sufficient body value";
    const result = resolveBody(body, true, () => "");
    expect(result).toBe(body);
  });

  test("C-3: --body with short value (< 10 chars) exits with error", () => {
    expect(() => resolveBody("short", true, () => "")).toThrow("process.exit(1)");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("too short"),
    );
  });

  test("C-4: no --body flag and isTTY=true (interactive terminal) exits", () => {
    // No body source at all → should error
    expect(() => resolveBody(undefined, true, () => "")).toThrow(
      "process.exit(1)",
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("body is required"),
    );
  });
});

// ---------------------------------------------------------------------------
// D. Error message content
// ---------------------------------------------------------------------------

describe("D. Error message content", () => {
  test("D-1: too short error includes character count and minimum requirement", () => {
    expect(() => resolveBody("abc", true, () => "")).toThrow("process.exit(1)");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/3 characters/),
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/10 characters required/),
    );
  });

  test("D-2: too short error includes usage guidance for pipe and --body -", () => {
    expect(() => resolveBody("abc", true, () => "")).toThrow("process.exit(1)");
    const errorCalls = (console.error as ReturnType<typeof vi.spyOn>).mock.calls
      .flat()
      .join("\n");
    expect(errorCalls).toMatch(/echo.*memo body/);
    expect(errorCalls).toMatch(/--body -/);
  });
});
