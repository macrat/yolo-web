/**
 * traditional-color 専用結果ページのテスト。
 * generateStaticParams と detailedContent variant の動作を検証する。
 */

import { describe, it, expect } from "vitest";
import traditionalColorQuiz from "@/play/quiz/data/traditional-color";
import { getResultIdsForQuiz } from "@/play/quiz/registry";

const SLUG = "traditional-color";
const EXPECTED_TYPE_IDS = [
  "ai",
  "shu",
  "wakakusa",
  "fuji",
  "yamabuki",
  "kon",
  "sakura",
  "hisui",
];

describe("traditional-color 専用結果ページ: generateStaticParams", () => {
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
      const result = traditionalColorQuiz.results.find((r) => r.id === id);
      expect(result).toBeDefined();
    }
  });
});

describe("traditional-color 専用結果ページ: detailedContent の variant 確認", () => {
  it("全結果の detailedContent.variant が 'traditional-color'", () => {
    for (const result of traditionalColorQuiz.results) {
      expect(result.detailedContent).toBeDefined();
      expect(result.detailedContent?.variant).toBe("traditional-color");
    }
  });

  it("全結果に catchphrase が存在する", () => {
    for (const result of traditionalColorQuiz.results) {
      const dc = result.detailedContent;
      expect(dc).toBeDefined();
      if (dc && dc.variant === "traditional-color") {
        expect(dc.catchphrase).toBeTruthy();
        expect(typeof dc.catchphrase).toBe("string");
      }
    }
  });

  it("全結果に color が存在する（OGP画像用）", () => {
    for (const result of traditionalColorQuiz.results) {
      expect(result.color).toBeDefined();
      expect(typeof result.color).toBe("string");
      // HEXカラーコードのフォーマット検証
      expect(result.color).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    }
  });
});

describe("traditional-color クイズメタデータ", () => {
  it("accentColor が定義されている", () => {
    expect(traditionalColorQuiz.meta.accentColor).toBeTruthy();
    expect(typeof traditionalColorQuiz.meta.accentColor).toBe("string");
  });

  it("slug が 'traditional-color'", () => {
    expect(traditionalColorQuiz.meta.slug).toBe("traditional-color");
  });
});
