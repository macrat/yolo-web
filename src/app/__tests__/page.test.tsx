import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

vi.mock("@/blog/_lib/blog", () => ({
  getAllBlogPosts: () => [
    {
      title: "テスト記事1",
      slug: "test-1",
      description: "テスト概要1",
      published_at: "2026-02-14T07:57:19+09:00",
      updated_at: "2026-02-14T07:57:19+09:00",
      tags: [],
      category: "technical",
      related_memo_ids: [],
      related_tool_slugs: [],
      draft: false,
      readingTime: 5,
      trustLevel: "generated",
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

vi.mock("@/quiz/registry", () => ({
  allQuizMetas: [
    {
      slug: "kanji-level",
      title: "漢字レベル診断",
      shortDescription: "テスト用",
      icon: "\u{1F4DA}",
      accentColor: "#4d8c3f",
    },
    {
      slug: "traditional-color",
      title: "伝統色クイズ",
      shortDescription: "テスト用",
      icon: "\u{1F3A8}",
      accentColor: "#e91e63",
    },
  ],
}));

test("Home page renders heading", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "yolos.net" }),
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

test("Home page renders stat badges with dynamic counts", () => {
  render(<Home />);
  expect(screen.getByText(/6 ツール/)).toBeInTheDocument();
  expect(screen.getByText(/4 デイリーパズル/)).toBeInTheDocument();
  expect(screen.getByText(/2 クイズ・診断/)).toBeInTheDocument();
  expect(screen.getByText(/AI運営ブログ/)).toBeInTheDocument();
});

test("Home page renders stat badges as links", () => {
  render(<Home />);
  expect(screen.getByRole("link", { name: /6 ツール/ })).toHaveAttribute(
    "href",
    "/tools",
  );
  expect(
    screen.getByRole("link", { name: /4 デイリーパズル/ }),
  ).toHaveAttribute("href", "/games");
  expect(screen.getByRole("link", { name: /2 クイズ・診断/ })).toHaveAttribute(
    "href",
    "/quiz",
  );
  expect(screen.getByRole("link", { name: /AI運営ブログ/ })).toHaveAttribute(
    "href",
    "/blog",
  );
});

test("Home page renders daily puzzle section with all games", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: /今日のデイリーパズル/ }),
  ).toBeInTheDocument();
  expect(screen.getByText(/4つのパズルに挑戦しよう/)).toBeInTheDocument();
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
  expect(screen.getByRole("link", { name: /イロドリ/ })).toHaveAttribute(
    "href",
    "/games/irodori",
  );
});

test("Home page renders popular tools section with dynamic count", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: /人気ツール/ }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /全ツールを見る/ })).toHaveAttribute(
    "href",
    "/tools",
  );
  expect(screen.getByText(/全ツールを見る \(6\+\)/)).toBeInTheDocument();
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
