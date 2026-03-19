import { describe, test, expect } from "vitest";
import { GET } from "../route";

/**
 * Helper to create a GET Request with query parameters.
 */
function createGetRequest(params: Record<string, string>): Request {
  const url = new URL("http://localhost/api/yoji-kimeru/puzzle");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

/** A valid date that is after the epoch (2026-02-14). */
const VALID_DATE = "2026-03-01";

describe("GET /api/yoji-kimeru/puzzle", () => {
  test("returns puzzle info for valid parameters", async () => {
    const request = createGetRequest({
      date: VALID_DATE,
      difficulty: "intermediate",
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.puzzleNumber).toBeGreaterThan(0);
    expect(typeof data.puzzleNumber).toBe("number");
    expect(typeof data.reading).toBe("string");
    expect(data.reading.length).toBeGreaterThan(0);
    expect(typeof data.category).toBe("string");
    expect(typeof data.origin).toBe("string");
    expect(typeof data.difficulty).toBe("number");
    expect([1, 2, 3]).toContain(data.difficulty);
  });

  test("does not expose the target yoji (answer), meaning, or sourceUrl", async () => {
    const request = createGetRequest({
      date: VALID_DATE,
      difficulty: "beginner",
    });

    const response = await GET(request);
    const data = await response.json();

    // Anti-cheat: answer fields must not be exposed
    expect(data.yoji).toBeUndefined();
    expect(data.meaning).toBeUndefined();
    expect(data.sourceUrl).toBeUndefined();
  });

  test("returns 400 for missing date parameter", async () => {
    const request = createGetRequest({
      difficulty: "beginner",
    });

    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test("returns 400 for invalid date format", async () => {
    const request = createGetRequest({
      date: "03-01-2026",
      difficulty: "beginner",
    });

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for missing difficulty parameter", async () => {
    const request = createGetRequest({
      date: VALID_DATE,
    });

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for invalid difficulty value", async () => {
    const request = createGetRequest({
      date: VALID_DATE,
      difficulty: "expert",
    });

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  test("works with all difficulty levels", async () => {
    for (const difficulty of ["beginner", "intermediate", "advanced"]) {
      const request = createGetRequest({
        date: VALID_DATE,
        difficulty,
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.puzzleNumber).toBeGreaterThan(0);
      expect(typeof data.reading).toBe("string");
      expect(typeof data.category).toBe("string");
      expect(typeof data.origin).toBe("string");
      expect([1, 2, 3]).toContain(data.difficulty);
    }
  });

  test("returns consistent results for the same date and difficulty", async () => {
    const request1 = createGetRequest({
      date: VALID_DATE,
      difficulty: "beginner",
    });
    const request2 = createGetRequest({
      date: VALID_DATE,
      difficulty: "beginner",
    });

    const response1 = await GET(request1);
    const response2 = await GET(request2);
    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(data1.puzzleNumber).toBe(data2.puzzleNumber);
    expect(data1.reading).toBe(data2.reading);
    expect(data1.category).toBe(data2.category);
    expect(data1.origin).toBe(data2.origin);
    expect(data1.difficulty).toBe(data2.difficulty);
  });

  test("returns different puzzle numbers for consecutive dates", async () => {
    const request1 = createGetRequest({
      date: "2026-03-01",
      difficulty: "intermediate",
    });
    const request2 = createGetRequest({
      date: "2026-03-02",
      difficulty: "intermediate",
    });

    const response1 = await GET(request1);
    const response2 = await GET(request2);
    const data1 = await response1.json();
    const data2 = await response2.json();

    // Puzzle numbers should differ by 1 for consecutive days
    expect(data2.puzzleNumber - data1.puzzleNumber).toBe(1);
  });
});
