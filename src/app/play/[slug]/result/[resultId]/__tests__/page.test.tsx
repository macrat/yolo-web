import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PlayQuizResultPage from "../page";

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

// Mock CompatibilityDisplay
vi.mock("../CompatibilityDisplay", () => ({
  default: () => <div data-testid="compatibility-display" />,
}));

// Mock extractWithParam
vi.mock("../extractWithParam", () => ({
  extractWithParam: vi.fn(() => undefined),
}));

// Mock DescriptionExpander
vi.mock("../DescriptionExpander", () => ({
  default: ({ description }: { description: string; isLong: boolean }) => (
    <p data-testid="description-expander">{description}</p>
  ),
}));

// Mock ResultPageShell: childrenとafterShareを描画する透過的なwrapper
vi.mock("@/play/quiz/_components/ResultPageShell", () => ({
  default: ({
    quiz,
    children,
    afterShare,
  }: {
    quiz: {
      meta: {
        title: string;
        shortDescription: string;
        type: string;
        questionCount: number;
        accentColor: string;
        category: string;
      };
    };
    result: { id: string; title: string; description: string; icon?: string };
    children: React.ReactNode;
    shareText: string;
    shareUrl: string;
    afterShare?: React.ReactNode;
  }) => (
    <div data-testid="result-page-shell">
      <p>{quiz.meta.title}の結果</p>
      <p>{quiz.meta.shortDescription}</p>
      {children}
      {afterShare}
      <div data-testid="share-buttons" />
    </div>
  ),
}));

// Mock registry
vi.mock("@/play/quiz/registry", () => ({
  quizBySlug: new Map([
    [
      "knowledge-quiz",
      {
        meta: {
          title: "知識クイズ",
          shortDescription: "知識クイズの短い説明",
          type: "knowledge",
          questionCount: 10,
          accentColor: "#FF0000",
          category: "general",
        },
        results: [
          {
            id: "result-a",
            title: "Aタイプ",
            description: "Aタイプの説明",
            icon: "A",
          },
        ],
      },
    ],
    [
      "personality-quiz",
      {
        meta: {
          title: "性格診断",
          shortDescription: "性格診断の短い説明",
          type: "personality",
          questionCount: 8,
          accentColor: "#0000FF",
          category: "personality",
        },
        results: [
          {
            id: "result-x",
            title: "Xタイプ",
            description: "Xタイプの説明",
            icon: "X",
          },
        ],
      },
    ],
    [
      "personality-with-detailed",
      {
        meta: {
          title: "詳細診断",
          shortDescription: "詳細診断の短い説明",
          type: "personality",
          questionCount: 5,
          accentColor: "#00FF00",
          category: "personality",
        },
        results: [
          {
            id: "result-detail",
            title: "詳細タイプ",
            description: "詳細タイプの説明",
            icon: "D",
            detailedContent: {
              traits: ["特徴1", "特徴2"],
              behaviors: ["あるある1", "あるある2"],
              advice: "アドバイステキスト",
            },
          },
        ],
      },
    ],
  ]),
  getAllQuizSlugs: vi.fn(() => [
    "knowledge-quiz",
    "personality-quiz",
    "personality-with-detailed",
  ]),
  getResultIdsForQuiz: vi.fn(() => ["result-a"]),
}));

// Mock music-personality
vi.mock("@/play/quiz/data/music-personality", () => ({
  getCompatibility: vi.fn(() => undefined),
}));

// Mock character-personality
vi.mock("@/play/quiz/data/character-personality", () => ({
  getCompatibility: vi.fn(() => undefined),
  default: { results: [] },
}));

describe("PlayQuizResultPage CTA", () => {
  it("knowledge タイプのクイズでは「あなたも挑戦してみよう」と表示する", async () => {
    const params = Promise.resolve({
      slug: "knowledge-quiz",
      resultId: "result-a",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("あなたも挑戦してみよう")).toBeInTheDocument();
  });

  it("personality タイプのクイズでは「あなたはどのタイプ? 診断してみよう」と表示する", async () => {
    const params = Promise.resolve({
      slug: "personality-quiz",
      resultId: "result-x",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(
      screen.getByText("あなたはどのタイプ? 診断してみよう"),
    ).toBeInTheDocument();
  });

  it("knowledge クイズでコスト感テキストが表示される（問数と登録不要）", async () => {
    const params = Promise.resolve({
      slug: "knowledge-quiz",
      resultId: "result-a",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("全10問 / 登録不要")).toBeInTheDocument();
  });

  it("personality クイズでコスト感テキストが表示される（問数と登録不要）", async () => {
    const params = Promise.resolve({
      slug: "personality-quiz",
      resultId: "result-x",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("全8問 / 登録不要")).toBeInTheDocument();
  });

  it("旧来のCTAテキスト「あなたも挑戦してみる?」は表示されない", async () => {
    const params = Promise.resolve({
      slug: "knowledge-quiz",
      resultId: "result-a",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.queryByText("あなたも挑戦してみる?")).not.toBeInTheDocument();
  });
});

describe("PlayQuizResultPage コンテキスト表示", () => {
  it("shortDescriptionがクイズ名と共に表示される", async () => {
    const params = Promise.resolve({
      slug: "knowledge-quiz",
      resultId: "result-a",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("知識クイズの短い説明")).toBeInTheDocument();
  });
});

describe("PlayQuizResultPage CTA2", () => {
  it("detailedContentがある場合はCTA2が表示される", async () => {
    const params = Promise.resolve({
      slug: "personality-with-detailed",
      resultId: "result-detail",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    // CTAテキストが複数存在する（CTA1 + CTA2）
    const ctaElements =
      screen.getAllByText("あなたはどのタイプ? 診断してみよう");
    expect(ctaElements.length).toBeGreaterThanOrEqual(2);
  });

  it("detailedContentがない場合はCTA2が表示されない", async () => {
    const params = Promise.resolve({
      slug: "personality-quiz",
      resultId: "result-x",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    // CTAテキストが1つだけ存在する（CTA1のみ）
    const ctaElements =
      screen.queryAllByText("あなたはどのタイプ? 診断してみよう");
    expect(ctaElements.length).toBe(1);
  });
});

describe("PlayQuizResultPage detailedContent見出し", () => {
  it("resultPageLabelsが未設定の場合はデフォルト見出しが表示される", async () => {
    const params = Promise.resolve({
      slug: "personality-with-detailed",
      resultId: "result-detail",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("このタイプの特徴")).toBeInTheDocument();
    expect(screen.getByText("このタイプのあるある")).toBeInTheDocument();
    expect(
      screen.getByText("このタイプの人へのアドバイス"),
    ).toBeInTheDocument();
  });
});
