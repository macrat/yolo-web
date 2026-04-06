import { describe, test, expect } from "vitest";
import { meta } from "../meta";

describe("fullwidth-converter meta", () => {
  test("descriptionが120文字以上160文字以下である", () => {
    const len = meta.description.length;
    expect(len).toBeGreaterThanOrEqual(120);
    expect(len).toBeLessThanOrEqual(160);
  });

  test("descriptionに具体的な使用場面が含まれる（ExcelまたはCSV）", () => {
    expect(meta.description).toMatch(/Excel|CSV/);
  });

  test("descriptionに信頼性訴求が含まれる（データ送信なし等）", () => {
    expect(meta.description).toMatch(/データ送信なし|ブラウザ上|プライバシー/);
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
