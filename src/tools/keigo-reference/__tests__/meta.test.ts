import { describe, test, expect } from "vitest";
import { meta } from "../meta";
import { KEIGO_ENTRIES } from "../logic";

describe("meta.howItWorks codegen", () => {
  test("howItWorks は KEIGO_ENTRIES.length の件数を含む（バッククォートで動的生成）", () => {
    const expectedCount = KEIGO_ENTRIES.length;
    // 「40件以上」などのハードコード文字列ではなく実際の件数が含まれること
    expect(meta.howItWorks).toContain(`${expectedCount}件`);
  });

  test("faq[0].answer も KEIGO_ENTRIES.length の件数を含む", () => {
    const expectedCount = KEIGO_ENTRIES.length;
    expect(meta.faq?.[0]?.answer).toContain(`${expectedCount}件`);
  });

  test("howItWorks に「40件以上」というハードコード文字列が含まれない", () => {
    // codegen 化後は「40件以上」という固定文字列は使わない
    expect(meta.howItWorks).not.toContain("40件以上");
  });

  test("howItWorks に含まれる件数は正規表現 /\\d+件/ にマッチする（堅牢化）", () => {
    // 数値 + 「件」という形式でなければ codegen が機能していない
    expect(meta.howItWorks).toMatch(/\d+件/);
  });

  test("faq[0].answer に含まれる件数も正規表現 /\\d+件/ にマッチする（堅牢化）", () => {
    expect(meta.faq?.[0]?.answer).toMatch(/\d+件/);
  });

  test("KEIGO_ENTRIES.length が 50 以上である（データ件数の最低保証）", () => {
    // logic.test.ts の「50件以上」チェックと同一の基準を meta 側でも確認
    expect(KEIGO_ENTRIES.length).toBeGreaterThanOrEqual(50);
  });
});
