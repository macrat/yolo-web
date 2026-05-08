import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

import BlogCard from "../BlogCard";

/** テスト用の記事データを生成するヘルパー */
function makePost(
  overrides: Partial<Parameters<typeof BlogCard>[0]["post"]> = {},
) {
  return {
    slug: "test-slug",
    title: "テスト記事タイトル",
    description: "テスト記事の説明文です。内容の詳細をここに記載します。",
    published_at: "2026-01-15",
    readingTime: 5,
    tags: ["TypeScript", "Next.js"],
    ...overrides,
  };
}

describe("BlogCard 基本表示", () => {
  test("カテゴリラベルが表示される", () => {
    render(<BlogCard post={makePost()} categoryLabel="開発ノート" />);
    expect(screen.getByText("開発ノート")).toBeInTheDocument();
  });

  test("日付が表示される", () => {
    render(
      <BlogCard
        post={makePost({ published_at: "2026-01-15" })}
        categoryLabel="開発ノート"
      />,
    );
    // formatDate は YYYY-MM-DD をそのまま返す
    expect(screen.getByText("2026-01-15")).toBeInTheDocument();
  });

  test("読了時間が表示される", () => {
    render(
      <BlogCard
        post={makePost({ readingTime: 7 })}
        categoryLabel="開発ノート"
      />,
    );
    expect(screen.getByText(/7.{0,4}分/)).toBeInTheDocument();
  });

  test("タイトルが h2 として表示される", () => {
    render(
      <BlogCard
        post={makePost({ title: "記事のタイトルです" })}
        categoryLabel="開発ノート"
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "記事のタイトルです" }),
    ).toBeInTheDocument();
  });

  test("description が表示される", () => {
    render(
      <BlogCard
        post={makePost({ description: "ここに説明文が入ります" })}
        categoryLabel="開発ノート"
      />,
    );
    expect(screen.getByText("ここに説明文が入ります")).toBeInTheDocument();
  });

  test("タグリストが表示される", () => {
    render(
      <BlogCard
        post={makePost({ tags: ["設計パターン", "Web開発"] })}
        categoryLabel="開発ノート"
      />,
    );
    expect(screen.getByText("設計パターン")).toBeInTheDocument();
    expect(screen.getByText("Web開発")).toBeInTheDocument();
  });

  test("タグが 0 件の場合でもエラーにならない", () => {
    render(
      <BlogCard post={makePost({ tags: [] })} categoryLabel="開発ノート" />,
    );
    // タグリストが存在しないことを確認（aria-label="タグ" がない）
    expect(
      screen.queryByRole("list", { name: "タグ" }),
    ).not.toBeInTheDocument();
  });

  test("タイトルリンクが /blog/[slug] を指す", () => {
    render(
      <BlogCard
        post={makePost({ slug: "my-article" })}
        categoryLabel="開発ノート"
      />,
    );
    const titleLink = screen.getByRole("link", { name: "テスト記事タイトル" });
    expect(titleLink.getAttribute("href")).toBe("/blog/my-article");
  });

  test("タグリンクが /blog/tag/[tag] を指す", () => {
    render(
      <BlogCard
        post={makePost({ tags: ["Claude Code"] })}
        categoryLabel="開発ノート"
      />,
    );
    const tagLink = screen.getByRole("link", { name: "Claude Code" });
    expect(tagLink.getAttribute("href")).toBe("/blog/tag/Claude Code");
  });
});

describe("BlogCard linkableTags（リンク可否制御）", () => {
  test("linkableTags 未指定時はすべてのタグが <a> リンクになること", () => {
    render(
      <BlogCard
        post={makePost({ tags: ["Next.js", "TypeScript"] })}
        categoryLabel="開発ノート"
      />,
    );
    const tagLinks = screen
      .getAllByRole("link")
      .filter((el) => (el.getAttribute("href") ?? "").startsWith("/blog/tag/"));
    expect(tagLinks).toHaveLength(2);
  });

  test("linkableTags に含まれるタグは <a> リンクとして表示されること", () => {
    const linkableTags = new Set(["Next.js"]);
    render(
      <BlogCard
        post={makePost({ tags: ["Next.js", "YAML"] })}
        categoryLabel="開発ノート"
        linkableTags={linkableTags}
      />,
    );
    const tagLinks = screen
      .getAllByRole("link")
      .filter((el) => (el.getAttribute("href") ?? "").startsWith("/blog/tag/"));
    expect(tagLinks).toHaveLength(1);
    expect(tagLinks[0].getAttribute("href")).toBe("/blog/tag/Next.js");
  });

  test("linkableTags に含まれないタグは <a> リンクにならないこと", () => {
    const linkableTags = new Set(["Next.js"]);
    render(
      <BlogCard
        post={makePost({ tags: ["Next.js", "YAML"] })}
        categoryLabel="開発ノート"
        linkableTags={linkableTags}
      />,
    );
    // YAML のテキストは表示される
    expect(screen.getByText("YAML")).toBeInTheDocument();
    // YAML は <a> ではない
    const yamlEl = screen.getByText("YAML");
    expect(yamlEl.tagName.toLowerCase()).not.toBe("a");
  });

  test("linkableTags に含まれないタグは aria-disabled が設定されること", () => {
    const linkableTags = new Set(["Next.js"]);
    render(
      <BlogCard
        post={makePost({ tags: ["Next.js", "YAML"] })}
        categoryLabel="開発ノート"
        linkableTags={linkableTags}
      />,
    );
    const yamlSpan = screen.getByText("YAML").closest("span");
    expect(yamlSpan).not.toBeNull();
    expect(yamlSpan).toHaveAttribute("aria-disabled", "true");
  });
});

describe("BlogCard NEW バッジ", () => {
  test("isNew=true のとき NEW バッジが表示される", () => {
    render(
      <BlogCard post={makePost()} categoryLabel="開発ノート" isNew={true} />,
    );
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  test("isNew=false のとき NEW バッジが表示されない", () => {
    render(
      <BlogCard post={makePost()} categoryLabel="開発ノート" isNew={false} />,
    );
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  test("isNew 未指定（undefined）のとき NEW バッジが表示されない", () => {
    render(<BlogCard post={makePost()} categoryLabel="開発ノート" />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });
});
