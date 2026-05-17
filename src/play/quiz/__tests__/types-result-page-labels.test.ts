import { describe, it, expect } from "vitest";
import type { QuizMeta } from "../types";

/**
 * Tests for resultPageLabels field in QuizMeta.
 * This field allows each quiz to customize the section headings
 * on the result page.
 */
describe("QuizMeta resultPageLabels field", () => {
  it("accepts QuizMeta without resultPageLabels field (optional)", () => {
    const meta: QuizMeta = {
      slug: "test-quiz",
      title: "テストクイズ",
      description: "テスト用のクイズです",
      shortDescription: "テスト",
      type: "personality",
      category: "personality",
      questionCount: 5,
      icon: "🧪",
      accentColor: "#000000",
      keywords: ["test"],
      publishedAt: "2026-01-01T00:00:00+09:00",
      trustLevel: "generated",
    };
    expect(meta.resultPageLabels).toBeUndefined();
  });

  it("accepts QuizMeta with full resultPageLabels", () => {
    const meta: QuizMeta = {
      slug: "test-quiz",
      title: "テストクイズ",
      description: "テスト用のクイズです",
      shortDescription: "テスト",
      type: "personality",
      category: "personality",
      questionCount: 5,
      icon: "🧪",
      accentColor: "#000000",
      keywords: ["test"],
      publishedAt: "2026-01-01T00:00:00+09:00",
      trustLevel: "generated",
      resultPageLabels: {
        traitsHeading: "このタイプの音楽的特徴",
        behaviorsHeading: "このタイプの音楽あるある",
        adviceHeading: "このタイプへのメッセージ",
      },
    };
    expect(meta.resultPageLabels).toBeDefined();
    expect(meta.resultPageLabels!.traitsHeading).toBe("このタイプの音楽的特徴");
    expect(meta.resultPageLabels!.behaviorsHeading).toBe(
      "このタイプの音楽あるある",
    );
    expect(meta.resultPageLabels!.adviceHeading).toBe(
      "このタイプへのメッセージ",
    );
  });

  it("accepts QuizMeta with partial resultPageLabels (all fields optional)", () => {
    const meta: QuizMeta = {
      slug: "test-quiz",
      title: "テストクイズ",
      description: "テスト用のクイズです",
      shortDescription: "テスト",
      type: "personality",
      category: "personality",
      questionCount: 5,
      icon: "🧪",
      accentColor: "#000000",
      keywords: ["test"],
      publishedAt: "2026-01-01T00:00:00+09:00",
      trustLevel: "generated",
      resultPageLabels: {
        traitsHeading: "このタイプの特徴",
        // behaviorsHeading と adviceHeading は省略可能
      },
    };
    expect(meta.resultPageLabels!.traitsHeading).toBe("このタイプの特徴");
    expect(meta.resultPageLabels!.behaviorsHeading).toBeUndefined();
    expect(meta.resultPageLabels!.adviceHeading).toBeUndefined();
  });

  it("resultPageLabels fields are string type", () => {
    const labels: NonNullable<QuizMeta["resultPageLabels"]> = {
      traitsHeading: "特徴",
      behaviorsHeading: "あるある",
      adviceHeading: "アドバイス",
    };
    expect(typeof labels.traitsHeading).toBe("string");
    expect(typeof labels.behaviorsHeading).toBe("string");
    expect(typeof labels.adviceHeading).toBe("string");
  });
});
