import { expect, test, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PlayContentMeta } from "@/play/types";

// useSearchParams / useRouter のモック（PlayFilterableList が使用）
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
}));

// next/link のモック
vi.mock("next/link", () => ({
  default: ({
    href,
    className,
    children,
    "data-active": dataActive,
    "aria-current": ariaCurrent,
  }: {
    href: string;
    className?: string;
    children: React.ReactNode;
    "data-active"?: string;
    "aria-current"?: string;
  }) => (
    <a
      href={href}
      className={className}
      data-active={dataActive}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  ),
}));

// DAILY_UPDATE_SLUGS のモック
vi.mock("@/play/registry", () => ({
  DAILY_UPDATE_SLUGS: new Set(["daily", "kanji-kanaru"]),
}));

// getContentPath のモック
vi.mock("@/play/paths", () => ({
  getContentPath: (content: { contentType: string; slug: string }) => {
    if (content.contentType === "fortune") return "/play/daily";
    return `/play/${content.slug}`;
  },
}));

// calculateNewSlugs は本物を使う（純関数のため モック不要）
// PlayListView は Server Component だが jsdom では同期的にレンダリングされる

import PlayListView from "../PlayListView";

/** テスト用 PlayContentMeta を生成するヘルパー */
function makeContent(
  slug: string,
  title: string,
  category: PlayContentMeta["category"] = "knowledge",
): PlayContentMeta {
  return {
    slug,
    title,
    description: `${title}の説明`,
    shortDescription: `短い${title}`,
    icon: "🎮",
    accentColor: "#000000",
    keywords: [],
    publishedAt: "2026-01-01T00:00:00+09:00",
    trustLevel: "verified",
    contentType: "quiz",
    category,
  };
}

const mockContents: PlayContentMeta[] = [
  makeContent("content-a", "コンテンツA"),
  makeContent("content-b", "コンテンツB"),
  makeContent("content-c", "コンテンツC"),
];

describe("PlayListView 統合テスト", () => {
  test("ページタイトル（h1）が表示される", () => {
    render(<PlayListView contents={mockContents} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "遊ぶ" }),
    ).toBeInTheDocument();
  });

  test("コンテンツ件数がヘッダーに表示される", () => {
    render(<PlayListView contents={mockContents} />);
    // 件数（3）が画面に表示されることを確認（文言変更に強いパターンで検証、m-4 是正）
    expect(screen.getByText(/3.{0,6}種/)).toBeInTheDocument();
  });

  test("PlayFilterableList へ contents が渡され、コンテンツカードが表示される", () => {
    render(<PlayListView contents={mockContents} />);
    expect(screen.getByText("コンテンツA")).toBeInTheDocument();
    expect(screen.getByText("コンテンツB")).toBeInTheDocument();
    expect(screen.getByText("コンテンツC")).toBeInTheDocument();
  });

  test("PlayFilterableList へ newSlugs が渡される（30日以内の新着がない場合 NEW バッジなし）", () => {
    // publishedAt が 2026-01-01（現在の 2026-05-07 から 126日前）なので NEW バッジなし
    render(<PlayListView contents={mockContents} />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  test("PlayFilterableList へ newSlugs が渡される（30日以内の新着がある場合 NEW バッジあり）", () => {
    // publishedAt を今日に近い日時に設定してNEWバッジが出ることを確認
    const recentDate = new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const recentContents: PlayContentMeta[] = [
      {
        ...makeContent("recent-content", "最新コンテンツ"),
        publishedAt: recentDate,
      },
    ];
    render(<PlayListView contents={recentContents} />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  test("カテゴリナビゲーションが表示される（PlayFilterableList が正しく props を受け取っている）", () => {
    render(<PlayListView contents={mockContents} />);
    expect(
      screen.getByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).toBeInTheDocument();
  });

  test("contents が空配列のとき件数 0 が表示される", () => {
    render(<PlayListView contents={[]} />);
    expect(screen.getByText(/0.{0,6}種/)).toBeInTheDocument();
  });
});
