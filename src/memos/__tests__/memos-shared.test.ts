import { describe, it, expect } from "vitest";
import { capitalize } from "@/memos/_lib/memos-shared";

describe("capitalize", () => {
  it("先頭文字を大文字にする", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("既に先頭が大文字の場合はそのまま返す", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("1文字の文字列を大文字にする", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("空文字列はそのまま返す", () => {
    expect(capitalize("")).toBe("");
  });

  it("数字で始まる文字列はそのまま返す", () => {
    expect(capitalize("123abc")).toBe("123abc");
  });

  it("ロール名のフォールバック表示に使える", () => {
    expect(capitalize("builder")).toBe("Builder");
    expect(capitalize("reviewer")).toBe("Reviewer");
    expect(capitalize("planner")).toBe("Planner");
  });
});
