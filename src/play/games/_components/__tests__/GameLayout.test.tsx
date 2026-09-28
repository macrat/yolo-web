import { expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import GameLayout from "../GameLayout";
import type { GameMeta } from "@/play/games/types";
import { followsPhraseRules } from "@/lib/phrase-breaks";

// RecommendedContent をモックしてテストを安定させる
vi.mock("@/play/_components/RecommendedContent", () => ({
  default: ({ currentSlug }: { currentSlug: string }) => (
    <nav aria-label="おすすめコンテンツ">
      <span>RecommendedContent:{currentSlug}</span>
    </nav>
  ),
}));

const mockMeta: GameMeta = {
  slug: "test-game",
  title: "テストゲーム",
  shortDescription: "テスト用ゲーム",
  description: "テスト用のゲームの説明です。",
  difficulty: "初級",
  keywords: ["テスト"],
  statsKey: "test-game-stats",
  ogpSubtitle: "テスト",
  publishedAt: "2026-02-13",
  sitemap: { changeFrequency: "daily", priority: 0.8 },
  seo: {
    title: "テストゲーム",
    description: "テスト用のゲームの説明です。",
    keywords: ["テスト", "ゲーム"],
    ogTitle: "テストゲーム",
    ogDescription: "テスト用ゲーム",
  },
  summary: "今日の字を6回までに当てる",
};

const mockMetaFull: GameMeta = {
  ...mockMeta,
  legend: {
    name: "盤の印の意味",
    entries: [
      { mark: "◯", meaning: "一致" },
      { mark: "△", meaning: "近い" },
      { mark: "×", meaning: "不一致" },
    ],
  },
  faq: [
    {
      question: "テスト質問？",
      answer: "テスト回答です。",
    },
  ],
  relatedGameSlugs: [],
};

test("GameLayout renders breadcrumb with game title", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Game content</div>
    </GameLayout>,
  );
  expect(
    screen.getByRole("navigation", { name: "パンくずリスト" }),
  ).toBeInTheDocument();
  const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
  expect(within(breadcrumb).getByText("テストゲーム")).toBeInTheDocument();
});

test("GameLayout のパンくずの2つ目は、遊びの一覧へ戻る「遊び」", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Game content</div>
    </GameLayout>,
  );
  const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
  expect(
    within(breadcrumb).getByRole("link", { name: "遊び" }),
  ).toHaveAttribute("href", "/play");
});

test("GameLayout renders children", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Game content here</div>
    </GameLayout>,
  );
  expect(screen.getByText("Game content here")).toBeInTheDocument();
});

test("h1 はゲーム名で、パンくずのあとに h1・要約・凡例の順に並ぶ", () => {
  render(
    <GameLayout meta={mockMetaFull}>
      <div>Content</div>
    </GameLayout>,
  );
  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading).toHaveTextContent("テストゲーム");
  const summary = screen.getByText("今日の字を6回までに当てる");
  const legend = screen.getByRole("list", { name: "盤の印の意味" });
  const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
  const following = (a: Element, b: Element) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
  expect(following(breadcrumb, heading)).toBeTruthy();
  expect(following(heading, summary)).toBeTruthy();
  expect(following(summary, legend)).toBeTruthy();
});

test("凡例は名前を持ち、印と意味の語を legend の順に並べる", () => {
  render(
    <GameLayout meta={mockMetaFull}>
      <div>Content</div>
    </GameLayout>,
  );
  const legend = screen.getByRole("list", { name: "盤の印の意味" });
  const items = within(legend).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "◯一致",
    "△近い",
    "×不一致",
  ]);
});

test("凡例の印は読み上げから外し、意味の語だけを読ませる", () => {
  render(
    <GameLayout meta={mockMetaFull}>
      <div>Content</div>
    </GameLayout>,
  );
  const legend = screen.getByRole("list", { name: "盤の印の意味" });
  for (const mark of ["◯", "△", "×"]) {
    expect(within(legend).getByText(mark)).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  }
  expect(
    within(legend)
      .getAllByRole("listitem")
      .map((item) =>
        [...item.childNodes]
          .filter(
            (node) =>
              !(
                node instanceof Element &&
                node.getAttribute("aria-hidden") === "true"
              ),
          )
          .map((node) => node.textContent)
          .join(""),
      ),
  ).toEqual(["一致", "近い", "不一致"]);
});

test("印を持たない項目は意味の語だけを置く", () => {
  render(
    <GameLayout
      meta={{
        ...mockMeta,
        legend: {
          name: "盤の数の意味",
          entries: [
            { meaning: "グループの難易度1（易しい）〜4（とても難しい）" },
          ],
        },
      }}
    >
      <div>Content</div>
    </GameLayout>,
  );
  const items = within(
    screen.getByRole("list", { name: "盤の数の意味" }),
  ).getAllByRole("listitem");
  expect(items.map((item) => item.innerHTML)).toEqual([
    "グループの難易度1（易しい）〜4（とても難しい）",
  ]);
});

test("凡例を持たないゲームは凡例を描かない", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.getByText("今日の字を6回までに当てる")).toBeInTheDocument();
  expect(
    screen.queryByRole("list", { name: "盤の印の意味" }),
  ).not.toBeInTheDocument();
});

test("GameLayout renders FAQ section when provided", () => {
  render(
    <GameLayout meta={mockMetaFull}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.getByRole("region", { name: "FAQ" })).toBeInTheDocument();
  expect(screen.getByText("テスト質問？")).toBeInTheDocument();
});

test("GameLayout does not render FAQ when not provided", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.queryByRole("region", { name: "FAQ" })).not.toBeInTheDocument();
});

test("GameLayout renders share section with game-specific text", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "このゲームを勧める",
    }),
  ).toBeInTheDocument();
});

test("GameLayout renders attribution when provided", () => {
  render(
    <GameLayout meta={mockMeta} attribution={<p>テスト帰属表示</p>}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.getByText("テスト帰属表示")).toBeInTheDocument();
});

test("GameLayout does not render attribution when not provided", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  // No footer with attribution should exist
  const article = screen.getByRole("article");
  expect(article.querySelector("footer")).not.toBeInTheDocument();
});

test("ゲーム本体の区画は「ゲーム」という名前を持つ", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.getByRole("region", { name: "ゲーム" })).toBeInTheDocument();
});

test("GameLayout renders RecommendedContent with meta.slug", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  // RecommendedContent のモックが currentSlug=meta.slug で呼ばれることを確認
  expect(screen.getByText("RecommendedContent:test-game")).toBeInTheDocument();
});

test("見出しは文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Game content</div>
    </GameLayout>,
  );
  const headings: string[][] = [["この", "ゲームを", "勧める"]];
  for (const phrases of headings) {
    expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    const heading = screen.getByRole("heading", { name: phrases.join("") });
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  }
});
