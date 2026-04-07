import { describe, test, expect } from "vitest";
import { meta } from "../meta";

describe("line-break-remover meta", () => {
  test("slugが正しい", () => {
    expect(meta.slug).toBe("line-break-remover");
  });

  test("必須フィールドが存在する", () => {
    expect(meta.name).toBeDefined();
    expect(meta.nameEn).toBeDefined();
    expect(meta.description).toBeDefined();
    expect(meta.shortDescription).toBeDefined();
    expect(meta.keywords).toBeDefined();
    expect(meta.category).toBeDefined();
    expect(meta.relatedSlugs).toBeDefined();
    expect(meta.publishedAt).toBeDefined();
    expect(meta.trustLevel).toBeDefined();
    expect(meta.howItWorks).toBeDefined();
  });

  test("descriptionが30文字以上160文字以下である", () => {
    const len = meta.description.length;
    expect(len).toBeGreaterThanOrEqual(30);
    expect(len).toBeLessThanOrEqual(160);
  });

  test("categoryが'text'である", () => {
    expect(meta.category).toBe("text");
  });

  test("keywordsに改行に関するキーワードが含まれる", () => {
    const hasLineBreakKeyword = meta.keywords.some(
      (k) => k.includes("改行") || k.includes("line"),
    );
    expect(hasLineBreakKeyword).toBe(true);
  });

  test("FAQが5問以上である", () => {
    expect(meta.faq).toBeDefined();
    expect(meta.faq!.length).toBeGreaterThanOrEqual(5);
  });

  test("FAQにPDFに関する質問が含まれる", () => {
    const hasPdfFaq = meta.faq!.some((f) => f.question.includes("PDF"));
    expect(hasPdfFaq).toBe(true);
  });

  test("publishedAtがISO 8601形式である", () => {
    expect(meta.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test("relatedSlugsが配列である", () => {
    expect(Array.isArray(meta.relatedSlugs)).toBe(true);
    expect(meta.relatedSlugs.length).toBeGreaterThan(0);
  });
});
