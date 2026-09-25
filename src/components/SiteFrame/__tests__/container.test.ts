/**
 * コンテナの左右のボーダー（DESIGN.md §5 コンテナ）が上端から下端まで途切れずに通ることの検査。
 *
 * ボーダーは上端の .inner・中間の main・下端の .inner の3つが、同じ幅・同じ位置で引き継いで引く。
 * どれか1つでも幅か線が変わると、ボーダーがそこで折れたり切れたりするので、3つの宣言が揃っていることを見る。
 */
import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import postcss from "postcss";

const COMPONENTS_DIR = resolve(__dirname, "../..");

/** ファイルの中で、セレクタが一致するルールの宣言を集める。 */
function declarationsOf(file: string, selector: string): Map<string, string> {
  const css = readFileSync(resolve(COMPONENTS_DIR, file), "utf-8");
  const decls = new Map<string, string>();
  postcss.parse(css).walkRules((rule) => {
    if (rule.selector !== selector) return;
    rule.walkDecls((decl) => {
      decls.set(decl.prop, decl.value);
    });
  });
  return decls;
}

describe("コンテナの左右のボーダーが上端から下端まで通る", () => {
  test.each([
    ["上端", "Header/Header.module.css", ".inner"],
    ["中間", "SiteFrame/SiteFrame.module.css", ".main"],
    ["下端", "Footer/Footer.module.css", ".inner"],
  ])(
    "%s（%s の %s）がコンテナの幅・位置・ボーダー・内側の余白を持つ",
    (_part, file, selector) => {
      const decls = declarationsOf(file, selector);
      expect(decls.get("width")).toBe("var(--container-width)");
      expect(decls.get("margin-inline")).toBe("auto");
      expect(decls.get("border-inline")).toBe(
        "var(--rule-w) solid var(--rule)",
      );
      const padding = decls.get("padding-inline") ?? decls.get("padding");
      expect(padding).toMatch(/var\(--box-padding\)$/);
    },
  );
});
