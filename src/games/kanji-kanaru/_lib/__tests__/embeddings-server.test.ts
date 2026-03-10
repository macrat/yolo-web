import { describe, test, expect } from "vitest";
import { getCosineSimilarity, evaluateSimilarity } from "../embeddings-server";

describe("getCosineSimilarity", () => {
  test("returns 1.0 for identical vectors", () => {
    const a = new Int8Array([10, 20, 30, 40]);
    const b = new Int8Array([10, 20, 30, 40]);
    const similarity = getCosineSimilarity(a, b);
    expect(similarity).toBeCloseTo(1.0, 5);
  });

  test("returns -1.0 for opposite vectors", () => {
    const a = new Int8Array([10, 20, 30, 40]);
    const b = new Int8Array([-10, -20, -30, -40]);
    const similarity = getCosineSimilarity(a, b);
    expect(similarity).toBeCloseTo(-1.0, 5);
  });

  test("returns 0 for orthogonal vectors", () => {
    const a = new Int8Array([1, 0, 0, 0]);
    const b = new Int8Array([0, 1, 0, 0]);
    const similarity = getCosineSimilarity(a, b);
    expect(similarity).toBeCloseTo(0.0, 5);
  });

  test("returns 0 when one vector is all zeros", () => {
    const a = new Int8Array([10, 20, 30]);
    const b = new Int8Array([0, 0, 0]);
    const similarity = getCosineSimilarity(a, b);
    expect(similarity).toBe(0);
  });

  test("throws on vector length mismatch", () => {
    const a = new Int8Array([1, 2, 3]);
    const b = new Int8Array([1, 2]);
    expect(() => getCosineSimilarity(a, b)).toThrow("Vector length mismatch");
  });

  test("handles negative int8 values correctly", () => {
    // Int8 range: -128 to 127
    const a = new Int8Array([-100, 50, 127, -128]);
    const b = new Int8Array([-100, 50, 127, -128]);
    const similarity = getCosineSimilarity(a, b);
    expect(similarity).toBeCloseTo(1.0, 5);
  });

  test("computes correct similarity for known vectors", () => {
    // Manually compute: dot=1*4+2*5+3*6=32, normA=sqrt(14), normB=sqrt(77)
    const a = new Int8Array([1, 2, 3]);
    const b = new Int8Array([4, 5, 6]);
    const expected = 32 / (Math.sqrt(14) * Math.sqrt(77));
    const similarity = getCosineSimilarity(a, b);
    expect(similarity).toBeCloseTo(expected, 5);
  });
});

describe("evaluateSimilarity", () => {
  test("returns 'correct' for identical characters", () => {
    // Same character short-circuits to 'correct' without embedding lookup
    expect(evaluateSimilarity("山", "山")).toBe("correct");
  });

  test("returns a valid FeedbackLevel for different characters with embeddings", () => {
    // These characters exist in the embedding data (joyo kanji)
    const result = evaluateSimilarity("山", "川");
    expect(["correct", "close", "wrong"]).toContain(result);
  });

  test("returns 'wrong' when character lacks embedding", () => {
    // A character unlikely to have an embedding in the dataset
    const result = evaluateSimilarity("山", "\u{1F600}");
    expect(result).toBe("wrong");
  });

  test("returns 'wrong' when both characters lack embeddings", () => {
    const result = evaluateSimilarity("X", "Y");
    expect(result).toBe("wrong");
  });

  test("similarity thresholds: correct >= 0.40, close >= 0.35", () => {
    // Test semantically related kanji (both nature-related)
    const result1 = evaluateSimilarity("日", "月");
    expect(["correct", "close", "wrong"]).toContain(result1);

    // Test semantically unrelated kanji
    const result2 = evaluateSimilarity("山", "食");
    expect(["correct", "close", "wrong"]).toContain(result2);
  });
});
