import { describe, test, expect } from "vitest";
import { GET } from "../route";

describe("GET /api/yoji-doru/question", () => {
  test("returns a question with the correct structure", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(typeof data.meaning).toBe("string");
    expect(data.meaning.length).toBeGreaterThan(0);
    expect(Array.isArray(data.choices)).toBe(true);
    expect(data.choices).toHaveLength(4);
    expect(typeof data.correctAnswer).toBe("string");
    expect(data.correctAnswer.length).toBeGreaterThan(0);
  });

  test("choices contain only yoji strings", async () => {
    const response = await GET();
    const data = await response.json();

    for (const choice of data.choices) {
      expect(typeof choice).toBe("string");
      expect(choice.length).toBeGreaterThan(0);
    }
  });

  test("correctAnswer is included in choices", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.choices).toContain(data.correctAnswer);
  });

  test("choices are all unique", async () => {
    const response = await GET();
    const data = await response.json();

    const uniqueChoices = new Set(data.choices);
    expect(uniqueChoices.size).toBe(4);
  });

  test("detail contains reading, origin fields", async () => {
    const response = await GET();
    const data = await response.json();

    // detail フィールドに正解の詳細情報が含まれる
    expect(data.detail).toBeDefined();
    expect(typeof data.detail.yoji).toBe("string");
    expect(typeof data.detail.reading).toBe("string");
    expect(typeof data.detail.meaning).toBe("string");
    expect(typeof data.detail.origin).toBe("string");
  });

  test("detail.yoji matches correctAnswer", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.detail.yoji).toBe(data.correctAnswer);
  });

  test("top-level does not expose reading or origin (only in detail)", async () => {
    const response = await GET();
    const data = await response.json();

    // reading/origin/example はトップレベルには存在しない（detailの中にある）
    expect(data.reading).toBeUndefined();
    expect(data.origin).toBeUndefined();
    expect(data.example).toBeUndefined();
  });

  test("returns different questions on repeated calls (probabilistic)", async () => {
    // 400語からランダムに出題するため、10回呼べばほぼ確実に異なる問題が返る
    const meanings = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const response = await GET();
      const data = await response.json();
      meanings.add(data.meaning);
    }
    // 10回中少なくとも2つは異なるはず
    expect(meanings.size).toBeGreaterThan(1);
  });
});
