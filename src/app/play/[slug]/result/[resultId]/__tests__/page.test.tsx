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
    [
      "contrarian-fortune",
      {
        meta: {
          title: "逆張り運勢診断",
          shortDescription: "占いの常識を裏切る逆張り運勢タイプを診断",
          type: "personality",
          questionCount: 8,
          accentColor: "#f59e0b",
          category: "personality",
        },
        results: [
          {
            id: "typeA",
            title: "逆オプティミスト",
            description: "説明テキスト",
            icon: "🔄",
            detailedContent: {
              variant: "contrarian-fortune" as const,
              catchphrase: "キャッチコピーテキスト",
              coreSentence: "核心の一文テキスト",
              behaviors: ["あるある1", "あるある2"],
              persona: "人物像テキスト",
              thirdPartyNote: "第三者向けテキスト",
              humorMetrics: [
                { label: "逆張り指数", value: "93%" },
                { label: "天邪鬼度", value: "高い" },
              ],
            },
          },
          {
            id: "typeB",
            title: "考えすぎ予報士",
            description: "タイプBの説明",
            icon: "🌧️",
            detailedContent: {
              variant: "contrarian-fortune" as const,
              catchphrase: "タイプBのキャッチコピー",
              coreSentence: "タイプBの核心の一文",
              behaviors: ["タイプBあるある1"],
              persona: "タイプBの人物像",
              thirdPartyNote: "タイプBの第三者向けテキスト",
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
    "contrarian-fortune",
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

describe("PlayQuizResultPage contrarian-fortune variant", () => {
  it("catchphraseがh1タイトルの直下にサブタイトルとして表示される", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("キャッチコピーテキスト")).toBeInTheDocument();
  });

  it("coreSentenceが表示される", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("核心の一文テキスト")).toBeInTheDocument();
  });

  it("behaviorセクションの見出しが「このタイプの人、こんなことしてませんか？」になる", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(
      screen.getByText("このタイプの人、こんなことしてませんか？"),
    ).toBeInTheDocument();
  });

  it("behaviorsの各項目が表示される", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("あるある1")).toBeInTheDocument();
    expect(screen.getByText("あるある2")).toBeInTheDocument();
  });

  it("personaテキストが表示される", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("人物像テキスト")).toBeInTheDocument();
  });

  it("thirdPartyNoteセクションの見出しが「このタイプの人と一緒にいると」になる", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(
      screen.getByText("このタイプの人と一緒にいると"),
    ).toBeInTheDocument();
  });

  it("thirdPartyNoteテキストが表示される", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("第三者向けテキスト")).toBeInTheDocument();
  });

  it("humorMetricsが存在する場合にラベルと値が表示される", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("逆張り指数")).toBeInTheDocument();
    expect(screen.getByText("93%")).toBeInTheDocument();
    expect(screen.getByText("天邪鬼度")).toBeInTheDocument();
    expect(screen.getByText("高い")).toBeInTheDocument();
  });

  it("humorMetricsが存在しない場合はテーブルが表示されない", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeB",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    // typeB には humorMetrics がないため、typeA固有のラベルは存在しない
    expect(screen.queryByText("逆張り指数")).not.toBeInTheDocument();
  });

  it("全タイプ一覧セクションが表示される", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    // 全タイプの名前が一覧に表示される（h1と一覧の両方に出るため getAllByText）
    expect(
      screen.getAllByText("逆オプティミスト").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("考えすぎ予報士")).toBeInTheDocument();
  });

  it("全タイプ一覧に「あなたのタイプはどれ？」CTAが表示される", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("あなたのタイプはどれ？")).toBeInTheDocument();
  });

  it("CTA1（description直後のボタン）が表示されず、CTAは全タイプ一覧セクション内に移動している", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    // 全タイプ一覧セクション内のCTAとして「あなたのタイプはどれ？」が表示される
    expect(screen.getByText("あなたのタイプはどれ？")).toBeInTheDocument();
    // tryCostはallTypesSection内に存在する（CTA1ではなくCTA-hとして表示）
    expect(screen.getByText("全8問 / 登録不要")).toBeInTheDocument();
  });

  it("DescriptionExpanderが使われない（descriptionがページ上に表示されない）", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    // description テキストは表示されない
    expect(
      screen.queryByTestId("description-expander"),
    ).not.toBeInTheDocument();
  });

  it("ShareButtonsが中間位置（あるある直後）に配置される", async () => {
    const params = Promise.resolve({
      slug: "contrarian-fortune",
      resultId: "typeA",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    // ShareButtonsが複数あることを確認（中間 + 末尾）
    const shareButtons = screen.getAllByTestId("share-buttons");
    expect(shareButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("標準variantのdetailedContentには影響しない（traits/behaviors/adviceが表示される）", async () => {
    const params = Promise.resolve({
      slug: "personality-with-detailed",
      resultId: "result-detail",
    });
    const page = await PlayQuizResultPage({ params });
    render(page);

    expect(screen.getByText("特徴1")).toBeInTheDocument();
    expect(screen.getByText("あるある1")).toBeInTheDocument();
    expect(screen.getByText("アドバイステキスト")).toBeInTheDocument();
  });
});
