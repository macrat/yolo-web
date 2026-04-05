import { describe, test, expect } from "vitest";
import { generateQuestion, shuffleArray, type YojiQuizEntry } from "../quiz";

// Sample yoji data for testing（クイズ必要フィールドのみ）
const sampleData: YojiQuizEntry[] = [
  {
    yoji: "一期一会",
    reading: "いちごいちえ",
    meaning: "一生に一度の出会いを大切にすること",
    category: "life",
    origin: "日本",
    example: "例文",
  },
  {
    yoji: "一日一善",
    reading: "いちにちいちぜん",
    meaning: "毎日一つの善行をすること",
    category: "life",
    origin: "日本",
    example: "例文",
  },
  {
    yoji: "花鳥風月",
    reading: "かちょうふうげつ",
    meaning: "自然の美しい景色や風物のこと",
    category: "nature",
    origin: "中国",
    example: "例文",
  },
  {
    yoji: "以心伝心",
    reading: "いしんでんしん",
    meaning: "言葉を使わずに心が通じ合うこと",
    category: "life",
    origin: "仏教",
    example: "例文",
  },
  {
    yoji: "喜怒哀楽",
    reading: "きどあいらく",
    meaning: "人間の基本的な感情のこと",
    category: "emotion",
    origin: "中国",
    example: "例文",
  },
];

describe("shuffleArray", () => {
  test("returns array with same length", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled).toHaveLength(arr.length);
  });

  test("returns array with same elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  test("does not mutate original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(original);
  });
});

describe("generateQuestion", () => {
  test("returns a question with correct structure", () => {
    const question = generateQuestion(sampleData);
    expect(question).toHaveProperty("meaning");
    expect(question).toHaveProperty("correctAnswer");
    expect(question).toHaveProperty("choices");
    expect(question).toHaveProperty("detail");
  });

  test("choices have exactly 4 options", () => {
    const question = generateQuestion(sampleData);
    expect(question.choices).toHaveLength(4);
  });

  test("correct answer is included in choices", () => {
    const question = generateQuestion(sampleData);
    const choiceYojis = question.choices.map((c) => c.yoji);
    expect(choiceYojis).toContain(question.correctAnswer.yoji);
  });

  test("choices are all unique", () => {
    const question = generateQuestion(sampleData);
    const choiceYojis = question.choices.map((c) => c.yoji);
    const uniqueYojis = new Set(choiceYojis);
    expect(uniqueYojis.size).toBe(4);
  });

  test("question meaning matches correct answer meaning", () => {
    const question = generateQuestion(sampleData);
    expect(question.meaning).toBe(question.correctAnswer.meaning);
  });

  test("detail contains correct yoji info", () => {
    const question = generateQuestion(sampleData);
    expect(question.detail.yoji).toBe(question.correctAnswer.yoji);
    expect(question.detail.reading).toBe(question.correctAnswer.reading);
    expect(question.detail.meaning).toBe(question.correctAnswer.meaning);
  });

  test("works with minimum viable data (4 entries)", () => {
    const minData = sampleData.slice(0, 4);
    const question = generateQuestion(minData);
    expect(question.choices).toHaveLength(4);
    const choiceYojis = question.choices.map((c) => c.yoji);
    expect(choiceYojis).toContain(question.correctAnswer.yoji);
  });

  test("throws if data has fewer than 4 entries", () => {
    const tooSmall = sampleData.slice(0, 3);
    expect(() => generateQuestion(tooSmall)).toThrow();
  });
});
