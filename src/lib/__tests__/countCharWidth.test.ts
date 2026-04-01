import { describe, it, expect } from "vitest";
import { countCharWidth } from "../countCharWidth";

describe("countCharWidth", () => {
  it("半角のみの文字列の幅を正しく計算する", () => {
    expect(countCharWidth("abc")).toBe(3);
  });

  it("全角のみの文字列の幅を正しく計算する", () => {
    expect(countCharWidth("あいう")).toBe(6);
  });

  it("半角と全角が混在する文字列の幅を正しく計算する", () => {
    expect(countCharWidth("abc漢字")).toBe(7);
  });

  it("空文字列は0を返す", () => {
    expect(countCharWidth("")).toBe(0);
  });
});
