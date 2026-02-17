import { expect, test } from "vitest";
import {
  generateMemoId,
  idFromTimestamp,
  timestampFromId,
} from "../core/id.js";

test("generateMemoId returns a hex ID and timestamp", () => {
  const before = Date.now();
  const { id, timestamp } = generateMemoId();
  const after = Date.now();

  expect(id).toMatch(/^[0-9a-f]+$/);
  expect(timestamp).toBeGreaterThanOrEqual(before);
  expect(timestamp).toBeLessThanOrEqual(after);
  expect(parseInt(id, 16)).toBe(timestamp);
});

test("idFromTimestamp converts ISO-8601 to hex ID", () => {
  const iso = "2026-02-17T13:54:10.123+09:00";
  const id = idFromTimestamp(iso);
  expect(id).toMatch(/^[0-9a-f]+$/);

  const ms = new Date(iso).getTime();
  expect(id).toBe(ms.toString(16));
});

test("timestampFromId converts hex ID to millisecond timestamp", () => {
  const ms = Date.now();
  const id = ms.toString(16);
  expect(timestampFromId(id)).toBe(ms);
});

test("idFromTimestamp and timestampFromId are inverses", () => {
  const iso = "2026-02-17T13:54:10.123+09:00";
  const id = idFromTimestamp(iso);
  const ms = timestampFromId(id);
  expect(ms).toBe(new Date(iso).getTime());
});
