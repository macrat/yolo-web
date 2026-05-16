/**
 * Tests for PlayContentTabs component.
 *
 * PlayContentTabs is a Client Component that:
 * - Renders 4 tabs: すべて / 診断 / 知識 / ゲーム
 * - "すべて" tab shows defaultContents (6件) by default
 * - "すべて" tab has "もっと見る" button that expands to show all contents
 * - Category tabs filter allContents by category and show all matches
 * - Tab switch resets the expanded state
 * - Renders content cards with proper links and labels
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlayContentTabs from "../PlayContentTabs";
import type { PlayContentMeta } from "@/play/types";

/** テスト用のコンテンツを作るヘルパー */
function makeContent(
  overrides: Partial<PlayContentMeta> & {
    slug: string;
    category: PlayContentMeta["category"];
  },
): PlayContentMeta {
  return {
    title: `タイトル-${overrides.slug}`,
    shortTitle: undefined,
    description: `説明-${overrides.slug}`,
    shortDescription: `短い説明-${overrides.slug}`,
    icon: "🎯",
    accentColor: "#6c3bea",
    keywords: [],
    publishedAt: "2026-01-01T00:00:00+09:00",
    updatedAt: undefined,
    contentType: "quiz",
    ...overrides,
  };
}

/**
 * 全コンテンツ: personality×5, knowledge×5, game×5, 計15件。
 * allContents は fortune を除く全件を想定するため fortune は含めない。
 */
const makeAllContents = (): PlayContentMeta[] => [
  makeContent({
    slug: "p1",
    category: "personality",
    publishedAt: "2026-03-01T00:00:00+09:00",
  }),
  makeContent({
    slug: "p2",
    category: "personality",
    publishedAt: "2026-02-01T00:00:00+09:00",
  }),
  makeContent({
    slug: "p3",
    category: "personality",
    publishedAt: "2026-01-15T00:00:00+09:00",
  }),
  makeContent({
    slug: "p4",
    category: "personality",
    publishedAt: "2026-01-10T00:00:00+09:00",
  }),
  makeContent({
    slug: "p5",
    category: "personality",
    publishedAt: "2026-01-05T00:00:00+09:00",
  }),
  makeContent({
    slug: "k1",
    category: "knowledge",
    publishedAt: "2026-03-05T00:00:00+09:00",
  }),
  makeContent({
    slug: "k2",
    category: "knowledge",
    publishedAt: "2026-02-20T00:00:00+09:00",
  }),
  makeContent({
    slug: "k3",
    category: "knowledge",
    publishedAt: "2026-01-20T00:00:00+09:00",
  }),
  makeContent({
    slug: "k4",
    category: "knowledge",
    publishedAt: "2026-01-12T00:00:00+09:00",
  }),
  makeContent({
    slug: "k5",
    category: "knowledge",
    publishedAt: "2026-01-02T00:00:00+09:00",
  }),
  makeContent({
    slug: "g1",
    category: "game",
    contentType: "game",
    publishedAt: "2026-03-10T00:00:00+09:00",
  }),
  makeContent({
    slug: "g2",
    category: "game",
    contentType: "game",
    publishedAt: "2026-02-15T00:00:00+09:00",
  }),
  makeContent({
    slug: "g3",
    category: "game",
    contentType: "game",
    publishedAt: "2026-01-25T00:00:00+09:00",
  }),
  makeContent({
    slug: "g4",
    category: "game",
    contentType: "game",
    publishedAt: "2026-01-08T00:00:00+09:00",
  }),
  makeContent({
    slug: "g5",
    category: "game",
    contentType: "game",
    publishedAt: "2026-01-01T00:00:00+09:00",
  }),
];

/** defaultContents: 全15件のうち最新6件 */
const makeDefaultContents = (all: PlayContentMeta[]): PlayContentMeta[] =>
  [...all]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 6);

describe("PlayContentTabs", () => {
  const allContents = makeAllContents();
  const defaultContents = makeDefaultContents(allContents);
  const questionCountBySlug = new Map<string, number>([
    ["k1", 10],
    ["k2", 15],
  ]);
  const dailyUpdateSlugs: ReadonlySet<string> = new Set(["p1"]);

  const renderComponent = () =>
    render(
      <PlayContentTabs
        allContents={allContents}
        defaultContents={defaultContents}
        questionCountBySlug={questionCountBySlug}
        dailyUpdateSlugs={dailyUpdateSlugs}
      />,
    );

  describe("タブバー", () => {
    it("4つのタブが表示される", () => {
      renderComponent();
      expect(screen.getByRole("tab", { name: "すべて" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "診断" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "知識" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "ゲーム" })).toBeInTheDocument();
    });

    it("tablistにaria-labelが設定されている", () => {
      renderComponent();
      expect(
        screen.getByRole("tablist", { name: "コンテンツカテゴリ" }),
      ).toBeInTheDocument();
    });

    it("デフォルトで「すべて」タブがアクティブ", () => {
      renderComponent();
      const allTab = screen.getByRole("tab", { name: "すべて" });
      expect(allTab).toHaveAttribute("aria-selected", "true");
    });

    it("非アクティブタブはaria-selected=false", () => {
      renderComponent();
      expect(screen.getByRole("tab", { name: "診断" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(screen.getByRole("tab", { name: "知識" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(screen.getByRole("tab", { name: "ゲーム" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });
  });

  describe("「すべて」タブの表示", () => {
    it("デフォルトでdefaultContents（6件）が表示される", () => {
      renderComponent();
      // defaultContents の各コンテンツのアイコンが含むカードリンクが6件あること
      const tabpanel = screen.getByRole("tabpanel");
      const links = tabpanel.querySelectorAll("a");
      expect(links).toHaveLength(6);
    });

    it("「もっと見る」ボタンが表示される（残り件数付き）", () => {
      renderComponent();
      const remaining = allContents.length - defaultContents.length;
      expect(
        screen.getByRole("button", {
          name: new RegExp(`もっと見る.*${remaining}件`),
        }),
      ).toBeInTheDocument();
    });

    it("「もっと見る」クリックで全件表示される", () => {
      renderComponent();
      const button = screen.getByRole("button", { name: /もっと見る/ });
      fireEvent.click(button);
      const tabpanel = screen.getByRole("tabpanel");
      const links = tabpanel.querySelectorAll("a");
      expect(links).toHaveLength(allContents.length);
    });

    it("展開後は「もっと見る」ボタンが消える", () => {
      renderComponent();
      const button = screen.getByRole("button", { name: /もっと見る/ });
      fireEvent.click(button);
      expect(screen.queryByRole("button", { name: /もっと見る/ })).toBeNull();
    });
  });

  describe("カテゴリタブでのフィルタリング", () => {
    it("「診断」タブで personality コンテンツのみ表示", () => {
      renderComponent();
      fireEvent.click(screen.getByRole("tab", { name: "診断" }));
      const tabpanel = screen.getByRole("tabpanel");
      const links = tabpanel.querySelectorAll("a");
      const personalityCount = allContents.filter(
        (c) => c.category === "personality",
      ).length;
      expect(links).toHaveLength(personalityCount);
    });

    it("「知識」タブで knowledge コンテンツのみ表示", () => {
      renderComponent();
      fireEvent.click(screen.getByRole("tab", { name: "知識" }));
      const tabpanel = screen.getByRole("tabpanel");
      const links = tabpanel.querySelectorAll("a");
      const knowledgeCount = allContents.filter(
        (c) => c.category === "knowledge",
      ).length;
      expect(links).toHaveLength(knowledgeCount);
    });

    it("「ゲーム」タブで game コンテンツのみ表示", () => {
      renderComponent();
      fireEvent.click(screen.getByRole("tab", { name: "ゲーム" }));
      const tabpanel = screen.getByRole("tabpanel");
      const links = tabpanel.querySelectorAll("a");
      const gameCount = allContents.filter((c) => c.category === "game").length;
      expect(links).toHaveLength(gameCount);
    });

    it("カテゴリタブに「もっと見る」ボタンは表示されない", () => {
      renderComponent();
      fireEvent.click(screen.getByRole("tab", { name: "診断" }));
      expect(screen.queryByRole("button", { name: /もっと見る/ })).toBeNull();
    });
  });

  describe("タブ切り替え時の状態リセット", () => {
    it("「もっと見る」展開後に別タブへ切り替え、「すべて」に戻ると折りたたまれた状態に戻る", () => {
      renderComponent();
      // まず展開
      fireEvent.click(screen.getByRole("button", { name: /もっと見る/ }));
      // 「診断」タブへ切り替え
      fireEvent.click(screen.getByRole("tab", { name: "診断" }));
      // 「すべて」タブへ戻る
      fireEvent.click(screen.getByRole("tab", { name: "すべて" }));
      // 折りたたまれた状態（6件）に戻っていること
      const tabpanel = screen.getByRole("tabpanel");
      const links = tabpanel.querySelectorAll("a");
      expect(links).toHaveLength(6);
    });
  });

  describe("カードのレンダリング", () => {
    it("dailyUpdateSlugsに含まれるコンテンツに「毎日更新」バッジが表示される", () => {
      renderComponent();
      expect(screen.getByText("毎日更新")).toBeInTheDocument();
    });

    it("questionCountBySlugにエントリがある場合、問数が表示される", () => {
      renderComponent();
      // 「すべて」デフォルト6件に k1 が含まれる場合、問数が表示されること
      // k1 は publishedAt: 2026-03-05 で上位6件に含まれる
      expect(screen.getByText("10問")).toBeInTheDocument();
    });

    it("knowledge カテゴリのCTAテキストは「挑戦する」", () => {
      renderComponent();
      fireEvent.click(screen.getByRole("tab", { name: "知識" }));
      const ctaElements = screen.getAllByText("挑戦する");
      expect(ctaElements.length).toBeGreaterThan(0);
    });

    it("personality カテゴリのCTAテキストは「診断する」", () => {
      renderComponent();
      fireEvent.click(screen.getByRole("tab", { name: "診断" }));
      const ctaElements = screen.getAllByText("診断する");
      expect(ctaElements.length).toBeGreaterThan(0);
    });

    it("game カテゴリのCTAテキストは「遊ぶ」", () => {
      renderComponent();
      fireEvent.click(screen.getByRole("tab", { name: "ゲーム" }));
      const ctaElements = screen.getAllByText("遊ぶ");
      expect(ctaElements.length).toBeGreaterThan(0);
    });
  });

  describe("アクセシビリティ", () => {
    it("コンテンツエリアはtabpanelロールを持つ", () => {
      renderComponent();
      expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    });

    it("アクティブタブ切り替え後にaria-selectedが更新される", () => {
      renderComponent();
      const diagTab = screen.getByRole("tab", { name: "診断" });
      fireEvent.click(diagTab);
      expect(diagTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tab", { name: "すべて" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });
  });
});
