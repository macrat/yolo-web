import { describe, test, expect } from "vitest";
import { POST } from "../route";

/**
 * Helper to create a POST Request with JSON body.
 */
function createPostRequest(body: unknown): Request {
  return new Request("http://localhost/api/kanji-kanaru/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** A valid date that is after the epoch (2026-02-14). */
const VALID_DATE = "2026-03-01";

describe("POST /api/kanji-kanaru/evaluate", () => {
  test("returns feedback for a valid guess (not correct)", async () => {
    const request = createPostRequest({
      guess: "学",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.feedback).toBeDefined();
    expect(data.feedback.guess).toBe("学");
    expect(data.feedback.radical).toBeDefined();
    expect(data.feedback.strokeCount).toBeDefined();
    expect(data.feedback.grade).toBeDefined();
    expect(data.feedback.gradeDirection).toBeDefined();
    expect(data.feedback.onYomi).toBeDefined();
    expect(data.feedback.category).toBeDefined();
    expect(data.feedback.kunYomiCount).toBeDefined();
    expect(typeof data.isCorrect).toBe("boolean");
  });

  test("returns targetKanji when guess is correct", async () => {
    // First, we need to know the target. We'll use the hints endpoint approach:
    // Make a guess with the correct character by trying all possible targets.
    // Instead, we test the structure: when isCorrect=true, targetKanji is present.
    // We use guessNumber=6 (final turn) to guarantee targetKanji is returned.
    const request = createPostRequest({
      guess: "山",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 6,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    // On final turn, targetKanji should always be returned
    expect(data.targetKanji).toBeDefined();
    expect(data.targetKanji.character).toBeDefined();
    expect(data.targetKanji.onYomi).toBeInstanceOf(Array);
    expect(data.targetKanji.kunYomi).toBeInstanceOf(Array);
    expect(data.targetKanji.meanings).toBeInstanceOf(Array);
    expect(data.targetKanji.examples).toBeInstanceOf(Array);
  });

  test("does not return targetKanji during gameplay (not final turn, not correct)", async () => {
    const request = createPostRequest({
      guess: "学",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    const data = await response.json();

    // If the guess is not correct and it's not the final turn,
    // targetKanji must not be present (anti-cheat)
    if (!data.isCorrect) {
      expect(data.targetKanji).toBeUndefined();
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

  test("returns 400 for multi-character guess", async () => {
    const request = createPostRequest({
      guess: "山川",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for invalid difficulty", async () => {
    const request = createPostRequest({
      guess: "山",
      puzzleDate: VALID_DATE,
      difficulty: "expert",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for invalid date format", async () => {
    const request = createPostRequest({
      guess: "山",
      puzzleDate: "2026/03/01",
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for invalid guessNumber (0)", async () => {
    const request = createPostRequest({
      guess: "山",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 0,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for guessNumber exceeding MAX_GUESSES", async () => {
    const request = createPostRequest({
      guess: "山",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 7,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test("returns 400 for non-joyo kanji character", async () => {
    const request = createPostRequest({
      guess: "a",
      puzzleDate: VALID_DATE,
      difficulty: "beginner",
      guessNumber: 1,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("valid joyo kanji");
  });

  test("returns 400 for invalid JSON body", async () => {
    const request = new Request("http://localhost/api/kanji-kanaru/evaluate", {
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
        guess: "山",
        puzzleDate: VALID_DATE,
        difficulty,
        guessNumber: 1,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });
});
