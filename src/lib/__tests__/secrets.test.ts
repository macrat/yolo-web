import { describe, test, expect } from "vitest";
import { detectSecrets } from "@/lib/secrets";

describe("detectSecrets", () => {
  test("detects api_key assignments", () => {
    expect(detectSecrets("api_key=sk-12345abcdef")).not.toBeNull();
  });

  test("detects apikey assignments", () => {
    expect(detectSecrets("apikey: some-secret-value")).not.toBeNull();
  });

  test("detects token assignments", () => {
    expect(detectSecrets("token=eyJhbGciOiJIUzI1NiJ9")).not.toBeNull();
  });

  test("detects password assignments", () => {
    expect(detectSecrets("password = my_secret_pass")).not.toBeNull();
  });

  test("detects Bearer tokens", () => {
    expect(
      detectSecrets(
        "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0",
      ),
    ).not.toBeNull();
  });

  test("detects PEM blocks", () => {
    expect(detectSecrets("-----BEGIN RSA PRIVATE KEY-----")).not.toBeNull();
    expect(detectSecrets("-----BEGIN CERTIFICATE-----")).not.toBeNull();
  });

  test("detects AWS access keys", () => {
    expect(detectSecrets("AKIAIOSFODNN7EXAMPLE")).not.toBeNull();
  });

  test("detects URLs with credentials", () => {
    expect(detectSecrets("https://user:password@host.com/path")).not.toBeNull();
  });

  test("does not flag normal memo content", () => {
    expect(
      detectSecrets(
        "## Summary\n\nThe project manager reviewed the plan and approved it.\n\n## Results\n\n- Finding 1\n- Finding 2",
      ),
    ).toBeNull();
  });

  test("does not flag mentions of 'token' in normal context", () => {
    expect(
      detectSecrets("The token system is used for authentication in the app."),
    ).toBeNull();
  });

  test("does not flag mentions of 'key' in normal context", () => {
    expect(detectSecrets("The key insight is that SSG is fast.")).toBeNull();
  });
});
