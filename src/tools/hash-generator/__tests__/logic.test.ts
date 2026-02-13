import { describe, test, expect } from "vitest";
import { generateHash, HASH_ALGORITHMS } from "../logic";

// Web Crypto API is available in Node.js 15+
describe("generateHash", () => {
  test("generates SHA-256 hash in hex", async () => {
    const hash = await generateHash("hello", "SHA-256", "hex");
    // Known SHA-256 of "hello"
    expect(hash).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  test("generates SHA-1 hash in hex", async () => {
    const hash = await generateHash("hello", "SHA-1", "hex");
    expect(hash).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
  });

  test("generates SHA-512 hash in hex", async () => {
    const hash = await generateHash("hello", "SHA-512", "hex");
    expect(hash).toHaveLength(128); // SHA-512 is 64 bytes = 128 hex chars
  });

  test("generates SHA-384 hash in hex", async () => {
    const hash = await generateHash("hello", "SHA-384", "hex");
    expect(hash).toHaveLength(96); // SHA-384 is 48 bytes = 96 hex chars
  });

  test("generates hash in base64 format", async () => {
    const hash = await generateHash("hello", "SHA-256", "base64");
    // Base64 encoded SHA-256 -- verify it is valid base64 and non-empty
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  test("returns different hashes for different algorithms", async () => {
    const hashes = await Promise.all(
      HASH_ALGORITHMS.map((algo) => generateHash("test", algo, "hex")),
    );
    const unique = new Set(hashes);
    expect(unique.size).toBe(HASH_ALGORITHMS.length);
  });

  test("generates hash for empty string", async () => {
    const hash = await generateHash("", "SHA-256", "hex");
    // Known SHA-256 of empty string
    expect(hash).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  test("generates hash for Japanese text", async () => {
    const hash = await generateHash("こんにちは", "SHA-256", "hex");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });
});
