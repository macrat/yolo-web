import { describe, test, expect } from "vitest";
import { generatePassword, evaluateStrength, DEFAULT_OPTIONS } from "../logic";

describe("generatePassword", () => {
  test("generates password with default length", () => {
    const pw = generatePassword(DEFAULT_OPTIONS);
    expect(pw).toHaveLength(DEFAULT_OPTIONS.length);
  });

  test("generates password with specified length", () => {
    const pw = generatePassword({ ...DEFAULT_OPTIONS, length: 32 });
    expect(pw).toHaveLength(32);
  });

  test("generates only lowercase when only lowercase selected", () => {
    const pw = generatePassword({
      ...DEFAULT_OPTIONS,
      uppercase: false,
      digits: false,
      symbols: false,
    });
    expect(pw).toMatch(/^[a-z]+$/);
  });

  test("generates only digits when only digits selected", () => {
    const pw = generatePassword({
      ...DEFAULT_OPTIONS,
      uppercase: false,
      lowercase: false,
      symbols: false,
    });
    expect(pw).toMatch(/^[0-9]+$/);
  });

  test("returns empty string when no charset selected", () => {
    const pw = generatePassword({
      ...DEFAULT_OPTIONS,
      uppercase: false,
      lowercase: false,
      digits: false,
      symbols: false,
    });
    expect(pw).toBe("");
  });

  test("excludes ambiguous characters when option enabled", () => {
    const pw = generatePassword({
      ...DEFAULT_OPTIONS,
      length: 100,
      excludeAmbiguous: true,
    });
    expect(pw).not.toMatch(/[O0Il1]/);
  });

  test("clamps length between 1 and 128", () => {
    const pwShort = generatePassword({ ...DEFAULT_OPTIONS, length: 0 });
    expect(pwShort).toHaveLength(1);
    const pwLong = generatePassword({ ...DEFAULT_OPTIONS, length: 200 });
    expect(pwLong).toHaveLength(128);
  });

  test("generates different passwords each time", () => {
    const pw1 = generatePassword(DEFAULT_OPTIONS);
    const pw2 = generatePassword(DEFAULT_OPTIONS);
    // Extremely unlikely to be the same with 16 chars from ~90 charset
    expect(pw1).not.toBe(pw2);
  });
});

describe("evaluateStrength", () => {
  test("returns weak for short password with small charset", () => {
    const strength = evaluateStrength({
      ...DEFAULT_OPTIONS,
      length: 4,
      uppercase: false,
      symbols: false,
    });
    expect(strength).toBe("weak");
  });

  test("returns strong for long password with full charset", () => {
    const strength = evaluateStrength({
      ...DEFAULT_OPTIONS,
      length: 20,
    });
    expect(strength).toBe("strong");
  });

  test("returns weak for empty charset", () => {
    const strength = evaluateStrength({
      ...DEFAULT_OPTIONS,
      uppercase: false,
      lowercase: false,
      digits: false,
      symbols: false,
    });
    expect(strength).toBe("weak");
  });
});
