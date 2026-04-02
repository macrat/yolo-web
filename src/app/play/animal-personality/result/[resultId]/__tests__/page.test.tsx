import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AnimalPersonalityResultPage from "../page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock Breadcrumb
vi.mock("@/components/common/Breadcrumb", () => ({
  default: () => <nav data-testid="breadcrumb" />,
}));

// Mock ShareButtons
vi.mock("@/play/quiz/_components/ShareButtons", () => ({
  default: () => <div data-testid="share-buttons" />,
}));

// Mock RelatedQuizzes
vi.mock("@/play/quiz/_components/RelatedQuizzes", () => ({
  default: () => <div data-testid="related-quizzes" />,
}));

// Mock RecommendedContent
vi.mock("@/play/_components/RecommendedContent", () => ({
  default: () => <div data-testid="recommended-content" />,
}));

// Mock DescriptionExpander
vi.mock("@/app/play/[slug]/result/[resultId]/DescriptionExpander", () => ({
  default: ({ description }: { description: string }) => (
    <p data-testid="description-expander">{description}</p>
  ),
}));

// Mock CompatibilityDisplay
vi.mock("@/app/play/[slug]/result/[resultId]/CompatibilityDisplay", () => ({
  default: () => <div data-testid="compatibility-display" />,
}));

// Mock ResultPageShell: childrenを透過的にレンダリングするmock
vi.mock("@/play/quiz/_components/ResultPageShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="result-page-shell">{children}</div>
  ),
}));

// Mock animal-personality quiz data
vi.mock("@/play/quiz/data/animal-personality", () => ({
  getCompatibility: vi.fn(() => ({
    label: "テスト相性",
    description: "テスト相性の説明",
  })),
  isValidAnimalTypeId: vi.fn((id: string) =>
    ["nihon-zaru", "hondo-tanuki"].includes(id),
  ),
  default: {
    meta: {
      title: "動物性格診断",
      slug: "animal-personality",
      shortDescription: "日本にしかいない動物12タイプで性格診断",
      type: "personality",
      questionCount: 10,
      accentColor: "#16a34a",
      category: "personality",
    },
    results: [
      {
        id: "nihon-zaru",
        title: "ニホンザル -- 温泉を発明した革命児",
        description: "ニホンザルの説明テキスト。",
        icon: "🐒",
        detailedContent: {
          variant: "animal-personality" as const,
          catchphrase: "テストキャッチコピー",
          strengths: ["強み1", "強み2"],
          weaknesses: ["弱み1", "弱み2"],
          behaviors: [
            "行動パターン1",
            "行動パターン2",
            "行動パターン3",
            "行動パターン4",
          ],
          todayAction: "今日のアクションテキスト",
        },
      },
      {
        id: "hondo-tanuki",
        title: "ホンドタヌキ -- 化かすどころか化かされる愛されキャラ",
        description: "ホンドタヌキの説明テキスト。",
        icon: "🦡",
        detailedContent: {
          variant: "animal-personality" as const,
          catchphrase: "タヌキキャッチコピー",
          strengths: ["タヌキ強み1"],
          weaknesses: ["タヌキ弱み1"],
          behaviors: [
            "タヌキ行動1",
            "タヌキ行動2",
            "タヌキ行動3",
            "タヌキ行動4",
          ],
          todayAction: "タヌキのアクション",
        },
      },
    ],
  },
}));

// Mock registry
vi.mock("@/play/quiz/registry", () => ({
  getResultIdsForQuiz: vi.fn(() => ["nihon-zaru", "hondo-tanuki"]),
}));

describe("AnimalPersonalityResultPage 基本構造", () => {
  it("ページが正しくレンダリングされること", async () => {
    const params = Promise.resolve({ resultId: "nihon-zaru" });
    const page = await AnimalPersonalityResultPage({ params });
    render(page);

    expect(screen.getByTestId("result-page-shell")).toBeInTheDocument();
  });
});

describe("AnimalPersonalityResultPage catchphrase", () => {
  it("キャッチコピーが表示されること", async () => {
    const params = Promise.resolve({ resultId: "nihon-zaru" });
    const page = await AnimalPersonalityResultPage({ params });
    render(page);

    expect(screen.getByText("テストキャッチコピー")).toBeInTheDocument();
  });
});

describe("AnimalPersonalityResultPage CTA1", () => {
  it("最初のCTAボタンが表示されること", async () => {
    const params = Promise.resolve({ resultId: "nihon-zaru" });
    const page = await AnimalPersonalityResultPage({ params });
    render(page);

    const ctaButtons =
      screen.getAllByText("あなたはどのタイプ? 診断してみよう");
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
  });
});

describe("AnimalPersonalityResultPage strengths/weaknesses", () => {
  it("強みが表示されること", async () => {
    const params = Promise.resolve({ resultId: "nihon-zaru" });
    const page = await AnimalPersonalityResultPage({ params });
    render(page);

    expect(screen.getByText("強み1")).toBeInTheDocument();
    expect(screen.getByText("強み2")).toBeInTheDocument();
  });

  it("弱みが表示されること", async () => {
    const params = Promise.resolve({ resultId: "nihon-zaru" });
    const page = await AnimalPersonalityResultPage({ params });
    render(page);

    expect(screen.getByText("弱み1")).toBeInTheDocument();
    expect(screen.getByText("弱み2")).toBeInTheDocument();
  });
});

describe("AnimalPersonalityResultPage behaviors", () => {
  it("行動パターンの各項目が表示されること", async () => {
    const params = Promise.resolve({ resultId: "nihon-zaru" });
    const page = await AnimalPersonalityResultPage({ params });
    render(page);

    expect(screen.getByText("行動パターン1")).toBeInTheDocument();
    expect(screen.getByText("行動パターン4")).toBeInTheDocument();
  });
});

describe("AnimalPersonalityResultPage todayAction", () => {
  it("今日のアクションが表示されること", async () => {
    const params = Promise.resolve({ resultId: "nihon-zaru" });
    const page = await AnimalPersonalityResultPage({ params });
    render(page);

    expect(screen.getByText("今日のアクションテキスト")).toBeInTheDocument();
  });
});

describe("AnimalPersonalityResultPage 全タイプ一覧", () => {
  it("全タイプが一覧表示されること", async () => {
    const params = Promise.resolve({ resultId: "nihon-zaru" });
    const page = await AnimalPersonalityResultPage({ params });
    render(page);

    expect(
      screen.getByText("ニホンザル -- 温泉を発明した革命児"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("ホンドタヌキ -- 化かすどころか化かされる愛されキャラ"),
    ).toBeInTheDocument();
  });
});

describe("AnimalPersonalityResultPage CTA2", () => {
  it("CTA2テキストリンクが表示されること", async () => {
    const params = Promise.resolve({ resultId: "nihon-zaru" });
    const page = await AnimalPersonalityResultPage({ params });
    render(page);

    // CTA2はテキストリンク形式
    const links = screen.getAllByText("あなたはどのタイプ? 診断してみよう");
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});

describe("AnimalPersonalityResultPage resultIdが不正な場合", () => {
  it("notFound()が呼ばれること", async () => {
    const params = Promise.resolve({ resultId: "invalid-id" });

    await expect(AnimalPersonalityResultPage({ params })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
