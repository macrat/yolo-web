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

describe("BlogCard linkableTags フィルタ", () => {
  test("linkableTags 未指定のときはすべてのタグが表示される", () => {
    render(
      <BlogCard
        post={makePost({ tags: ["TypeScript", "YAML"] })}
        categoryLabel="開発ノート"
      />,
    );
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("YAML")).toBeInTheDocument();
  });

  test("linkableTags 指定時、含まれるタグは表示される", () => {
    render(
      <BlogCard
        post={makePost({ tags: ["TypeScript", "YAML"] })}
        categoryLabel="開発ノート"
        linkableTags={new Set(["TypeScript"])}
      />,
    );
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  test("linkableTags 指定時、含まれないタグは DOM に出ない（要素ごと描画されない）", () => {
    render(
      <BlogCard
        post={makePost({ tags: ["TypeScript", "YAML"] })}
        categoryLabel="開発ノート"
        linkableTags={new Set(["TypeScript"])}
      />,
    );
    // YAML は linkableTags に含まれないため DOM に出てはいけない
    expect(screen.queryByText("YAML")).not.toBeInTheDocument();
  });

  test("linkableTags が空集合のときはタグリストが全表示されない", () => {
    render(
      <BlogCard
        post={makePost({ tags: ["TypeScript", "YAML"] })}
        categoryLabel="開発ノート"
        linkableTags={new Set<string>()}
      />,
    );
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
    expect(screen.queryByText("YAML")).not.toBeInTheDocument();
    // タグリスト自体が DOM に出ないこと
    expect(
      screen.queryByRole("list", { name: "タグ" }),
    ).not.toBeInTheDocument();
  });

  test("linkableTags 指定時、すべてのタグが含まれる場合は全タグが表示される", () => {
    render(
      <BlogCard
        post={makePost({ tags: ["TypeScript", "YAML"] })}
        categoryLabel="開発ノート"
        linkableTags={new Set(["TypeScript", "YAML"])}
      />,
    );
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("YAML")).toBeInTheDocument();
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
