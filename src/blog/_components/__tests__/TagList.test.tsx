import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TagList from "@/blog/_components/TagList";

describe("TagList", () => {
  test("タグが空の場合はnullをレンダリングすること", () => {
    const { container } = render(<TagList tags={[]} />);
    expect(container.innerHTML).toBe("");
  });

  test("各タグがリンクとしてレンダリングされること", () => {
    render(<TagList tags={["Next.js", "TypeScript"]} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });

  test("各タグリンクが正しいhrefを持つこと", () => {
    render(<TagList tags={["Next.js", "TypeScript"]} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("/blog/tag/Next.js");
    expect(hrefs).toContain("/blog/tag/TypeScript");
  });

  test("日本語タグのリンクが正しいhrefを持つこと", () => {
    render(<TagList tags={["設計パターン"]} />);
    const link = screen.getByRole("link");
    // タグ名はURL上エンコードされるが、Next.js Linkはhrefにそのまま設定する
    expect(link.getAttribute("href")).toBe("/blog/tag/設計パターン");
  });

  test("タグテキストが表示されること", () => {
    render(<TagList tags={["SEO", "AIエージェント"]} />);
    expect(screen.getByText("SEO")).toBeInTheDocument();
    expect(screen.getByText("AIエージェント")).toBeInTheDocument();
  });

  test("ariaラベルが日本語で設定されていること", () => {
    render(<TagList tags={["Next.js"]} />);
    expect(screen.getByRole("list", { name: "タグ" })).toBeInTheDocument();
  });
});
