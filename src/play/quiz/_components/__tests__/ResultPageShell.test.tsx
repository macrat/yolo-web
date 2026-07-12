import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultPageShell from "../ResultPageShell";
import type { QuizDefinition, QuizResult } from "../../types";

// 依存コンポーネントをモックしてテストを安定させる
vi.mock("@/components/common/Breadcrumb", () => ({
  default: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav aria-label="パンくずリスト">
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </nav>
  ),
}));

vi.mock("@/play/quiz/_components/ShareButtons", () => ({
  default: ({
    shareText,
    quizTitle,
  }: {
    shareText: string;
    quizTitle: string;
  }) => (
    <div data-testid="share-buttons">
      <span>{shareText}</span>
      <span>{quizTitle}</span>
    </div>
  ),
}));

vi.mock("@/play/quiz/_components/RelatedQuizzes", () => ({
  default: ({ currentSlug }: { currentSlug: string }) => (
    <nav aria-label="関連コンテンツ">
      <span>related-{currentSlug}</span>
    </nav>
  ),
}));

vi.mock("@/play/_components/RecommendedContent", () => ({
  default: ({ currentSlug }: { currentSlug: string }) => (
    <nav aria-label="おすすめコンテンツ">
      <span>recommended-{currentSlug}</span>
    </nav>
  ),
}));

const mockQuiz: QuizDefinition = {
  meta: {
    slug: "test-quiz",
    title: "テストクイズ",
    description: "テスト用のクイズです",
    shortDescription: "クイズの短い説明",
    type: "personality",
    category: "personality",
    questionCount: 5,
    icon: "🧪",
    accentColor: "#ff5733",
    keywords: ["テスト"],
    publishedAt: "2026-01-01T00:00:00+09:00",
    trustLevel: "generated",
  },
  questions: [],
  results: [],
};

const mockResult: QuizResult = {
  id: "result-a",
  title: "テスト結果タイトル",
  description: "テスト結果の説明",
  icon: "🎯",
  color: "#ff5733",
};

test("ResultPageShell renders quiz title and shortDescription", () => {
  render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  expect(screen.getByText("テストクイズの結果")).toBeInTheDocument();
  expect(screen.getByText("クイズの短い説明")).toBeInTheDocument();
});

test("ResultPageShell renders result title as h1", () => {
  render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveTextContent("テスト結果タイトル");
});

test("ResultPageShell renders the result as a Tsutsumi wrapping when icon+color are provided (no emoji)", () => {
  const { container } = render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  // 結果は Tsutsumi（figure[data-color]）で包まれる（DESIGN.md §4/§7）
  expect(container.querySelector("figure[data-color]")).not.toBeNull();
  // 絵文字（result.icon）は装飾として描画しない（§8-6 絵文字禁止）
  expect(screen.queryByText("🎯")).not.toBeInTheDocument();
});

test("ResultPageShell does not render Tsutsumi when result.icon is undefined (fallback header)", () => {
  const resultWithoutIcon: QuizResult = { ...mockResult, icon: undefined };

  const { container } = render(
    <ResultPageShell
      quiz={mockQuiz}
      result={resultWithoutIcon}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  expect(container.querySelector("figure[data-color]")).toBeNull();
  expect(screen.queryByText("🎯")).not.toBeInTheDocument();
});

test("ResultPageShell renders children", () => {
  render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div data-testid="child-content">子コンテンツ</div>
    </ResultPageShell>,
  );

  expect(screen.getByTestId("child-content")).toBeInTheDocument();
  expect(screen.getByText("子コンテンツ")).toBeInTheDocument();
});

test("ResultPageShell renders ShareButtons with correct props", () => {
  render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  const shareButtons = screen.getByTestId("share-buttons");
  expect(shareButtons).toBeInTheDocument();
  expect(screen.getByText("シェアテキスト")).toBeInTheDocument();
  // ShareButtonsにquizTitleが渡されていることをdata-testid内で確認
  expect(shareButtons).toHaveTextContent("テストクイズ");
});

test("ResultPageShell renders afterShare content when provided", () => {
  render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
      afterShare={<div data-testid="after-share">シェア後コンテンツ</div>}
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  expect(screen.getByTestId("after-share")).toBeInTheDocument();
  expect(screen.getByText("シェア後コンテンツ")).toBeInTheDocument();
});

test("ResultPageShell does not render afterShare when not provided", () => {
  const { container } = render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  // afterShareが未指定のとき余分なDOM要素が存在しない
  expect(container.querySelector("[data-testid='after-share']")).toBeNull();
});

test("ResultPageShell renders breadcrumb with correct items", () => {
  render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
  expect(breadcrumb).toBeInTheDocument();
  // Breadcrumb内のアイテムをwithinで検証して重複テキストの問題を回避
  expect(breadcrumb).toHaveTextContent("ホーム");
  expect(breadcrumb).toHaveTextContent("遊ぶ");
  expect(breadcrumb).toHaveTextContent("テストクイズ");
  expect(breadcrumb).toHaveTextContent("結果");
});

test("ResultPageShell renders RelatedQuizzes with current slug", () => {
  render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  expect(screen.getByText("related-test-quiz")).toBeInTheDocument();
});

test("ResultPageShell renders RecommendedContent with current slug", () => {
  render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );

  expect(screen.getByText("recommended-test-quiz")).toBeInTheDocument();
});
