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

import BlogList from "../BlogList";

/** テスト用の記事データを生成するヘルパー */
function makePost(
  overrides: Partial<Parameters<typeof BlogList>[0]["posts"][number]> = {},
) {
  return {
    slug: "test-slug",
    title: "テスト記事タイトル",
    description: "テスト記事の説明文です。内容の詳細をここに記載します。",
    published_at: "2026-01-15",
    readingTime: 5,
    tags: ["TypeScript", "Next.js"],
    category: "dev-notes",
    ...overrides,
  };
}

const categoryLabels: Record<string, string> = {
  "dev-notes": "開発ノート",
};

describe("BlogList 基本表示", () => {
  test("カテゴリラベルが表示される", () => {
    render(
      <BlogList
        posts={[makePost()]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    expect(screen.getByText("開発ノート")).toBeInTheDocument();
  });

  test("日付が表示される", () => {
    render(
      <BlogList
        posts={[makePost({ published_at: "2026-01-15" })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    expect(screen.getByText("2026-01-15")).toBeInTheDocument();
  });

  test("読了時間が表示される", () => {
    render(
      <BlogList
        posts={[makePost({ readingTime: 7 })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    expect(screen.getByText(/7.{0,4}分/)).toBeInTheDocument();
  });

  test("タイトルが h2 として表示される", () => {
    render(
      <BlogList
        posts={[makePost({ title: "記事のタイトルです" })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "記事のタイトルです" }),
    ).toBeInTheDocument();
  });

  test("description が表示される", () => {
    render(
      <BlogList
        posts={[makePost({ description: "ここに説明文が入ります" })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    expect(screen.getByText("ここに説明文が入ります")).toBeInTheDocument();
  });

  test("タグリストが表示される", () => {
    render(
      <BlogList
        posts={[makePost({ tags: ["設計パターン", "Web開発"] })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    expect(screen.getByText("設計パターン")).toBeInTheDocument();
    expect(screen.getByText("Web開発")).toBeInTheDocument();
  });

  test("タグが 0 件の場合でもエラーにならない", () => {
    render(
      <BlogList
        posts={[makePost({ tags: [] })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    expect(
      screen.queryByRole("list", { name: "タグ" }),
    ).not.toBeInTheDocument();
  });

  test("タイトルリンクが /blog/[slug] を指す", () => {
    render(
      <BlogList
        posts={[makePost({ slug: "my-article" })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    const titleLink = screen.getByRole("link", { name: "テスト記事タイトル" });
    expect(titleLink.getAttribute("href")).toBe("/blog/my-article");
  });

  test("タグリンクが /blog/tag/[tag] を指す", () => {
    render(
      <BlogList
        posts={[makePost({ tags: ["Claude Code"] })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    const tagLink = screen.getByRole("link", { name: "Claude Code" });
    expect(tagLink.getAttribute("href")).toBe("/blog/tag/Claude Code");
  });

  test("タイトルリンクのアクセシブル名は記事タイトルのみ（stretched-link 下でも行連結にならない）", () => {
    // stretched-link（::after）は CSS のみで標的を広げる方式のため、
    // アクセシブル名は品名だけに保たれ、description・値札・タグ名を巻き込まない。
    render(
      <BlogList
        posts={[
          makePost({
            title: "テスト記事タイトル",
            description: "巻き込まれてはいけない説明文",
            tags: ["設計パターン"],
          }),
        ]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    const titleLink = screen.getByRole("link", { name: "テスト記事タイトル" });
    expect(titleLink.getAttribute("href")).toBe("/blog/test-slug");
  });

  test("タグリンクは stretched-link 下でも独立したリンクとして取得できる", () => {
    // stretched-link がタイトルの標的を行全体に広げても、
    // タグは z-index で前面に維持され別リンクとして生きている契約。
    render(
      <BlogList
        posts={[makePost({ tags: ["設計パターン", "Web開発"] })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    const tagLink = screen.getByRole("link", { name: "設計パターン" });
    expect(tagLink.getAttribute("href")).toBe("/blog/tag/設計パターン");
    // タイトルリンクとは別要素であること
    const titleLink = screen.getByRole("link", { name: "テスト記事タイトル" });
    expect(tagLink).not.toBe(titleLink);
  });

  test("複数記事が一覧としてレンダリングされる", () => {
    render(
      <BlogList
        posts={[
          makePost({ slug: "a", title: "記事A" }),
          makePost({ slug: "b", title: "記事B" }),
        ]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    expect(screen.getByText("記事A")).toBeInTheDocument();
    expect(screen.getByText("記事B")).toBeInTheDocument();
  });
});

describe("BlogList linkableTags フィルタ", () => {
  test("linkableTags 指定時、含まれないタグは DOM に出ない（要素ごと描画されない）", () => {
    render(
      <BlogList
        posts={[makePost({ tags: ["TypeScript", "YAML"] })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
        linkableTags={new Set(["TypeScript"])}
      />,
    );
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.queryByText("YAML")).not.toBeInTheDocument();
  });
});

describe("BlogList 新着マーク", () => {
  test("newSlugs に含まれるとき「新着」マークが表示される", () => {
    render(
      <BlogList
        posts={[makePost({ slug: "new-post" })]}
        newSlugs={new Set(["new-post"])}
        categoryLabels={categoryLabels}
      />,
    );
    expect(screen.getByText("新着")).toBeInTheDocument();
  });

  test("newSlugs に含まれないとき「新着」マークが表示されない", () => {
    render(
      <BlogList
        posts={[makePost({ slug: "old-post" })]}
        newSlugs={new Set()}
        categoryLabels={categoryLabels}
      />,
    );
    expect(screen.queryByText("新着")).not.toBeInTheDocument();
  });
});
