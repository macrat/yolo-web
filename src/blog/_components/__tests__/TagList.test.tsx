import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TagList from "@/blog/_components/TagList";

// next/link のモック（jsdom 環境でも href 属性が機能するよう <a> に変換）
vi.mock("next/link", () => ({
  default: ({
    href,
    className,
    children,
  }: {
    href: string;
    className?: string;
    children: React.ReactNode;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

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

describe("TagList linkableTags（リンク可否制御）", () => {
  test("linkableTags 未指定時はすべてのタグが <a> リンクになること", () => {
    render(<TagList tags={["Next.js", "TypeScript"]} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(
      screen.queryByRole("generic", { name: /Next\.js|TypeScript/ }),
    ).toBeNull();
  });

  test("linkableTags に含まれるタグは <a> リンクとして表示されること", () => {
    const linkableTags = new Set(["Next.js"]);
    render(<TagList tags={["Next.js", "YAML"]} linkableTags={linkableTags} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/blog/tag/Next.js");
    expect(link).toHaveTextContent("Next.js");
  });

  test("linkableTags に含まれないタグは <a> リンクにならないこと", () => {
    const linkableTags = new Set(["Next.js"]);
    render(<TagList tags={["Next.js", "YAML"]} linkableTags={linkableTags} />);
    // YAML はリンクではない（<a> 要素は Next.js の 1 つだけ）
    expect(screen.getAllByRole("link")).toHaveLength(1);
    // YAML のテキストは表示される
    expect(screen.getByText("YAML")).toBeInTheDocument();
  });

  test("linkableTags に含まれないタグは aria-disabled が設定された <span> であること", () => {
    const linkableTags = new Set(["Next.js"]);
    render(<TagList tags={["Next.js", "YAML"]} linkableTags={linkableTags} />);
    const yamlSpan = screen.getByText("YAML").closest("span");
    expect(yamlSpan).not.toBeNull();
    expect(yamlSpan).toHaveAttribute("aria-disabled", "true");
  });

  test("linkableTags が空 Set の場合はすべてのタグが <span> 表示になること", () => {
    const linkableTags = new Set<string>();
    render(
      <TagList tags={["Next.js", "TypeScript"]} linkableTags={linkableTags} />,
    );
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });
});
