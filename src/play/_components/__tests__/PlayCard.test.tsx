import { expect, test, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PlayContentMeta } from "@/play/types";

// next/link のモック
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

// getContentPath のモック
vi.mock("@/play/paths", () => ({
  getContentPath: (content: { contentType: string; slug: string }) => {
    if (content.contentType === "fortune") return "/play/daily";
    return `/play/${content.slug}`;
  },
}));

import PlayCard from "../PlayCard";

/** テスト用 PlayContentMeta を生成するヘルパー */
function makeContent(
  overrides: Partial<PlayContentMeta> = {},
): PlayContentMeta {
  return {
    slug: "test-content",
    title: "テストコンテンツ",
    description: "テスト用の説明文",
    shortDescription: "短い説明",
    icon: "🎮",
    accentColor: "#000000",
    keywords: [],
    publishedAt: "2026-01-01T00:00:00+09:00",
    contentType: "quiz",
    category: "knowledge",
    ...overrides,
  };
}

describe("PlayCard 基本表示", () => {
  test("カテゴリラベルが表示される", () => {
    render(<PlayCard content={makeContent({ category: "knowledge" })} />);
    // knowledge カテゴリのラベル「どこまで知ってる？」
    expect(screen.getByText("どこまで知ってる？")).toBeInTheDocument();
  });

  test("fortune カテゴリのラベルが表示される", () => {
    render(
      <PlayCard
        content={makeContent({ category: "fortune", contentType: "fortune" })}
      />,
    );
    expect(screen.getByText("今日の運勢")).toBeInTheDocument();
  });

  test("personality カテゴリのラベルが表示される", () => {
    render(<PlayCard content={makeContent({ category: "personality" })} />);
    expect(screen.getByText("あなたはどのタイプ？")).toBeInTheDocument();
  });

  test("game カテゴリのラベルが表示される", () => {
    render(<PlayCard content={makeContent({ category: "game" })} />);
    expect(screen.getByText("毎日のパズル")).toBeInTheDocument();
  });

  test("タイトルが h2 として表示される", () => {
    render(<PlayCard content={makeContent({ title: "テストタイトル" })} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "テストタイトル" }),
    ).toBeInTheDocument();
  });

  test("shortTitle が設定されている場合は shortTitle が h2 に表示される", () => {
    render(
      <PlayCard
        content={makeContent({
          title: "長いタイトルの本体",
          shortTitle: "短縮タイトル",
        })}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "短縮タイトル" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("長いタイトルの本体")).not.toBeInTheDocument();
  });

  test("shortTitle が未設定の場合は title が h2 に表示される", () => {
    render(
      <PlayCard
        content={makeContent({ title: "フルタイトル", shortTitle: undefined })}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "フルタイトル" }),
    ).toBeInTheDocument();
  });

  test("shortDescription が表示される", () => {
    render(
      <PlayCard
        content={makeContent({ shortDescription: "短い説明文テスト" })}
      />,
    );
    expect(screen.getByText("短い説明文テスト")).toBeInTheDocument();
  });

  test("カード全体がリンク要素になっている", () => {
    render(<PlayCard content={makeContent({ slug: "my-content" })} />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/play/my-content");
  });

  test("fortune コンテンツのリンクは /play/daily を指す", () => {
    render(
      <PlayCard
        content={makeContent({ contentType: "fortune", category: "fortune" })}
      />,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/play/daily");
  });
});

describe("PlayCard バッジ表示", () => {
  test("isNew=true のとき NEW バッジが表示される", () => {
    render(<PlayCard content={makeContent()} isNew={true} />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  test("isNew=false のとき NEW バッジが表示されない", () => {
    render(<PlayCard content={makeContent()} isNew={false} />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  test("isNew 未指定のとき NEW バッジが表示されない", () => {
    render(<PlayCard content={makeContent()} />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  test("isDaily=true のとき「毎日更新」バッジが表示される", () => {
    render(<PlayCard content={makeContent()} isDaily={true} />);
    expect(screen.getByText("毎日更新")).toBeInTheDocument();
  });

  test("isDaily=false のとき「毎日更新」バッジが表示されない", () => {
    render(<PlayCard content={makeContent()} isDaily={false} />);
    expect(screen.queryByText("毎日更新")).not.toBeInTheDocument();
  });

  test("isDaily 未指定のとき「毎日更新」バッジが表示されない", () => {
    render(<PlayCard content={makeContent()} />);
    expect(screen.queryByText("毎日更新")).not.toBeInTheDocument();
  });

  test("isNew=true かつ isDaily=true のとき両バッジが同時に表示される", () => {
    render(<PlayCard content={makeContent()} isNew={true} isDaily={true} />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
    expect(screen.getByText("毎日更新")).toBeInTheDocument();
  });
});

describe("DAILY_UPDATE_SLUGS の各 slug に対してバッジ表示確認", () => {
  // DAILY_UPDATE_SLUGS = ["daily", "kanji-kanaru", "yoji-kimeru", "nakamawake", "irodori"]
  // PlayCard は isDaily prop を受け取るだけで自分では判定しない。
  // PlayGrid が DAILY_UPDATE_SLUGS.has(slug) で判定して isDaily を渡す。
  // ここでは isDaily=true を渡したときに各 slug でバッジが表示されることを確認する。

  const DAILY_SLUGS = [
    "daily",
    "kanji-kanaru",
    "yoji-kimeru",
    "nakamawake",
    "irodori",
  ] as const;

  test.each(DAILY_SLUGS)(
    "slug=%s で isDaily=true のとき「毎日更新」バッジが表示される",
    (slug) => {
      render(
        <PlayCard
          content={makeContent({ slug, category: "game" })}
          isDaily={true}
        />,
      );
      expect(screen.getByText("毎日更新")).toBeInTheDocument();
    },
  );
});
