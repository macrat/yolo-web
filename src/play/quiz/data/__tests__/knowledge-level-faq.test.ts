import { describe, it, expect } from "vitest";
import kanjiLevelQuiz from "../kanji-level";
import kotowazaLevelQuiz from "../kotowaza-level";
import yojiLevelQuiz from "../yoji-level";

/**
 * knowledge型クイズ3個（漢字力・ことわざ力・四字熟語力）のFAQデータ検証
 * B-212: faqフィールド追加のテスト
 */
describe("knowledge level quizzes faq data", () => {
  describe("漢字力診断 (kanji-level)", () => {
    it("faqフィールドが存在する", () => {
      expect(kanjiLevelQuiz.meta.faq).toBeDefined();
    });

    it("faqが3問以上5問以下の質問を持つ", () => {
      const faq = kanjiLevelQuiz.meta.faq!;
      expect(faq.length).toBeGreaterThanOrEqual(3);
      expect(faq.length).toBeLessThanOrEqual(5);
    });

    it("各faqエントリがquestionとanswerの文字列を持つ", () => {
      const faq = kanjiLevelQuiz.meta.faq!;
      for (const entry of faq) {
        expect(typeof entry.question).toBe("string");
        expect(typeof entry.answer).toBe("string");
        expect(entry.question.length).toBeGreaterThan(0);
        expect(entry.answer.length).toBeGreaterThan(0);
      }
    });

    it("questionCountと矛盾しない内容が含まれる", () => {
      // 10問のクイズであることをFAQの内容が反映していることを確認
      const faq = kanjiLevelQuiz.meta.faq!;
      const allText = faq.map((e) => e.question + e.answer).join(" ");
      // 10問という情報がどこかに含まれていることを確認
      expect(allText).toContain("10");
    });
  });

  describe("ことわざ力診断 (kotowaza-level)", () => {
    it("faqフィールドが存在する", () => {
      expect(kotowazaLevelQuiz.meta.faq).toBeDefined();
    });

    it("faqが3問以上5問以下の質問を持つ", () => {
      const faq = kotowazaLevelQuiz.meta.faq!;
      expect(faq.length).toBeGreaterThanOrEqual(3);
      expect(faq.length).toBeLessThanOrEqual(5);
    });

    it("各faqエントリがquestionとanswerの文字列を持つ", () => {
      const faq = kotowazaLevelQuiz.meta.faq!;
      for (const entry of faq) {
        expect(typeof entry.question).toBe("string");
        expect(typeof entry.answer).toBe("string");
        expect(entry.question.length).toBeGreaterThan(0);
        expect(entry.answer.length).toBeGreaterThan(0);
      }
    });

    it("questionCountと矛盾しない内容が含まれる", () => {
      const faq = kotowazaLevelQuiz.meta.faq!;
      const allText = faq.map((e) => e.question + e.answer).join(" ");
      expect(allText).toContain("10");
    });
  });

  describe("四字熟語力診断 (yoji-level)", () => {
    it("faqフィールドが存在する", () => {
      expect(yojiLevelQuiz.meta.faq).toBeDefined();
    });

    it("faqが3問以上5問以下の質問を持つ", () => {
      const faq = yojiLevelQuiz.meta.faq!;
      expect(faq.length).toBeGreaterThanOrEqual(3);
      expect(faq.length).toBeLessThanOrEqual(5);
    });

    it("各faqエントリがquestionとanswerの文字列を持つ", () => {
      const faq = yojiLevelQuiz.meta.faq!;
      for (const entry of faq) {
        expect(typeof entry.question).toBe("string");
        expect(typeof entry.answer).toBe("string");
        expect(entry.question.length).toBeGreaterThan(0);
        expect(entry.answer.length).toBeGreaterThan(0);
      }
    });

    it("questionCountと矛盾しない内容が含まれる", () => {
      const faq = yojiLevelQuiz.meta.faq!;
      const allText = faq.map((e) => e.question + e.answer).join(" ");
      expect(allText).toContain("10");
    });
  });

  describe("3クイズ間でFAQの質問が重複していないこと", () => {
    it("漢字力とことわざ力でquestionが完全一致しない", () => {
      const kanjiQuestions = new Set(
        kanjiLevelQuiz.meta.faq!.map((e) => e.question),
      );
      const kotowazaQuestions = kotowazaLevelQuiz.meta.faq!.map(
        (e) => e.question,
      );
      for (const q of kotowazaQuestions) {
        expect(kanjiQuestions.has(q)).toBe(false);
      }
    });

    it("漢字力と四字熟語力でquestionが完全一致しない", () => {
      const kanjiQuestions = new Set(
        kanjiLevelQuiz.meta.faq!.map((e) => e.question),
      );
      const yojiQuestions = yojiLevelQuiz.meta.faq!.map((e) => e.question);
      for (const q of yojiQuestions) {
        expect(kanjiQuestions.has(q)).toBe(false);
      }
    });

    it("ことわざ力と四字熟語力でquestionが完全一致しない", () => {
      const kotowazaQuestions = new Set(
        kotowazaLevelQuiz.meta.faq!.map((e) => e.question),
      );
      const yojiQuestions = yojiLevelQuiz.meta.faq!.map((e) => e.question);
      for (const q of yojiQuestions) {
        expect(kotowazaQuestions.has(q)).toBe(false);
      }
    });
  });
});
