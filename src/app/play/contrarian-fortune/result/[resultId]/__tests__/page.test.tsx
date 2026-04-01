import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ContrarianFortuneResultPage from "../page";

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

// Mock ResultPageShell: childrenを透過的にレンダリングするmock
vi.mock("@/play/quiz/_components/ResultPageShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="result-page-shell">{children}</div>
  ),
}));

// Mock getResultIdsForQuiz
vi.mock("@/play/quiz/registry", () => ({
  getResultIdsForQuiz: vi.fn(() => ["reverseoptimist", "typeB"]),
}));

// Mock contrarian-fortune quiz data
vi.mock("@/play/quiz/data/contrarian-fortune", () => ({
  default: {
    meta: {
      title: "逆張り運勢診断",
      slug: "contrarian-fortune",
      shortDescription: "占いの常識を裏切る逆張り運勢タイプを診断",
      type: "personality",
      questionCount: 8,
      accentColor: "#f59e0b",
      category: "personality",
    },
    results: [
      {
        id: "reverseoptimist",
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
          humorMetrics: [{ label: "逆張り指数", value: "93%" }],
        },
      },
      {
        id: "typeB",
        title: "タイプB",
        description: "タイプBの説明",
        icon: "🎯",
        detailedContent: {
          variant: "contrarian-fortune" as const,
          catchphrase: "B catchphrase",
          coreSentence: "B core",
          behaviors: ["B1"],
          persona: "B persona",
          thirdPartyNote: "B third party",
        },
      },
    ],
  },
}));

describe("ContrarianFortuneResultPage 基本構造", () => {
  it("ページが正しくレンダリングされること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.getByTestId("result-page-shell")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneResultPage catchphrase", () => {
  it("h1タイトルの直下にキャッチコピーが表示されること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("キャッチコピーテキスト")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneResultPage coreSentence", () => {
  it("核心の一文が表示されること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("核心の一文テキスト")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneResultPage behaviors", () => {
  it("あるあるの各項目が表示されること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("あるある1")).toBeInTheDocument();
    expect(screen.getByText("あるある2")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneResultPage persona", () => {
  it("人物像テキストが表示されること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("人物像テキスト")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneResultPage thirdPartyNote", () => {
  it("第三者向けテキストが表示されること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("第三者向けテキスト")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneResultPage humorMetrics", () => {
  it("笑い指標が存在する場合に表示されること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("逆張り指数")).toBeInTheDocument();
    expect(screen.getByText("93%")).toBeInTheDocument();
  });

  it("笑い指標が存在しない場合はテーブルが表示されないこと", async () => {
    const params = Promise.resolve({ resultId: "typeB" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

describe("ContrarianFortuneResultPage 全タイプ一覧", () => {
  it("全タイプが一覧表示されること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("逆オプティミスト")).toBeInTheDocument();
    expect(screen.getByText("タイプB")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneResultPage CTA", () => {
  it("診断ボタンが表示されること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(
      screen.getByText("あなたはどのタイプ? 診断してみよう"),
    ).toBeInTheDocument();
  });

  it("問数と登録不要のテキストが表示されること", async () => {
    const params = Promise.resolve({ resultId: "reverseoptimist" });
    const page = await ContrarianFortuneResultPage({ params });
    render(page);

    expect(screen.getByText("全8問 / 登録不要")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneResultPage resultIdが不正な場合", () => {
  it("notFound()が呼ばれること", async () => {
    const params = Promise.resolve({ resultId: "invalid-id" });

    await expect(ContrarianFortuneResultPage({ params })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
