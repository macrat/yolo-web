import { describe, test, expect } from "vitest";
import { POST } from "../route";

/**
 * Helper to create a POST Request with JSON body.
 */
function createPostRequest(body: unknown): Request {
  return new Request("http://localhost/api/yoji-kimeru/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** A valid date that is after the epoch (2026-02-14). */
const VALID_DATE = "2026-03-01";

describe("POST /api/yoji-kimeru/evaluate", () => {
  test("returns feedback for a valid guess (not correct)", async () => {
    // "一期一会" is a well-known yoji, but we test with a generic 4-char guess.
    // We use a known valid 4-character yoji string for the guess.
    const request = createPostRequest({
      guess: "四字熟語",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.feedback).toBeDefined();
    expect(data.feedback.guess).toBe("四字熟語");
    expect(data.feedback.charFeedbacks).toBeInstanceOf(Array);
    expect(data.feedback.charFeedbacks).toHaveLength(4);
    expect(typeof data.isCorrect).toBe("boolean");
  });

  test("does not return targetYoji during gameplay (not final turn, not correct)", async () => {
    const request = createPostRequest({
      guess: "四字熟語",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    const data = await response.json();

    // If the guess is not correct and it's not the final turn,
    // targetYoji must not be present (anti-cheat)
    if (!data.isCorrect) {
      expect(data.targetYoji).toBeUndefined();
    }
  });

  test("returns targetYoji on final turn (guessNumber=6)", async () => {
    const request = createPostRequest({
      guess: "四字熟語",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 6,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    // On final turn, targetYoji should always be returned
    expect(data.targetYoji).toBeDefined();
    expect(typeof data.targetYoji.yoji).toBe("string");
    expect(typeof data.targetYoji.reading).toBe("string");
    expect(typeof data.targetYoji.meaning).toBe("string");
    expect(typeof data.targetYoji.difficulty).toBe("number");
  });

  test("charFeedbacks contains valid values", async () => {
    const request = createPostRequest({
      guess: "四字熟語",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    const data = await response.json();

    const validValues = new Set(["correct", "present", "absent"]);
    for (const fb of data.feedback.charFeedbacks) {
      expect(validValues.has(fb)).toBe(true);
    }
  });

  test("returns 400 for invalid guess (empty string)", async () => {
    const request = createPostRequest({
      guess: "",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test("returns 400 for guess with fewer than 4 characters", async () => {
    const request = createPostRequest({
      guess: "一期一",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for guess with more than 4 characters", async () => {
    const request = createPostRequest({
      guess: "一期一会山川",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for guess containing non-kanji characters", async () => {
    const request = createPostRequest({
      guess: "abcd",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test("returns 400 for invalid difficulty", async () => {
    const request = createPostRequest({
      guess: "四字熟語",
      puzzleDate: VALID_DATE,
      difficulty: "expert",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for invalid date format", async () => {
    const request = createPostRequest({
      guess: "四字熟語",
      puzzleDate: "2026/03/01",
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for invalid guessNumber (0)", async () => {
    const request = createPostRequest({
      guess: "四字熟語",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 0,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for guessNumber exceeding MAX_GUESSES (7)", async () => {
    const request = createPostRequest({
      guess: "四字熟語",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 7,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for non-integer guessNumber", async () => {
    const request = createPostRequest({
      guess: "四字熟語",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1.5,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for invalid JSON body", async () => {
    const request = new Request("http://localhost/api/yoji-kimeru/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("works with all difficulty levels", async () => {
    for (const difficulty of ["beginner", "intermediate", "advanced"]) {
      const request = createPostRequest({
        guess: "四字熟語",
        puzzleDate: VALID_DATE,
        difficulty,
        guessNumber: 1,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });
});
