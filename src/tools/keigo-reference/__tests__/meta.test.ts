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
});
