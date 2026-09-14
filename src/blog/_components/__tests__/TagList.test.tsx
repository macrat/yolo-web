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
    expect(link.getAttribute("href")).toBe(
      `/blog/tag/${encodeURIComponent("設計パターン")}`,
    );
  });

  test("URL で意味を持つ文字を含むタグでも、リンク先がそのタグのページを指す", () => {
    const tags = ["C#", "CI/CD", "Claude Code"];
    render(<TagList tags={tags} />);
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href") ?? "");

    // 各 href はタグページのパスで、末尾のセグメントを戻すと元のタグ名になる
    const prefix = "/blog/tag/";
    expect(hrefs.every((href) => href.startsWith(prefix))).toBe(true);
    expect(
      hrefs.map((href) => decodeURIComponent(href.slice(prefix.length))),
    ).toEqual(tags);

    // 生の空白・# ・/ は別の URL（リンク切れ・フラグメント・別ルート）になる
    hrefs.forEach((href) => {
      expect(href.slice(prefix.length)).not.toMatch(/[ #?/]/);
    });
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

  test("className を渡すと根 ul に付与される（既存クラスと併存）", () => {
    // BlogList が stretched-link より前面へタグのリンクを立たせるためのクラスを渡す用途。
    render(<TagList tags={["Next.js"]} className="custom-class" />);
    const ul = screen.getByRole("list", { name: "タグ" });
    expect(ul).toHaveClass("custom-class");
    // 既存の styles.tags クラスも保持されていること（"tags undefined" のような破損もない）
    expect(ul.className).not.toContain("undefined");
    expect(ul.className.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
  });

  test("className 未指定時は根 ul に追加クラスが付かない", () => {
    render(<TagList tags={["Next.js"]} />);
    const ul = screen.getByRole("list", { name: "タグ" });
    // 単一クラス（styles.tags）のみ・"undefined" 文字列の混入もないこと
    expect(ul.className).not.toContain("undefined");
    expect(ul.className.trim().split(/\s+/).length).toBe(1);
  });

  test("記事のタグは並び順のまま全件リンクとして描画される", () => {
    render(
      <TagList tags={["YAML", "DevOps", "設定ファイル", "Next.js", "運用"]} />,
    );
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "YAML",
      "DevOps",
      "設定ファイル",
      "Next.js",
      "運用",
    ]);
  });
});

describe("TagList.module.css — 新デザイントークン確認（DESIGN.md フェーズ R）", () => {
  test("旧トークン（--color-* / --fg / --bg / --border / --r-*）が残っていないこと", () => {
    const cssPath = path.resolve(__dirname, "../TagList.module.css");
    const css = fs.readFileSync(cssPath, "utf-8");
    expect(css).not.toContain("var(--color-");
    expect(css).not.toMatch(/var\(--fg\b/);
    expect(css).not.toMatch(/var\(--bg\b/);
    expect(css).not.toMatch(/var\(--border\b/);
    expect(css).not.toMatch(/var\(--r-(normal|interactive)\)/);
  });

  test("新トークン（--ink-2 / --rule / --accent 等）が使われていること", () => {
    const cssPath = path.resolve(__dirname, "../TagList.module.css");
    const css = fs.readFileSync(cssPath, "utf-8");
    // 新デザイントークンが使われていること（文字色・罫・ホバー色）
    expect(css).toMatch(/var\(--(ink|rule|accent)/);
  });
});
