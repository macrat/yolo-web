import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

/**
 * Footer のテストはこの 1 件のみ。
 *
 * Footer はロジックを持たず、ほとんど純粋な静的構造のため、通常のレンダ
 * リング検証は `.claude/rules/testing.md` の方針（純粋なスタイリングは
 * テストに含めない）から外している。
 *
 * このテストの唯一の目的は **constitution Rule 3「AI 運営の通知」が
 * コード変更で誤って削除・改変されないことの安全装置** にある。Footer の
 * AI 運営注記は来訪者への必須通知のため、リグレッション検出として残す。
 */
describe("Footer (constitution Rule 3 の安全装置)", () => {
  test("AI 運営の注記が描画される（誤って消されないこと）", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    // 内部固定の NOTE に「AI」と「不正確」が含まれることを保証
    expect(footer.textContent).toContain("AI");
    expect(footer.textContent).toContain("不正確");
  });
});
