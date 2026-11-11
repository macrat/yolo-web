/**
 * Accuracy tests for yoji-personality data:
 *
 * - rinkiohen の origin に正しい人名「蕭淵明伝」が使われていること
 *   （「蕭穎達伝」ではない）
 *
 * - FAQ テキストにフィールド名（kanjiBreakdown / origin）が露出していないこと
 *
 * - catchphrase の句点統一
 *   全8タイプの catchphrase が句点（。）で終わること
 */
import { describe, it, expect } from "vitest";
import type { YojiPersonalityDetailedContent } from "../../types";
import yojiPersonalityQuiz from "../yoji-personality";

const allResults = yojiPersonalityQuiz.results;
const rinkiohen = allResults.find((r) => r.id === "rinkiohen")!;

describe("rinkiohen origin の人名正確性", () => {
  it("origin に「蕭淵明伝」が含まれていること", () => {
    const { origin } =
      rinkiohen.detailedContent as YojiPersonalityDetailedContent;
    expect(origin).toContain("蕭淵明伝");
  });

  it("origin に誤った「蕭穎達伝」が含まれていないこと", () => {
    const { origin } =
      rinkiohen.detailedContent as YojiPersonalityDetailedContent;
    expect(origin).not.toContain("蕭穎達伝");
  });
});

describe("FAQ テキストにフィールド名が露出していないこと", () => {
  it("FAQ の answer に「kanjiBreakdown」が含まれていないこと", () => {
    for (const faq of yojiPersonalityQuiz.meta.faq ?? []) {
      expect(faq.answer).not.toContain("kanjiBreakdown");
    }
  });

  it("FAQ の answer に「origin」が含まれていないこと（英字）", () => {
    for (const faq of yojiPersonalityQuiz.meta.faq ?? []) {
      expect(faq.answer).not.toMatch(/\(origin\)/);
      expect(faq.answer).not.toMatch(/（origin）/);
    }
  });
});

describe("catchphrase の句点統一", () => {
  const ALL_IDS = [
    "shoshikantetsu",
    "tenshinranman",
    "sessatakuma",
    "ichigoichie",
    "rinkiohen",
    "meikyoshisui",
    "ishindenshin",
    "yuoumaishin",
  ] as const;

  for (const id of ALL_IDS) {
    it(`${id} の catchphrase が句点（。）で終わること`, () => {
      const result = allResults.find((r) => r.id === id)!;
      const { catchphrase } =
        result.detailedContent as YojiPersonalityDetailedContent;
      expect(catchphrase.endsWith("。"), `catchphrase: "${catchphrase}"`).toBe(
        true,
      );
    });
  }
});
