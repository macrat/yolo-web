import { describe, it, expect } from "vitest";
import type { QuizMeta } from "../types";

describe("QuizMeta faq field", () => {
  it("accepts QuizMeta without faq field (optional)", () => {
    // faqフィールドがなくても型エラーにならないことを確認
    const meta: QuizMeta = {
      slug: "test-quiz",
      title: "テストクイズ",
      description: "テスト用のクイズです",
      shortDescription: "テスト",
      type: "knowledge",
      category: "knowledge",
      questionCount: 5,
      icon: "🧪",
      accentColor: "#000000",
      keywords: ["test"],
      publishedAt: "2026-01-01T00:00:00+09:00",
    };
    expect(meta.faq).toBeUndefined();
  });

  it("accepts QuizMeta with faq field", () => {
    // faqフィールドを持つQuizMetaが型エラーなく定義できることを確認
    const meta: QuizMeta = {
      slug: "test-quiz",
      title: "テストクイズ",
      description: "テスト用のクイズです",
      shortDescription: "テスト",
      type: "knowledge",
      category: "knowledge",
      questionCount: 5,
      icon: "🧪",
      accentColor: "#000000",
      keywords: ["test"],
      publishedAt: "2026-01-01T00:00:00+09:00",
      faq: [
        {
          question: "このクイズは何問ありますか？",
          answer: "5問あります。",
        },
        {
          question: "結果はどう決まりますか？",
          answer: "正解数に基づいて決まります。",
        },
      ],
    };
    expect(meta.faq).toHaveLength(2);
    expect(meta.faq![0].question).toBe("このクイズは何問ありますか？");
    expect(meta.faq![0].answer).toBe("5問あります。");
  });

  it("faq entries have question and answer string fields", () => {
    const faqEntry: NonNullable<QuizMeta["faq"]>[number] = {
      question: "テスト質問",
      answer: "テスト回答",
    };
    expect(typeof faqEntry.question).toBe("string");
    expect(typeof faqEntry.answer).toBe("string");
  });
});
