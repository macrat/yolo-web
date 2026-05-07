import { expect, test, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

// DAILY_UPDATE_SLUGS のモック（PlayGrid が使用）
vi.mock("@/play/registry", () => ({
  DAILY_UPDATE_SLUGS: new Set([
    "daily",
    "kanji-kanaru",
    "yoji-kimeru",
    "nakamawake",
    "irodori",
  ]),
  allPlayContents: [],
}));

// getContentPath のモック
vi.mock("@/play/paths", () => ({
  getContentPath: (content: { contentType: string; slug: string }) => {
    if (content.contentType === "fortune") return "/play/daily";
    return `/play/${content.slug}`;
  },
}));

import PlayPage from "../page";

describe("(new)/play/page.tsx ルート存在テスト", () => {
  test("PlayPage コンポーネントが存在し、レンダリングできる", () => {
    // ページコンポーネントが import できること、かつエラーなくレンダリングできることを確認
    expect(PlayPage).toBeDefined();
    expect(() => render(<PlayPage />)).not.toThrow();
  });

  test("ページに h1 見出しが表示される", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "遊ぶ" }),
    ).toBeInTheDocument();
  });

  test("カテゴリナビゲーションが表示される", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).toBeInTheDocument();
  });

  test("検索ボックスが表示される", () => {
    render(<PlayPage />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });
});
