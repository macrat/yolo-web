/**
 * モバイル向けインラインTOC（details/summary 要素）の統合テスト
 *
 * page.tsx はサーバーコンポーネントのため直接テストできないが、
 * details > summary + TableOfContents という組み合わせが
 * 期待通りレンダリングされることをここで検証する。
 */
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TableOfContents from "@/blog/_components/TableOfContents";

const mockHeadings = [
  { level: 2, text: "はじめに", id: "intro" },
  { level: 2, text: "まとめ", id: "conclusion" },
];

/** page.tsx で追加するインラインTOCブロックを模したコンポーネント */
function MobileTocBlock({
  headings,
}: {
  headings: { level: number; text: string; id: string }[];
}) {
  if (headings.length === 0) return null;
  return (
    <details data-testid="mobile-toc">
      <summary>目次</summary>
      <TableOfContents headings={headings} />
    </details>
  );
}

describe("MobileTocBlock (inline TOC for mobile)", () => {
  test("renders details element with data-testid 'mobile-toc'", () => {
    render(<MobileTocBlock headings={mockHeadings} />);
    expect(screen.getByTestId("mobile-toc")).toBeInTheDocument();
  });

  test("renders summary with text '目次'", () => {
    render(<MobileTocBlock headings={mockHeadings} />);
    // summary 要素のテキストが「目次」であること
    const summary = screen.getByText("目次", { selector: "summary" });
    expect(summary).toBeInTheDocument();
  });

  test("renders TableOfContents inside the details element", () => {
    render(<MobileTocBlock headings={mockHeadings} />);
    const details = screen.getByTestId("mobile-toc");
    // nav[aria-label] が details 内に存在すること
    const nav = details.querySelector("nav[aria-label='Table of contents']");
    expect(nav).not.toBeNull();
  });

  test("heading links are accessible inside mobile TOC", () => {
    render(<MobileTocBlock headings={mockHeadings} />);
    expect(screen.getByRole("link", { name: "はじめに" })).toHaveAttribute(
      "href",
      "#intro",
    );
    expect(screen.getByRole("link", { name: "まとめ" })).toHaveAttribute(
      "href",
      "#conclusion",
    );
  });

  test("returns null when headings array is empty", () => {
    const { container } = render(<MobileTocBlock headings={[]} />);
    expect(container.innerHTML).toBe("");
  });
});
