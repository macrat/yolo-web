import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";
import { ALL_CATEGORIES } from "@/blog/_lib/blog";

/**
 * Footer のテストは「機能・整合性の安全装置」のみ。
 * 純粋なスタイリングや DOM 構造のチェックは `.claude/rules/testing.md` の
 * 方針に従って書かない。
 */
describe("Footer", () => {
  test("AI 運営の注記が描画される（constitution Rule 3 の安全装置）", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    // 内部固定の NOTE に「AI」と「不正確」が含まれることを保証
    expect(footer.textContent).toContain("AI");
    expect(footer.textContent).toContain("不正確");
  });

  test("ブログカテゴリリンクの href が ALL_CATEGORIES と整合する（死リンク防止）", () => {
    // ブログカテゴリは src/blog/_lib/blog.ts の ALL_CATEGORIES を出典に
    // しているため、カテゴリ追加・削除時に Footer の死リンクを検知する。
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    const categoryAnchors = Array.from(
      footer.querySelectorAll('a[href^="/blog/category/"]'),
    );
    const hrefs = categoryAnchors.map((a) => a.getAttribute("href"));
    const expected = ALL_CATEGORIES.map((slug) => `/blog/category/${slug}`);
    // 順序は問わずセット一致を要求
    expect(hrefs.sort()).toEqual(expected.sort());
  });
});
