import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PlayContentMeta } from "@/play/types";
import PlayRecommendBlock from "../PlayRecommendBlock";

// next/link のモック
vi.mock("next/link", () => ({
  default: ({
    href,
    className,
    style,
    children,
  }: {
    href: string;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
  }) => (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  ),
}));

// getContentPath をモックする
vi.mock("@/play/paths", () => ({
  getContentPath: (content: { contentType: string; slug: string }) => {
    if (content.contentType === "fortune") return "/play/daily";
    return `/play/${content.slug}`;
  },
}));

// resolveDisplayCategory をモックする
vi.mock("@/play/seo", () => ({
  resolveDisplayCategory: (meta: { contentType: string; category: string }) => {
    if (meta.contentType === "fortune") return "運勢";
    if (meta.contentType === "quiz") {
      if (meta.category === "knowledge") return "クイズ";
      if (meta.category === "personality") return "診断";
    }
    return "パズル";
  },
}));

// registry をモックする
vi.mock("@/play/registry", () => ({
  DAILY_UPDATE_SLUGS: new Set(["daily", "kanji-kanaru"]),
  quizQuestionCountBySlug: new Map([
    ["test-quiz", 10],
    ["kanji-level", 20],
  ]),
}));

const mockRecommendations: PlayContentMeta[] = [
  {
    slug: "test-quiz",
    title: "テストクイズ",
    shortTitle: "テスト",
    description: "テスト用のクイズです",
    shortDescription: "テスト用クイズ",
    icon: "🎯",
    accentColor: "#ff0000",
    keywords: ["テスト"],
    publishedAt: "2026-01-01T00:00:00+09:00",
    contentType: "quiz",
    category: "knowledge",
  },
  {
    slug: "test-fortune",
    title: "テスト占い",
    description: "テスト用の占いです",
    shortDescription: "テスト用占い",
    icon: "🔮",
    accentColor: "#7c3aed",
    keywords: ["テスト"],
    publishedAt: "2026-01-01T00:00:00+09:00",
    contentType: "fortune",
    category: "fortune",
  },
];

test("2件の推薦データで正しくレンダリング", () => {
  render(<PlayRecommendBlock recommendations={mockRecommendations} />);

  expect(screen.getByRole("navigation")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  const links = screen.getAllByRole("link");
  expect(links.length).toBe(2);
});

test("heading未指定時はデフォルト「こちらもおすすめ」が表示される", () => {
  render(<PlayRecommendBlock recommendations={mockRecommendations} />);

  expect(
    screen.getByRole("heading", { level: 2, name: "こちらもおすすめ" }),
  ).toBeInTheDocument();
});

test("heading指定時はそのテキストが見出しに表示される", () => {
  render(
    <PlayRecommendBlock
      recommendations={mockRecommendations}
      heading="この記事を読んだあなたに"
    />,
  );

  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "この記事を読んだあなたに",
    }),
  ).toBeInTheDocument();
});

test("subtext未指定時はデフォルト「ブラウザで今すぐ遊べる無料コンテンツ」が表示される", () => {
  render(<PlayRecommendBlock recommendations={mockRecommendations} />);

  expect(
    screen.getByText("ブラウザで今すぐ遊べる無料コンテンツ"),
  ).toBeInTheDocument();
});

test("subtext指定時はそのテキストがサブテキストに表示される", () => {
  render(
    <PlayRecommendBlock
      recommendations={mockRecommendations}
      subtext="ブラウザで今すぐ遊べる診断・占い"
    />,
  );

  expect(
    screen.getByText("ブラウザで今すぐ遊べる診断・占い"),
  ).toBeInTheDocument();
});

test("各カードにアイコン、タイトル、説明、CTAが表示", () => {
  render(<PlayRecommendBlock recommendations={mockRecommendations} />);

  // アイコン
  expect(screen.getByText("🎯")).toBeInTheDocument();
  expect(screen.getByText("🔮")).toBeInTheDocument();

  // タイトル（shortTitle優先）
  expect(screen.getByText("テスト")).toBeInTheDocument();
  expect(screen.getByText("テスト占い")).toBeInTheDocument();

  // 説明
  expect(screen.getByText("テスト用クイズ")).toBeInTheDocument();
  expect(screen.getByText("テスト用占い")).toBeInTheDocument();

  // CTA
  expect(screen.getByText("挑戦してみる →")).toBeInTheDocument();
  expect(screen.getByText("占ってみる →")).toBeInTheDocument();
});

test("空配列でnull（何もレンダリングされない）", () => {
  const { container } = render(<PlayRecommendBlock recommendations={[]} />);

  expect(container.firstChild).toBeNull();
});

test("aria-labelが設定されている", () => {
  render(<PlayRecommendBlock recommendations={mockRecommendations} />);

  expect(
    screen.getByRole("navigation", { name: "関連する占い・診断" }),
  ).toBeInTheDocument();
});

test("カテゴリ別のCTAテキストが正しい", () => {
  const allCategoryRecommendations: PlayContentMeta[] = [
    {
      slug: "fortune-test",
      title: "占いコンテンツ",
      description: "占いです",
      shortDescription: "占い",
      icon: "🔮",
      accentColor: "#7c3aed",
      keywords: [],
      publishedAt: "2026-01-01T00:00:00+09:00",
      contentType: "fortune",
      category: "fortune",
    },
    {
      slug: "personality-test",
      title: "診断コンテンツ",
      description: "診断です",
      shortDescription: "診断",
      icon: "🧬",
      accentColor: "#22c55e",
      keywords: [],
      publishedAt: "2026-01-01T00:00:00+09:00",
      contentType: "quiz",
      category: "personality",
    },
    {
      slug: "knowledge-test",
      title: "知識コンテンツ",
      description: "知識テストです",
      shortDescription: "知識テスト",
      icon: "📚",
      accentColor: "#3b82f6",
      keywords: [],
      publishedAt: "2026-01-01T00:00:00+09:00",
      contentType: "quiz",
      category: "knowledge",
    },
    {
      slug: "game-test",
      title: "ゲームコンテンツ",
      description: "ゲームです",
      shortDescription: "ゲーム",
      icon: "🎮",
      accentColor: "#f59e0b",
      keywords: [],
      publishedAt: "2026-01-01T00:00:00+09:00",
      contentType: "game",
      category: "game",
    },
  ];

  render(<PlayRecommendBlock recommendations={allCategoryRecommendations} />);

  expect(screen.getByText("占ってみる →")).toBeInTheDocument();
  expect(screen.getByText("診断してみる →")).toBeInTheDocument();
  expect(screen.getByText("挑戦してみる →")).toBeInTheDocument();
  expect(screen.getByText("遊んでみる →")).toBeInTheDocument();
});
