import { describe, test, expect } from "vitest";
import { GET } from "../route";

/**
 * Helper to create a GET Request with query parameters.
 */
function createGetRequest(params: Record<string, string>): Request {
  const url = new URL("http://localhost/api/kanji-kanaru/hints");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

/** A valid date that is after the epoch (2026-02-14). */
const VALID_DATE = "2026-03-01";

describe("GET /api/kanji-kanaru/hints", () => {
  test("returns hints and puzzle number for valid parameters", async () => {
    const request = createGetRequest({
      date: VALID_DATE,
      difficulty: "intermediate",
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.puzzleNumber).toBeGreaterThan(0);
    expect(typeof data.puzzleNumber).toBe("number");
    expect(data.hints).toBeDefined();
    expect(typeof data.hints.strokeCount).toBe("number");
    expect(typeof data.hints.onYomiCount).toBe("number");
    expect(typeof data.hints.kunYomiCount).toBe("number");
    expect(data.hints.strokeCount).toBeGreaterThan(0);
    expect(data.hints.onYomiCount).toBeGreaterThanOrEqual(0);
    expect(data.hints.kunYomiCount).toBeGreaterThanOrEqual(0);
  });

  test("does not expose the target kanji character", async () => {
    const request = createGetRequest({
      date: VALID_DATE,
      difficulty: "beginner",
    });

    const response = await GET(request);
    const data = await response.json();

    // The response should not contain a 'character' field or target info
    expect(data.character).toBeUndefined();
    expect(data.targetKanji).toBeUndefined();
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
      expect(data.hints).toBeDefined();
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
    expect(data1.hints.strokeCount).toBe(data2.hints.strokeCount);
    expect(data1.hints.onYomiCount).toBe(data2.hints.onYomiCount);
    expect(data1.hints.kunYomiCount).toBe(data2.hints.kunYomiCount);
  });

  test("returns different puzzles for different dates", async () => {
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
