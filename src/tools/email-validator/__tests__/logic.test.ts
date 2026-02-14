import { describe, test, expect } from "vitest";
import { validateEmail, parseEmailParts } from "../logic";

describe("validateEmail", () => {
  test("valid simple email", () => {
    const result = validateEmail("user@example.com");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("valid email with subdomain", () => {
    const result = validateEmail("user@sub.example.com");
    expect(result.valid).toBe(true);
  });

  test("valid email with plus tag", () => {
    const result = validateEmail("user+tag@example.com");
    expect(result.valid).toBe(true);
  });

  test("invalid: no @ symbol", () => {
    const result = validateEmail("userexample.com");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("@が含まれていません");
  });

  test("invalid: multiple @ symbols", () => {
    const result = validateEmail("user@@example.com");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("@が複数含まれています");
  });

  test("invalid: empty local part", () => {
    const result = validateEmail("@example.com");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("ローカルパート(@の前)が空です");
  });

  test("invalid: empty domain", () => {
    const result = validateEmail("user@");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("ドメイン(@の後)が空です");
  });

  test("invalid: local part starts with dot", () => {
    const result = validateEmail(".user@example.com");
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.includes("先頭にドット")),
    ).toBe(true);
  });

  test("invalid: consecutive dots in local part", () => {
    const result = validateEmail("user..name@example.com");
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.includes("連続したドット")),
    ).toBe(true);
  });

  test("invalid: domain starts with hyphen", () => {
    const result = validateEmail("user@-example.com");
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.includes("先頭にハイフン")),
    ).toBe(true);
  });

  test("invalid: local part exceeds 64 characters", () => {
    const long = "a".repeat(65);
    const result = validateEmail(`${long}@example.com`);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.includes("64文字")),
    ).toBe(true);
  });

  test("suggests correction for typo domain", () => {
    const result = validateEmail("user@gmial.com");
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0]).toContain("gmail.com");
  });

  test("invalid: empty string", () => {
    const result = validateEmail("");
    expect(result.valid).toBe(false);
  });

  test("invalid: whitespace only", () => {
    const result = validateEmail("   ");
    expect(result.valid).toBe(false);
  });
});

describe("parseEmailParts", () => {
  test("parses valid email", () => {
    const parts = parseEmailParts("user@example.com");
    expect(parts).toEqual({ localPart: "user", domain: "example.com" });
  });

  test("returns null for email without @", () => {
    const parts = parseEmailParts("userexample.com");
    expect(parts).toBeNull();
  });
});
