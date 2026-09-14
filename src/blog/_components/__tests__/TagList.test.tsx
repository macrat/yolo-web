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

  test("className を渡すと根 ul に付与される（既存クラスと併存）", () => {
    // BlogList が stretched-link より前面へタグを出すため z-index クラスを渡す用途。
    render(<TagList tags={["Next.js"]} className="custom-class" />);
    const ul = screen.getByRole("list", { name: "タグ" });
    expect(ul).toHaveClass("custom-class");
    // 既存の styles.tags クラスも保持されていること（"tags undefined" のような破損もない）
    expect(ul.className).not.toContain("undefined");
    expect(ul.className.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
  });

  test("className 未指定時は根 ul に追加クラスが付かない（後方互換）", () => {
    render(<TagList tags={["Next.js"]} />);
    const ul = screen.getByRole("list", { name: "タグ" });
    // 単一クラス（styles.tags）のみ・"undefined" 文字列の混入もないこと
    expect(ul.className).not.toContain("undefined");
    expect(ul.className.trim().split(/\s+/).length).toBe(1);
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

describe("TagList linkableTags — リンクになるタグ・ならないタグ", () => {
  test("linkableTags 未指定のときはすべてのタグがリンクになる", () => {
    render(<TagList tags={["Next.js", "YAML"]} />);
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/blog/tag/Next.js", "/blog/tag/YAML"]);
  });

  test("linkableTags に含まれるタグはタグページへのリンクになる", () => {
    render(
      <TagList
        tags={["Next.js", "YAML"]}
        linkableTags={new Set(["Next.js"])}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Next.js");
    expect(link.getAttribute("href")).toBe("/blog/tag/Next.js");
  });

  test("linkableTags に含まれないタグも表示される（リンクにはしない）", () => {
    render(
      <TagList
        tags={["Next.js", "YAML"]}
        linkableTags={new Set(["Next.js"])}
      />,
    );
    const yaml = screen.getByText("YAML");
    expect(yaml).toBeInTheDocument();
    expect(yaml.tagName).toBe("SPAN");
    expect(yaml.closest("a")).toBeNull();
    // リンクはタグページを持つ Next.js の 1 本だけ
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  test("記事のタグは並び順のまま全件描画される（リンクの有無で欠けない）", () => {
    render(
      <TagList
        tags={["YAML", "DevOps", "設定ファイル", "Next.js", "運用"]}
        linkableTags={new Set(["Next.js", "運用"])}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "YAML",
      "DevOps",
      "設定ファイル",
      "Next.js",
      "運用",
    ]);
  });

  test("linkableTags が空集合でも全タグが表示され、リンクは 1 本も無い", () => {
    render(
      <TagList tags={["Next.js", "YAML"]} linkableTags={new Set<string>()} />,
    );
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("YAML")).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  test("linkableTags にすべて含まれる場合は全タグがリンクになる", () => {
    render(
      <TagList
        tags={["Next.js", "YAML"]}
        linkableTags={new Set(["Next.js", "YAML"])}
      />,
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  test("リンクとリンクでないタグは異なるクラスで描かれる（罫の線種で区別する）", () => {
    render(
      <TagList
        tags={["Next.js", "YAML"]}
        linkableTags={new Set(["Next.js"])}
      />,
    );
    const linkClass = screen.getByRole("link").className;
    const labelClass = screen.getByText("YAML").className;
    expect(linkClass).not.toBe(labelClass);
    expect(labelClass).not.toContain("undefined");
  });
});

describe("TagList.module.css — リンクでないタグの見た目", () => {
  test("リンクは実線の罫・リンクでないタグは破線の罫で描かれる", () => {
    const cssPath = path.resolve(__dirname, "../TagList.module.css");
    const css = fs.readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/\.tagLink\s*\{[^}]*border:\s*1px solid var\(--rule\)/);
    expect(css).toMatch(
      /\.tagLabel\s*\{[^}]*border:\s*1px dashed var\(--rule\)/,
    );
  });

  test("リンクでないタグはホバーで朱に転じる状態を持たない（リンクより前へ出ない）", () => {
    const cssPath = path.resolve(__dirname, "../TagList.module.css");
    const css = fs.readFileSync(cssPath, "utf-8");
    expect(css).toContain(".tagLink:hover");
    expect(css).not.toContain(".tagLabel:hover");
  });
});
