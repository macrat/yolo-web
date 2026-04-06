import { describe, test, expect } from "vitest";
import { meta } from "../meta";

describe("fullwidth-converter meta", () => {
  test("descriptionが30文字以上80文字以下である", () => {
    const len = meta.description.length;
    expect(len).toBeGreaterThanOrEqual(30);
    expect(len).toBeLessThanOrEqual(80);
  });

  test("keywordsに「オンライン」が含まれる", () => {
    expect(meta.keywords).toContain("オンライン");
  });

  test("keywordsに「無料」が含まれる", () => {
    expect(meta.keywords).toContain("無料");
  });

  test("FAQが5問以上である", () => {
    expect(meta.faq).toBeDefined();
    expect(meta.faq!.length).toBeGreaterThanOrEqual(5);
  });

  test("FAQにExcel/CSVに関する質問が含まれる", () => {
    const hasExcelFaq = meta.faq!.some(
      (f) => f.question.includes("Excel") || f.question.includes("CSV"),
    );
    expect(hasExcelFaq).toBe(true);
  });

  test("FAQに大量テキストに関する質問が含まれる", () => {
    const hasBulkFaq = meta.faq!.some(
      (f) => f.question.includes("大量") || f.question.includes("量"),
    );
    expect(hasBulkFaq).toBe(true);
  });
});
