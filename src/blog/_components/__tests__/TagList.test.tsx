import * as fs from "fs";
import * as path from "path";
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

describe("TagList.module.css — 新デザイントークン確認", () => {
  test("旧トークン（--color-*）が TagList.module.css に残っていないこと", () => {
    const cssPath = path.resolve(__dirname, "../TagList.module.css");
    const css = fs.readFileSync(cssPath, "utf-8");
    // legacy トークンが残っていないことを確認
    expect(css).not.toContain("var(--color-");
  });

  test("新トークン（--bg-soft / --fg-soft / --accent 等）が使われていること", () => {
    const cssPath = path.resolve(__dirname, "../TagList.module.css");
    const css = fs.readFileSync(cssPath, "utf-8");
    // 新デザイントークンが使われていること（背景・文字色・ホバー色）
    expect(css).toMatch(/var\(--(bg|fg|accent|border)/);
  });
});

describe("TagList linkableTags フィルタ", () => {
  test("linkableTags 未指定のときはすべてのタグが表示される", () => {
    render(<TagList tags={["Next.js", "YAML"]} />);
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("YAML")).toBeInTheDocument();
  });

  test("linkableTags 指定時、含まれるタグは表示される", () => {
    render(
      <TagList
        tags={["Next.js", "YAML"]}
        linkableTags={new Set(["Next.js"])}
      />,
    );
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });

  test("linkableTags 指定時、含まれないタグは DOM に出ない（要素ごと描画されない）", () => {
    render(
      <TagList
        tags={["Next.js", "YAML"]}
        linkableTags={new Set(["Next.js"])}
      />,
    );
    // YAML は linkableTags に含まれないため DOM に出てはいけない
    expect(screen.queryByText("YAML")).not.toBeInTheDocument();
  });

  test("linkableTags が空集合のときはタグリストが全表示されない（null 相当）", () => {
    const { container } = render(
      <TagList tags={["Next.js", "YAML"]} linkableTags={new Set<string>()} />,
    );
    // すべてのタグが linkableTags にないため null を返す
    expect(container.innerHTML).toBe("");
  });

  test("linkableTags 指定時、すべてのタグが含まれる場合は全タグが表示される", () => {
    render(
      <TagList
        tags={["Next.js", "YAML"]}
        linkableTags={new Set(["Next.js", "YAML"])}
      />,
    );
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("YAML")).toBeInTheDocument();
  });
});
