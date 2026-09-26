import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TableOfContents from "@/blog/_components/TableOfContents";

const mockHeadings = [
  { level: 2, text: "はじめに", id: "intro" },
  { level: 3, text: "背景", id: "background" },
  { level: 2, text: "まとめ", id: "conclusion" },
];

describe("TableOfContents", () => {
  test("renders 'h2' with text '目次'", () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(screen.getByRole("heading", { name: "目次" })).toBeInTheDocument();
  });

  test("renders all heading links", () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(screen.getByRole("link", { name: "はじめに" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "背景" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "まとめ" })).toBeInTheDocument();
  });

  test("each link href points to the heading id", () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(screen.getByRole("link", { name: "はじめに" })).toHaveAttribute(
      "href",
      "#intro",
    );
    expect(screen.getByRole("link", { name: "背景" })).toHaveAttribute(
      "href",
      "#background",
    );
  });

  test("returns null when headings array is empty", () => {
    const { container } = render(<TableOfContents headings={[]} />);
    expect(container.innerHTML).toBe("");
  });

  test("nav has aria-label 'Table of contents'", () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(
      screen.getByRole("navigation", { name: "Table of contents" }),
    ).toBeInTheDocument();
  });

  test(".toc セレクタに background / border / border-radius / padding が含まれない（枠と余白は外側の CollapsibleTOC が持つ）", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(__dirname, "../TableOfContents.module.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    // .toc ブロックのみを抽出してチェック
    const tocBlockMatch = css.match(/\.toc\s*\{([^}]*)\}/);
    const tocBlock = tocBlockMatch ? tocBlockMatch[1] : "";

    // 目次を包む CollapsibleTOC（tocDetails）が枠と余白を持ち、目次の中で二重に持たない
    expect(tocBlock).not.toMatch(/background(-color)?:/);
    expect(tocBlock).not.toMatch(/\bborder\b\s*:/);
    expect(tocBlock).not.toMatch(/border-radius:/);
    expect(tocBlock).not.toMatch(/\bpadding\b\s*:/);
  });
});
