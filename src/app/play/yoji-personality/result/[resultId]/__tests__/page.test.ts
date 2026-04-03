/**
 * yoji-personality 専用結果ページのテスト。
 * generateStaticParams と detailedContent variant の動作を検証する。
 */

import { describe, it, expect } from "vitest";
import yojiPersonalityQuiz from "@/play/quiz/data/yoji-personality";
import { getResultIdsForQuiz } from "@/play/quiz/registry";

const SLUG = "yoji-personality";
const EXPECTED_TYPE_IDS = [
  "shoshikantetsu",
  "tenshinranman",
  "sessatakuma",
  "ichigoichie",
  "rinkiohen",
  "meikyoshisui",
  "ishindenshin",
  "yuoumaishin",
];

describe("yoji-personality 専用結果ページ: generateStaticParams", () => {
  it("全8タイプのIDを返す", () => {
    const ids = getResultIdsForQuiz(SLUG);
    expect(ids).toHaveLength(8);
    for (const id of EXPECTED_TYPE_IDS) {
      expect(ids).toContain(id);
    }
  });

  it("各IDに対応するresultが存在する", () => {
    const ids = getResultIdsForQuiz(SLUG);
    for (const id of ids) {
      const result = yojiPersonalityQuiz.results.find((r) => r.id === id);
      expect(result).toBeDefined();
    }
  });
});

describe("yoji-personality 専用結果ページ: detailedContent の variant 確認", () => {
  it("全結果の detailedContent.variant が 'yoji-personality'", () => {
    for (const result of yojiPersonalityQuiz.results) {
      expect(result.detailedContent).toBeDefined();
      expect(result.detailedContent?.variant).toBe("yoji-personality");
    }
  });

  it("全結果に catchphrase が存在する", () => {
    for (const result of yojiPersonalityQuiz.results) {
      const dc = result.detailedContent;
      expect(dc).toBeDefined();
      if (dc && dc.variant === "yoji-personality") {
        expect(dc.catchphrase).toBeTruthy();
        expect(typeof dc.catchphrase).toBe("string");
      }
    }
  });

  it("全結果に color が存在する（OGP画像用）", () => {
    for (const result of yojiPersonalityQuiz.results) {
      expect(result.color).toBeDefined();
      expect(typeof result.color).toBe("string");
      // HEXカラーコードのフォーマット検証
      expect(result.color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    }
  });
});

describe("yoji-personality クイズメタデータ", () => {
  it("accentColor が定義されている", () => {
    expect(yojiPersonalityQuiz.meta.accentColor).toBeTruthy();
    expect(typeof yojiPersonalityQuiz.meta.accentColor).toBe("string");
  });

  it("slug が 'yoji-personality'", () => {
    expect(yojiPersonalityQuiz.meta.slug).toBe("yoji-personality");
  });
});
