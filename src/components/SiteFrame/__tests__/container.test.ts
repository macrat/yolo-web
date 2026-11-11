/**
 * コンテナの左右のボーダー（DESIGN.md §5 コンテナ）が上端から下端まで途切れずに通ることの検査。
 *
 * ボーダーは、フォーカスが入ったときに出るスキップのリンクの行・上端の .inner・中間の main・下端の .inner が、
 * 同じ幅・同じ位置で引き継いで引く。どれか1つでも幅か線が変わると、ボーダーがそこで折れたり切れたりするので、
 * 宣言が揃っていることを見る。middleware が返す 410 のページは、これらが1つの .container の規則を共有する。
 */
import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import postcss from "postcss";
import { build410Html } from "@/middleware";

const COMPONENTS_DIR = resolve(__dirname, "../..");

/** CSS の中で、セレクタが一致するルールの宣言を集める。 */
function declarationsIn(css: string, selector: string): Map<string, string> {
  const decls = new Map<string, string>();
  postcss.parse(css).walkRules((rule) => {
    if (rule.selector !== selector) return;
    rule.walkDecls((decl) => {
      decls.set(decl.prop, decl.value);
    });
  });
  return decls;
}

function declarationsOf(file: string, selector: string): Map<string, string> {
  return declarationsIn(
    readFileSync(resolve(COMPONENTS_DIR, file), "utf-8"),
    selector,
  );
}

/** 410 のページの <style> の中身。 */
const goneCss = build410Html().match(/<style>([\s\S]*)<\/style>/)![1];

describe("コンテナの左右のボーダーが上端から下端まで通る", () => {
  test.each([
    ["スキップのリンクの行", "SkipLink/SkipLink.module.css", ".row"],
    ["上端", "Header/Header.module.css", ".inner"],
    ["中間", "SiteFrame/SiteFrame.module.css", ".main"],
    ["下端", "Footer/Footer.module.css", ".inner"],
    ["410 のページ", null, ".container"],
  ])(
    "%s（%s の %s）がコンテナの幅・位置・ボーダー・内側の余白を持つ",
    (_part, file, selector) => {
      const decls = file
        ? declarationsOf(file, selector)
        : declarationsIn(goneCss, selector);
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
