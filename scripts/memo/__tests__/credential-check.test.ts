import { expect, test, describe } from "vitest";
import { checkCredentials } from "../core/credential-check.js";

describe("checkCredentials", () => {
  test("detects API key assignment", () => {
    const result = checkCredentials("api_key = sk_live_abc123");
    expect(result.found).toBe(true);
    expect(result.description).toContain("API key");
  });

  test("detects password assignment", () => {
    const result = checkCredentials("password: my_secret_pass");
    expect(result.found).toBe(true);
    expect(result.description).toContain("API key");
  });

  test("detects Bearer token", () => {
    const result = checkCredentials(
      "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.test",
    );
    expect(result.found).toBe(true);
    expect(result.description).toContain("Bearer token");
  });

  test("detects PEM block", () => {
    const result = checkCredentials("-----BEGIN RSA PRIVATE KEY-----");
    expect(result.found).toBe(true);
    expect(result.description).toContain("PEM block");
  });

  test("detects AWS access key", () => {
    const result = checkCredentials("AKIAIOSFODNN7EXAMPLE");
    expect(result.found).toBe(true);
    expect(result.description).toContain("AWS access key");
  });

  test("detects URL with embedded credentials", () => {
    const result = checkCredentials(
      "postgresql://user:password@localhost:5432/db",
    );
    expect(result.found).toBe(true);
    expect(result.description).toContain("URL with embedded credentials");
  });

  test("returns not found for safe content", () => {
    const result = checkCredentials(
      "## Summary\n\nThis is a normal memo about implementation progress.",
    );
    expect(result.found).toBe(false);
    expect(result.description).toBeNull();
  });

  test("returns not found for empty string", () => {
    const result = checkCredentials("");
    expect(result.found).toBe(false);
    expect(result.description).toBeNull();
  });

  test("detects token assignment (case-insensitive)", () => {
    const result = checkCredentials("TOKEN=abc123def");
    expect(result.found).toBe(true);
  });

  test("detects secret assignment", () => {
    const result = checkCredentials("SECRET: super_secret_value");
    expect(result.found).toBe(true);
  });
});
