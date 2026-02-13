import { expect, test } from "vitest";
import { generateMemoId } from "../core/id.js";

test("generateMemoId returns a hex string", () => {
  const id = generateMemoId();
  expect(id).toMatch(/^[0-9a-f]+$/);
});

test("generateMemoId returns a string that decodes to a recent timestamp", () => {
  const before = Date.now();
  const id = generateMemoId();
  const after = Date.now();
  const decoded = parseInt(id, 16);
  expect(decoded).toBeGreaterThanOrEqual(before);
  expect(decoded).toBeLessThanOrEqual(after);
});
