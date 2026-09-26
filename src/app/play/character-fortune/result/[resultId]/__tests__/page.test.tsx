import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CharacterFortuneResultPage from "../page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock Breadcrumb
vi.mock("@/components/Breadcrumb", () => ({
  default: () => <nav data-testid="breadcrumb" />,
}));

// Mock ShareButtons
vi.mock("@/components/ShareButtons", () => ({
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

// ResultPageShell は、ページが渡した値（添えた段落・説明・誘い・中身）をそのまま出す部品に替える
vi.mock("@/play/quiz/_components/ResultPageShell", () => ({
  default: ({
    quiz,
    lead,
    description,
    ctaText,
    children,
    afterShare,
  }: {
    quiz: { meta: { questionCount: number } };
    lead?: string;
    description?: string;
    ctaText: string;
    children: React.ReactNode;
    afterShare?: React.ReactNode;
  }) => (
    <div data-testid="result-page-shell">
      {lead && <p>{lead}</p>}
      {description && <p>{description}</p>}
      <a href="#try">{ctaText}</a>
      <p>全{quiz.meta.questionCount}問 / 登録不要</p>
      {children}
      {afterShare}
    </div>
  ),
}));

// Mock character-fortune quiz data
vi.mock("@/play/quiz/data/character-fortune", () => ({
  default: {
    meta: {
      title: "守護キャラ診断",
      slug: "character-fortune",
      shortDescription: "あなたを守護するキャラクターを診断",
      type: "personality",
      questionCount: 10,
      accentColor: "#8b5cf6",
      category: "personality",
    },
    results: [
      {
        id: "commander",
        title: "司令官キャラ",
        description: "司令官の説明",
        icon: "⚔️",
        detailedContent: {
          variant: "character-fortune" as const,
          characterIntro: "自己紹介テキスト",
          behaviorsHeading: "あるある見出し",
          behaviors: ["あるある1", "あるある2"],
          characterMessageHeading: "本音見出し",
          characterMessage: "本音テキスト",
          thirdPartyNote: "第三者向けテキスト",
          compatibilityPrompt: "相性誘導テキスト",
        },
      },
      {
        id: "professor",
        title: "教授キャラ",
        description: "教授の説明",
        icon: "📚",
        detailedContent: {
          variant: "character-fortune" as const,
          characterIntro: "教授の自己紹介",
          behaviorsHeading: "教授のあるある",
          behaviors: ["教授あるある1"],
          characterMessageHeading: "教授の本音",
          characterMessage: "教授の本音テキスト",
          thirdPartyNote: "教授の第三者向け",
          compatibilityPrompt: "教授の相性誘導",
        },
      },
    ],
  },
}));

// Mock registry
vi.mock("@/play/quiz/registry", () => ({
  getResultIdsForQuiz: vi.fn(() => ["commander", "professor"]),
}));

describe("CharacterFortuneResultPage 基本構造", () => {
  it("ページが正しくレンダリングされること", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    expect(screen.getByTestId("result-page-shell")).toBeInTheDocument();
  });
});

describe("CharacterFortuneResultPage characterIntro", () => {
  it("キャラクターの自己紹介が表示されること", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("自己紹介テキスト")).toBeInTheDocument();
  });
});

describe("CharacterFortuneResultPage 最初の誘い", () => {
  it("最初の誘いのボタンが表示されること", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    const ctaButtons =
      screen.getAllByText("あなたはどのタイプ? 診断してみよう");
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
  });
});

describe("CharacterFortuneResultPage behaviors", () => {
  it("あるあるの各項目が表示されること", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("あるある1")).toBeInTheDocument();
    expect(screen.getByText("あるある2")).toBeInTheDocument();
  });
});

describe("CharacterFortuneResultPage characterMessage", () => {
  it("キャラクターの本音が表示されること", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("本音テキスト")).toBeInTheDocument();
  });
});

describe("CharacterFortuneResultPage thirdPartyNote", () => {
  it("第三者向けテキストが表示されること", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("第三者向けテキスト")).toBeInTheDocument();
  });
});

describe("CharacterFortuneResultPage compatibilityPrompt", () => {
  it("相性診断への誘導テキストが表示されること", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("相性誘導テキスト")).toBeInTheDocument();
  });
});

describe("CharacterFortuneResultPage 全タイプ一覧", () => {
  it("全タイプが一覧表示されること", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("司令官キャラ")).toBeInTheDocument();
    expect(screen.getByText("教授キャラ")).toBeInTheDocument();
  });
});

describe("CharacterFortuneResultPage 誘い", () => {
  it("診断ボタンが表示されること", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    // 最初の誘いと、相性の区画の誘いの両方がある
    const ctaButtons =
      screen.getAllByText("あなたはどのタイプ? 診断してみよう");
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);

    // 相性診断ボタンも表示される
    expect(screen.getByText("診断して相性を見てみる")).toBeInTheDocument();
  });
});

describe("CharacterFortuneResultPage resultIdが不正な場合", () => {
  it("notFound()が呼ばれること", async () => {
    const params = Promise.resolve({ resultId: "invalid-id" });

    await expect(CharacterFortuneResultPage({ params })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
