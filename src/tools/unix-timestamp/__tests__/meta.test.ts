/**
 * meta.ts FAQ整合性テスト (G-4: FAQ と実 UI 整合)
 *
 * 実UIはSegmentedControlによる秒/ミリ秒の選択であり、
 * FAQ回答文がチェックボックスなどの誤った操作表記を含まないことを保証する。
 */
import { describe, test, expect } from "vitest";
import { meta } from "../meta";

describe("G-4: FAQ と実UI整合", () => {
  test("FAQ Q1の回答に『チェックボックス』という表記が含まれないこと", () => {
    expect(meta.faq).toBeDefined();
    const q1 = meta.faq!.find((f) =>
      f.question.includes("秒とミリ秒のどちらで入力すればよい"),
    );
    expect(q1).toBeDefined();
    // チェックボックスという表記はNG（実UIはSegmentedControl）
    expect(q1!.answer).not.toContain("チェックボックス");
  });

  test("FAQ Q1の回答に『ミリ秒』を選ぶ操作の説明が含まれること", () => {
    expect(meta.faq).toBeDefined();
    const q1 = meta.faq!.find((f) =>
      f.question.includes("秒とミリ秒のどちらで入力すればよい"),
    );
    expect(q1).toBeDefined();
    // ミリ秒の選び方の説明が含まれること
    expect(q1!.answer).toContain("ミリ秒");
  });

  test("FAQ全体にチェックボックスという表記が含まれないこと", () => {
    expect(meta.faq).toBeDefined();
    for (const faqItem of meta.faq!) {
      expect(faqItem.answer).not.toContain("チェックボックス");
    }
  });
});
