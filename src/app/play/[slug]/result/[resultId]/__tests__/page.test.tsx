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

// Mock registry
vi.mock("@/play/quiz/registry", () => ({
  quizBySlug: new Map([
    [
      "knowledge-quiz",
      {
        meta: {
          title: "知識クイズ",
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
  ]),
  getAllQuizSlugs: vi.fn(() => ["knowledge-quiz", "personality-quiz"]),
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
