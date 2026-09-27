import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CharacterPersonalityResultPage from "../page";

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

// Mock CompatibilityDisplay
vi.mock("@/app/play/[slug]/result/[resultId]/CompatibilityDisplay", () => ({
  default: () => <div data-testid="compatibility-display" />,
}));

// Mock InviteFriendButton
vi.mock("@/play/quiz/_components/InviteFriendButton", () => ({
  default: () => <button data-testid="invite-friend-button">友達を招待</button>,
}));

// ResultPageShell は、ページが渡した値（添えた段落・誘い・説明・中身）をそのまま出す部品に替える
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
      <a href="#try">{ctaText}</a>
      <p>全{quiz.meta.questionCount}問 / 登録不要</p>
      {description && <p>{description}</p>}
      {children}
      {afterShare}
    </div>
  ),
}));

// Mock CharacterPersonalityContent
vi.mock("@/play/quiz/_components/CharacterPersonalityContent", () => ({
  default: ({
    content,
    resultId,
    afterCharacterMessage,
  }: {
    content: { behaviors: string[]; characterMessage: string };
    resultId: string;
    afterCharacterMessage?: React.ReactNode;
  }) => (
    <div data-testid="character-personality-content" data-result-id={resultId}>
      {content.behaviors.map((b: string, i: number) => (
        <p key={i}>{b}</p>
      ))}
      <p>{content.characterMessage}</p>
      {afterCharacterMessage}
    </div>
  ),
}));

// Mock character-personality quiz data
vi.mock("@/play/quiz/data/character-personality", () => ({
  getCompatibility: vi.fn(() => ({
    label: "テスト相性",
    description: "テスト相性の説明",
  })),
  isValidCharacterPersonalityTypeId: vi.fn((id: string) =>
    ["blazing-strategist", "blazing-poet"].includes(id),
  ),
  CHARACTER_PERSONALITY_TYPE_IDS: ["blazing-strategist", "blazing-poet"],
  default: {
    meta: {
      title: "あなたに似たキャラ診断",
      slug: "character-personality",
      shortDescription: "日常の行動パターン12問から診断",
      type: "personality",
      questionCount: 12,
      accentColor: "#7c3aed",
      category: "personality",
    },
    results: [
      {
        id: "blazing-strategist",
        title: "締切3分前の頭脳司令塔",
        description: "blazing-strategistの説明テキスト。",
        icon: "🔥",
        color: "#ef4444",
        detailedContent: {
          variant: "character-personality" as const,
          catchphrase: "テストキャッチコピー",
          archetypeBreakdown: "アーキタイプ解説テキスト",
          behaviors: [
            "行動パターン1",
            "行動パターン2",
            "行動パターン3",
            "行動パターン4",
          ],
          characterMessage: "キャラからのメッセージ",
        },
      },
      {
        id: "blazing-poet",
        title: "全力疾走の途中で空を見る詩人",
        description: "blazing-poetの説明テキスト。",
        icon: "🌟",
        color: "#f59e0b",
        detailedContent: {
          variant: "character-personality" as const,
          catchphrase: "詩人キャッチコピー",
          archetypeBreakdown: "詩人アーキタイプ解説",
          behaviors: ["詩人行動1", "詩人行動2", "詩人行動3", "詩人行動4"],
          characterMessage: "詩人からのメッセージ",
        },
      },
    ],
  },
}));

// Mock registry
vi.mock("@/play/quiz/registry", () => ({
  getResultIdsForQuiz: vi.fn(() => ["blazing-strategist", "blazing-poet"]),
}));

describe("CharacterPersonalityResultPage 基本構造", () => {
  it("ページが正しくレンダリングされること", async () => {
    const params = Promise.resolve({ resultId: "blazing-strategist" });
    const page = await CharacterPersonalityResultPage({ params });
    render(page);

    expect(screen.getByTestId("result-page-shell")).toBeInTheDocument();
  });
});

describe("CharacterPersonalityResultPage catchphrase", () => {
  it("キャッチコピーが表示されること", async () => {
    const params = Promise.resolve({ resultId: "blazing-strategist" });
    const page = await CharacterPersonalityResultPage({ params });
    render(page);

    expect(screen.getByText("テストキャッチコピー")).toBeInTheDocument();
  });
});

describe("CharacterPersonalityResultPage 最初の誘い", () => {
  it("最初の誘いのボタンが表示されること", async () => {
    const params = Promise.resolve({ resultId: "blazing-strategist" });
    const page = await CharacterPersonalityResultPage({ params });
    render(page);

    const ctaButtons =
      screen.getAllByText("あなたはどのタイプ? 診断してみよう");
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
  });
});

describe("CharacterPersonalityResultPage behaviors", () => {
  it("行動パターンの各項目が表示されること", async () => {
    const params = Promise.resolve({ resultId: "blazing-strategist" });
    const page = await CharacterPersonalityResultPage({ params });
    render(page);

    expect(screen.getByText("行動パターン1")).toBeInTheDocument();
    expect(screen.getByText("行動パターン4")).toBeInTheDocument();
  });
});

describe("CharacterPersonalityResultPage characterMessage", () => {
  it("キャラからのメッセージが表示されること", async () => {
    const params = Promise.resolve({ resultId: "blazing-strategist" });
    const page = await CharacterPersonalityResultPage({ params });
    render(page);

    expect(screen.getByText("キャラからのメッセージ")).toBeInTheDocument();
  });
});

describe("CharacterPersonalityResultPage 読み終えた人への2つ目の誘い", () => {
  it("2つ目の誘いのリンクが表示されること", async () => {
    const params = Promise.resolve({ resultId: "blazing-strategist" });
    const page = await CharacterPersonalityResultPage({ params });
    render(page);

    const links = screen.getAllByText("あなたはどのタイプ? 診断してみよう");
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});

describe("CharacterPersonalityResultPage 相性表示（withパラメータあり）", () => {
  it("withパラメータがある場合にCompatibilityDisplayが表示されること", async () => {
    const params = Promise.resolve({ resultId: "blazing-strategist" });
    const searchParams = Promise.resolve({ with: "blazing-poet" });
    const page = await CharacterPersonalityResultPage({ params, searchParams });
    render(page);

    expect(screen.getByTestId("compatibility-display")).toBeInTheDocument();
  });

  it("withパラメータがない場合にCompatibilityDisplayが表示されないこと", async () => {
    const params = Promise.resolve({ resultId: "blazing-strategist" });
    const page = await CharacterPersonalityResultPage({ params });
    render(page);

    expect(
      screen.queryByTestId("compatibility-display"),
    ).not.toBeInTheDocument();
  });
});

describe("CharacterPersonalityResultPage resultIdが不正な場合", () => {
  it("notFound()が呼ばれること", async () => {
    const params = Promise.resolve({ resultId: "invalid-id" });

    await expect(CharacterPersonalityResultPage({ params })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
