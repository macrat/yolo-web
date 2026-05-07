import { expect, test, vi, beforeEach, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PlayContentMeta } from "@/play/types";
import * as nextNavigation from "next/navigation";

// useSearchParams / useRouter のモック
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ push: mockPush, replace: mockReplace })),
}));

// next/link のモック（jsdom 環境でも href 属性が機能するよう <a> に変換）
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
    "aria-current"?: React.AriaAttributes["aria-current"];
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

// DAILY_UPDATE_SLUGS のモック（PlayGrid 内で使用される）
vi.mock("@/play/registry", () => ({
  DAILY_UPDATE_SLUGS: new Set([
    "daily",
    "kanji-kanaru",
    "yoji-kimeru",
    "nakamawake",
    "irodori",
  ]),
}));

// getContentPath のモック
vi.mock("@/play/paths", () => ({
  getContentPath: (content: { contentType: string; slug: string }) => {
    if (content.contentType === "fortune") return "/play/daily";
    return `/play/${content.slug}`;
  },
}));

import PlayFilterableList from "../PlayFilterableList";

/** テスト用 PlayContentMeta を生成するヘルパー */
function makeContent(
  slug: string,
  category: PlayContentMeta["category"],
  title: string,
  publishedAt = "2026-01-01T00:00:00+09:00",
  shortDescription = `${title}の説明`,
): PlayContentMeta {
  return {
    slug,
    title,
    description: `${title}の詳細説明`,
    shortDescription,
    icon: "🎮",
    accentColor: "#000000",
    keywords: [],
    publishedAt,
    trustLevel: "verified",
    contentType: "quiz",
    category,
  };
}

// タイトルはカテゴリラベル（「今日の運勢」「あなたはどのタイプ？」等）と
// 重複しないよう意図的に異なる文字列を使用する。
// カテゴリラベルはナビリンクにも表示されるため、getByText が複数ヒットして
// テストが誤作動することを防ぐ。
const mockContents: PlayContentMeta[] = [
  makeContent("quiz-fortune", "fortune", "運勢コンテンツA"),
  makeContent("quiz-personality", "personality", "性格コンテンツB"),
  makeContent("quiz-knowledge", "knowledge", "知識コンテンツC"),
  makeContent("quiz-game", "game", "ゲームコンテンツD"),
];

// 各テスト前にデフォルトのモック（フィルターなし）に戻す
beforeEach(() => {
  vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
    new URLSearchParams() as ReturnType<typeof nextNavigation.useSearchParams>,
  );
  mockPush.mockClear();
  mockReplace.mockClear();
});

describe("フィルターナビゲーション", () => {
  test("カテゴリナビゲーションが表示される", () => {
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    expect(
      screen.getByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).toBeInTheDocument();
  });

  test("「すべて」リンクが表示され /play を指す", () => {
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    expect(nav.querySelector('[href="/play"]')).not.toBeNull();
    expect(nav).toHaveTextContent("すべて");
  });

  test("4つのカテゴリリンクが表示される", () => {
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    expect(nav.querySelector('[href*="category=fortune"]')).not.toBeNull();
    expect(nav.querySelector('[href*="category=personality"]')).not.toBeNull();
    expect(nav.querySelector('[href*="category=knowledge"]')).not.toBeNull();
    expect(nav.querySelector('[href*="category=game"]')).not.toBeNull();
  });

  test("初期状態では「すべて」リンクがアクティブ（aria-current=page、data-active=true）", () => {
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const allLink = nav.querySelector('[href="/play"]') as Element;
    expect(allLink).toHaveAttribute("aria-current", "page");
    expect(allLink).toHaveAttribute("data-active", "true");
  });

  test("初期状態ではカテゴリリンクがアクティブでない", () => {
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const fortuneLink = nav.querySelector(
      '[href*="category=fortune"]',
    ) as Element;
    expect(fortuneLink).not.toHaveAttribute("aria-current");
    expect(fortuneLink).not.toHaveAttribute("data-active");
  });

  test("不正なカテゴリ値では「すべて」がアクティブになる（フォールバック）", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("category=invalid_category") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const allLink = nav.querySelector('[href="/play"]') as Element;
    expect(allLink).toHaveAttribute("aria-current", "page");
  });
});

describe("カテゴリフィルタリング", () => {
  test("初期状態では全コンテンツが表示される", () => {
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    expect(screen.getByText("運勢コンテンツA")).toBeInTheDocument();
    expect(screen.getByText("性格コンテンツB")).toBeInTheDocument();
    expect(screen.getByText("知識コンテンツC")).toBeInTheDocument();
    expect(screen.getByText("ゲームコンテンツD")).toBeInTheDocument();
  });

  test("?category=fortune では fortune カテゴリのコンテンツのみ表示", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("category=fortune") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    expect(screen.getByText("運勢コンテンツA")).toBeInTheDocument();
    expect(screen.queryByText("性格コンテンツB")).not.toBeInTheDocument();
    expect(screen.queryByText("知識コンテンツC")).not.toBeInTheDocument();
    expect(screen.queryByText("ゲームコンテンツD")).not.toBeInTheDocument();
  });

  test("?category=fortune では fortune リンクがアクティブになる", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("category=fortune") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const fortuneLink = nav.querySelector(
      '[href*="category=fortune"]',
    ) as Element;
    expect(fortuneLink).toHaveAttribute("aria-current", "page");
    expect(fortuneLink).toHaveAttribute("data-active", "true");
    // 「すべて」はアクティブでない
    const allLink = nav.querySelector('[href="/play"]') as Element;
    expect(allLink).not.toHaveAttribute("aria-current");
  });
});

describe("キーワード検索", () => {
  test("?q=性格コンテンツ ではタイトルにマッチするコンテンツのみ表示", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=性格コンテンツ") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    expect(screen.getByText("性格コンテンツB")).toBeInTheDocument();
    expect(screen.queryByText("運勢コンテンツA")).not.toBeInTheDocument();
    expect(screen.queryByText("知識コンテンツC")).not.toBeInTheDocument();
  });

  test("?q= では shortDescription にマッチするコンテンツも表示される（他カードは除外される）", () => {
    // makeContent ヘルパーにより shortDescription は "${title}の説明" になっている
    // "ゲームコンテンツDの説明" は ゲームコンテンツD の shortDescription にのみ含まれる
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=ゲームコンテンツDの説明") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    expect(screen.getByText("ゲームコンテンツD")).toBeInTheDocument();
    // フィルターが機能し、他カードが除外されていること（M-2 是正）
    expect(screen.queryByText("運勢コンテンツA")).not.toBeInTheDocument();
    expect(screen.queryByText("性格コンテンツB")).not.toBeInTheDocument();
    expect(screen.queryByText("知識コンテンツC")).not.toBeInTheDocument();
  });

  test("キーワード検索は大文字小文字を区別しない（英字）", () => {
    const contentsWithEn: PlayContentMeta[] = [
      makeContent("quiz-json", "knowledge", "JSON形式クイズ"),
    ];
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=json") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <PlayFilterableList contents={contentsWithEn} newSlugs={new Set()} />,
    );
    expect(screen.getByText("JSON形式クイズ")).toBeInTheDocument();
  });

  test("?q=存在しないXYZ では空結果メッセージが表示される", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=存在しないXYZ") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const statusMsg = screen.getByRole("status");
    expect(statusMsg).toBeInTheDocument();
    expect(statusMsg).toHaveTextContent(
      "該当するコンテンツが見つかりませんでした",
    );
  });

  test("?q=（空白のみ）では全コンテンツが表示される", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=   ") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    expect(screen.getByText("運勢コンテンツA")).toBeInTheDocument();
    expect(screen.getByText("性格コンテンツB")).toBeInTheDocument();
    expect(screen.getByText("知識コンテンツC")).toBeInTheDocument();
    expect(screen.getByText("ゲームコンテンツD")).toBeInTheDocument();
  });

  test("shortTitle のみにマッチするキーワードでコンテンツが表示される（M-1 是正）", () => {
    // shortTitle にのみ含まれる語でヒットすることを確認。
    // title・shortDescription・keywords にはこの語を含めない。
    // NOTE: PlayCard は shortTitle があればそれを h2 に表示するため、
    //       カード識別は shortDescription（p タグ）や href で行う。
    const contentsWithShortTitle: PlayContentMeta[] = [
      {
        ...makeContent("quiz-shorttitle", "knowledge", "クイズタイトル通常"),
        shortTitle: "短縮専用語句",
      },
      makeContent("quiz-other", "game", "別のコンテンツZ"),
    ];
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=短縮専用語句") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <PlayFilterableList
        contents={contentsWithShortTitle}
        newSlugs={new Set()}
      />,
    );
    // shortTitle マッチカードが表示される（shortTitle が h2 に表示される）
    expect(screen.getByText("短縮専用語句")).toBeInTheDocument();
    // shortTitle に含まれない他カードは除外される
    expect(screen.queryByText("別のコンテンツZ")).not.toBeInTheDocument();
  });

  test("keywords にのみマッチするキーワードでコンテンツが表示される（M-1 是正）", () => {
    // keywords 配列にしか含まれない語でヒットすることを確認。
    // title・shortTitle・shortDescription にはこの語を含めない。
    const contentsWithKeywords: PlayContentMeta[] = [
      {
        ...makeContent("quiz-keywords", "personality", "性格テスト標準"),
        keywords: ["メタ検索語彙"],
      },
      makeContent("quiz-nokey", "fortune", "運勢テスト標準"),
    ];
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=メタ検索語彙") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <PlayFilterableList
        contents={contentsWithKeywords}
        newSlugs={new Set()}
      />,
    );
    // keywords マッチカードが表示される
    expect(screen.getByText("性格テスト標準")).toBeInTheDocument();
    // keywords に含まれない他カードは除外される
    expect(screen.queryByText("運勢テスト標準")).not.toBeInTheDocument();
  });
});

describe("カテゴリ + キーワード併用", () => {
  test("カテゴリ + キーワードの積集合フィルタリングが機能する", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("category=personality&q=性格") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    expect(screen.getByText("性格コンテンツB")).toBeInTheDocument();
    // fortune カテゴリはカテゴリフィルタで除外
    expect(screen.queryByText("運勢コンテンツA")).not.toBeInTheDocument();
  });

  test("カテゴリ + キーワードで該当なしの場合は空結果メッセージが表示される", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("category=fortune&q=パズル") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const statusMsg = screen.getByRole("status");
    expect(statusMsg).toHaveTextContent(
      "該当するコンテンツが見つかりませんでした",
    );
  });
});

describe("カテゴリリンク href", () => {
  test("カテゴリリンク href にキーワード（q=）が引き継がれる（buildCategoryHref 動作）", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=クイズ") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const knowledgeLink = nav.querySelector(
      '[href*="category=knowledge"]',
    ) as HTMLAnchorElement;
    // q=クイズ が引き継がれていること
    expect(knowledgeLink.getAttribute("href")).toContain("q=");
    expect(knowledgeLink.getAttribute("href")).toContain("category=knowledge");
  });

  test("初期状態（q= なし）のカテゴリリンク href には q= が含まれない", () => {
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const fortuneLink = nav.querySelector(
      '[href*="category=fortune"]',
    ) as HTMLAnchorElement;
    expect(fortuneLink.getAttribute("href")).not.toContain("q=");
  });
});

describe("debounce と URL 更新", () => {
  test("入力欄に文字を入力すると debounce 後に router.replace が呼ばれる", async () => {
    render(<PlayFilterableList contents={mockContents} newSlugs={new Set()} />);
    const searchInput = screen.getByRole("searchbox");
    await userEvent.type(searchInput, "a");
    // 入力直後（debounce 前）は router.replace が呼ばれていないこと（m-1 是正）
    // NOTE: userEvent.type は非同期だが、debounce タイマー（300ms）はまだ発火していない
    expect(mockReplace).not.toHaveBeenCalled();
    // debounce 後に router.replace が呼ばれること
    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalled();
        const lastCalledUrl = mockReplace.mock.calls[
          mockReplace.mock.calls.length - 1
        ][0] as string;
        expect(lastCalledUrl).toContain("q=");
      },
      { timeout: 1000 },
    );
  });
});

describe("表示順", () => {
  test("コンテンツは publishedAt 降順（新しい順）で表示される", () => {
    const contentsWithDates: PlayContentMeta[] = [
      makeContent(
        "content-oldest",
        "game",
        "古いコンテンツ",
        "2025-01-01T00:00:00+09:00",
      ),
      makeContent(
        "content-newest",
        "game",
        "新しいコンテンツ",
        "2026-03-01T00:00:00+09:00",
      ),
      makeContent(
        "content-middle",
        "game",
        "中間のコンテンツ",
        "2025-06-01T00:00:00+09:00",
      ),
    ];
    render(
      <PlayFilterableList contents={contentsWithDates} newSlugs={new Set()} />,
    );
    const cards = screen.getAllByRole("link");
    const cardTexts = cards.map((card) => card.textContent ?? "");
    const newestIndex = cardTexts.findIndex((t) =>
      t.includes("新しいコンテンツ"),
    );
    const middleIndex = cardTexts.findIndex((t) =>
      t.includes("中間のコンテンツ"),
    );
    const oldestIndex = cardTexts.findIndex((t) =>
      t.includes("古いコンテンツ"),
    );
    expect(newestIndex).toBeLessThan(middleIndex);
    expect(middleIndex).toBeLessThan(oldestIndex);
  });
});

describe("毎日更新バッジ", () => {
  test("初期状態で DAILY_UPDATE_SLUGS の全5件に「毎日更新」バッジが表示される", () => {
    // DAILY_UPDATE_SLUGS = ["daily", "kanji-kanaru", "yoji-kimeru", "nakamawake", "irodori"]
    const dailyContents: PlayContentMeta[] = [
      makeContent("daily", "fortune", "今日の占い"),
      makeContent("kanji-kanaru", "game", "漢字かなる"),
      makeContent("yoji-kimeru", "game", "四字決める"),
      makeContent("nakamawake", "game", "仲間分け"),
      makeContent("irodori", "game", "彩り"),
    ];
    render(
      <PlayFilterableList contents={dailyContents} newSlugs={new Set()} />,
    );
    // 全5件の「毎日更新」バッジが表示されること
    const dailyBadges = screen.getAllByText("毎日更新");
    expect(dailyBadges).toHaveLength(5);
  });

  test("DAILY_UPDATE_SLUGS に含まれないコンテンツには「毎日更新」バッジが表示されない", () => {
    const nonDailyContents: PlayContentMeta[] = [
      makeContent("non-daily-quiz", "knowledge", "通常クイズ"),
    ];
    render(
      <PlayFilterableList contents={nonDailyContents} newSlugs={new Set()} />,
    );
    expect(screen.queryByText("毎日更新")).not.toBeInTheDocument();
  });
});

describe("NEW バッジ", () => {
  test("newSlugs に含まれるコンテンツには NEW バッジが表示される", () => {
    const contents: PlayContentMeta[] = [
      makeContent("new-content", "knowledge", "新着クイズ"),
    ];
    render(
      <PlayFilterableList
        contents={contents}
        newSlugs={new Set(["new-content"])}
      />,
    );
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  test("newSlugs に含まれないコンテンツには NEW バッジが表示されない", () => {
    const contents: PlayContentMeta[] = [
      makeContent("old-content", "knowledge", "通常クイズ"),
    ];
    render(<PlayFilterableList contents={contents} newSlugs={new Set()} />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });
});
