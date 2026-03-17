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

vi.mock("@/play/quiz/registry", () => ({
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

vi.mock("@/play/registry", () => ({
  // 4 games + 2 quizzes + 1 fortune = 7 total (mocked values)
  allPlayContents: new Array(7).fill(null),
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
  // allPlayContents は 7件（mock）。ゲーム・クイズ・Fortuneを統合した「遊ぶ」バッジ
  expect(screen.getByText(/7 遊ぶ/)).toBeInTheDocument();
  expect(screen.getByText(/AI運営ブログ/)).toBeInTheDocument();
});

test("Home page renders stat badges as links", () => {
  render(<Home />);
  expect(screen.getByRole("link", { name: /6 ツール/ })).toHaveAttribute(
    "href",
    "/tools",
  );
  // クイズ・診断バッジを削除し、「遊ぶ」バッジに統合
  expect(screen.getByRole("link", { name: /7 遊ぶ/ })).toHaveAttribute(
    "href",
    "/play",
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
    "/play/kanji-kanaru",
  );
  expect(screen.getByRole("link", { name: /四字キメル/ })).toHaveAttribute(
    "href",
    "/play/yoji-kimeru",
  );
  expect(screen.getByRole("link", { name: /ナカマワケ/ })).toHaveAttribute(
    "href",
    "/play/nakamawake",
  );
  expect(screen.getByRole("link", { name: /イロドリ/ })).toHaveAttribute(
    "href",
    "/play/irodori",
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
