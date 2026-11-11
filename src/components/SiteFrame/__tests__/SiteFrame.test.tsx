/**
 * SiteFrame のテスト。スキップのリンク・上端・中間・下端の並びと、スキップ先の main を見る。
 */
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SiteFrame from "..";
import { AI_NOTICE, MAIN_CONTENT_ID } from "@/lib/site-frame";

vi.mock("next/navigation", () => ({
  usePathname: () => "/tools",
}));

describe("SiteFrame", () => {
  test("最初にフォーカスが入るのはスキップのリンクで、上端より前にある（WCAG 2.4.1）", () => {
    const { container } = render(
      <SiteFrame>
        <p>本文</p>
      </SiteFrame>,
    );
    const firstLink = container.querySelector("a");
    expect(firstLink).toHaveTextContent("メインコンテンツへスキップ");
    expect(firstLink).toHaveAttribute("href", `#${MAIN_CONTENT_ID}`);
    const banner = screen.getByRole("banner");
    expect(
      firstLink!.compareDocumentPosition(banner) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("中間の main はスキップ先の id を持ち、フォーカスを受けられる", () => {
    render(
      <SiteFrame>
        <p>本文</p>
      </SiteFrame>,
    );
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", MAIN_CONTENT_ID);
    expect(main).toHaveAttribute("tabindex", "-1");
    expect(main).toHaveTextContent("本文");
  });

  test("下端に AI 運営の告知を出す（constitution 規則3）", () => {
    render(
      <SiteFrame>
        <p>本文</p>
      </SiteFrame>,
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent(AI_NOTICE);
  });
});
