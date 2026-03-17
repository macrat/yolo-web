import { describe, test, expect } from "vitest";
import { getContrastTextColor } from "../color-utils";

describe("getContrastTextColor", () => {
  // 暗い色 — 白文字のコントラスト比が4.5:1以上になるはずの色
  test("暗い紺色(#003366)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#003366")).toBe("#ffffff");
  });

  test("黒(#000000)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#000000")).toBe("#ffffff");
  });

  test("濃い赤(#8b0000)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#8b0000")).toBe("#ffffff");
  });

  test("濃い緑(#006400)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#006400")).toBe("#ffffff");
  });

  // 明るい色 — 白文字のコントラスト比が4.5:1未満になるはずの色
  test("白(#ffffff)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#ffffff")).toBe("#1a1a1a");
  });

  test("明るい黄色(#ffff00)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#ffff00")).toBe("#1a1a1a");
  });

  test("明るいシアン(#00ffff)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#00ffff")).toBe("#1a1a1a");
  });

  test("明るい緑(#00cc44)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#00cc44")).toBe("#1a1a1a");
  });

  // 境界値付近のテスト
  test("中間グレー(#767676)に対して白(#ffffff)を返す（コントラスト比ちょうど4.5:1近辺）", () => {
    // #767676 は白文字とのコントラスト比が約4.54:1 で4.5:1以上のため、白を返す
    expect(getContrastTextColor("#767676")).toBe("#ffffff");
  });

  test("やや暗いグレー(#595959)に対して白(#ffffff)を返す", () => {
    // #595959 は白とのコントラスト比が約7:1
    expect(getContrastTextColor("#595959")).toBe("#ffffff");
  });

  // accentColorとして実際に使われる色のテスト
  test("占い系の紫系色(#6c5ce7)に対して白(#ffffff)を返す", () => {
    expect(getContrastTextColor("#6c5ce7")).toBe("#ffffff");
  });

  test("明るいオレンジ(#fdcb6e)に対して暗いテキスト色(#1a1a1a)を返す", () => {
    expect(getContrastTextColor("#fdcb6e")).toBe("#1a1a1a");
  });
});
