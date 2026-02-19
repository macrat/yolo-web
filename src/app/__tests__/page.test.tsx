import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

vi.mock("@/lib/blog", () => ({
  getAllBlogPosts: () => [
    {
      title: "テスト記事1",
      slug: "test-1",
      description: "テスト概要1",
      published_at: "2026-02-14",
      updated_at: "2026-02-14",
      tags: [],
      category: "technical",
      related_memo_ids: [],
      related_tool_slugs: [],
      draft: false,
      readingTime: 5,
    },
  ],
}));

vi.mock("@/tools/registry", () => ({
  allToolMetas: [
    {
      slug: "char-count",
      name: "文字数カウント",
      shortDescription: "テスト用",
    },
    {
      slug: "json-formatter",
      name: "JSON整形",
      shortDescription: "テスト用",
    },
    {
      slug: "password-generator",
      name: "パスワード生成",
      shortDescription: "テスト用",
    },
    {
      slug: "age-calculator",
      name: "年齢計算",
      shortDescription: "テスト用",
    },
    {
      slug: "qr-code",
      name: "QRコード生成",
      shortDescription: "テスト用",
    },
    {
      slug: "image-resizer",
      name: "画像リサイズ",
      shortDescription: "テスト用",
    },
  ],
}));

test("Home page renders heading", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "yolos.net" }),
  ).toBeInTheDocument();
});

test("Home page renders AI disclaimer", () => {
  render(<Home />);
  expect(
    screen.getByRole("note", { name: "AI disclaimer" }),
  ).toBeInTheDocument();
});

test("Home page renders hero description", () => {
  render(<Home />);
  expect(
    screen.getByText(
      /このサイトはAIによる実験的プロジェクトです。ツール、ゲーム、ブログなど/,
    ),
  ).toBeInTheDocument();
});

test("Home page renders stat badges", () => {
  render(<Home />);
  expect(screen.getByText(/30\+ ツール/)).toBeInTheDocument();
  expect(screen.getByText(/3 デイリーパズル/)).toBeInTheDocument();
  expect(screen.getByText(/AI運営ブログ/)).toBeInTheDocument();
});

test("Home page renders daily puzzle section", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: /今日のデイリーパズル/ }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /漢字カナール/ })).toHaveAttribute(
    "href",
    "/games/kanji-kanaru",
  );
  expect(screen.getByRole("link", { name: /四字キメル/ })).toHaveAttribute(
    "href",
    "/games/yoji-kimeru",
  );
  expect(screen.getByRole("link", { name: /ナカマワケ/ })).toHaveAttribute(
    "href",
    "/games/nakamawake",
  );
});

test("Home page renders popular tools section", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: /人気ツール/ }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /全ツールを見る/ })).toHaveAttribute(
    "href",
    "/tools",
  );
});

test("Home page renders latest blog section", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: /最新ブログ記事/ }),
  ).toBeInTheDocument();
  expect(screen.getByText("テスト記事1")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /もっと読む/ })).toHaveAttribute(
    "href",
    "/blog",
  );
});
