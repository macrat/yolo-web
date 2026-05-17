import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import QuizPlayPageLayout from "../QuizPlayPageLayout";
import type { QuizDefinition } from "../../types";

// Server Componentの依存コンポーネントをモックする
vi.mock("@/components/common/Breadcrumb", () => ({
  default: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav aria-label="パンくずリスト">
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </nav>
  ),
}));

vi.mock("@/components/common/TrustLevelBadge", () => ({
  default: ({ level }: { level: string }) => (
    <div data-testid="trust-level-badge" data-level={level} />
  ),
}));

vi.mock("@/play/quiz/_components/QuizContainer", () => ({
  default: ({
    quiz,
    referrerTypeId,
  }: {
    quiz: QuizDefinition;
    referrerTypeId?: string;
  }) => (
    <div
      data-testid="quiz-container"
      data-quiz-slug={quiz.meta.slug}
      data-referrer={referrerTypeId}
    />
  ),
}));

vi.mock("@/components/common/FaqSection", () => ({
  default: () => <div data-testid="faq-section" />,
}));

vi.mock("@/components/common/ShareButtons", () => ({
  default: ({ url, title }: { url: string; title: string }) => (
    <div data-testid="share-buttons" data-url={url} data-title={title} />
  ),
}));

vi.mock("@/play/quiz/_components/RelatedQuizzes", () => ({
  default: ({ currentSlug }: { currentSlug: string }) => (
    <div data-testid="related-quizzes" data-slug={currentSlug} />
  ),
}));

vi.mock("@/play/_components/RecommendedContent", () => ({
  default: ({ currentSlug }: { currentSlug: string }) => (
    <div data-testid="recommended-content" data-slug={currentSlug} />
  ),
}));

vi.mock("@/play/registry", () => ({
  playContentBySlug: new Map([
    [
      "test-quiz",
      {
        slug: "test-quiz",
        title: "テストクイズ",
        shortDescription: "テスト用の短い説明",
        icon: "🧪",
        category: "personality",
        contentType: "quiz",
        description: "テスト用のクイズです",
        accentColor: "#ff5733",
        keywords: ["テスト"],
        publishedAt: "2026-01-01T00:00:00+09:00",
        trustLevel: "generated",
      },
    ],
  ]),
  quizQuestionCountBySlug: new Map(),
  DAILY_UPDATE_SLUGS: new Set(),
}));

vi.mock("@/play/recommendation", () => ({
  getResultNextContents: () => [],
}));

vi.mock("@/play/seo", () => ({
  generatePlayJsonLd: () => ({ "@context": "https://schema.org" }),
  resolveDisplayCategory: (content: { category: string }) => content.category,
}));

vi.mock("@/lib/seo", () => ({
  safeJsonLdStringify: (data: unknown) => JSON.stringify(data),
}));

vi.mock("@/play/paths", () => ({
  getContentPath: (content: { slug: string }) => "/play/" + content.slug,
}));

const mockQuiz: QuizDefinition = {
  meta: {
    slug: "test-quiz",
    title: "テストクイズ",
    description: "テスト用のクイズです",
    shortDescription: "テスト用の短い説明",
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

test("QuizPlayPageLayout renders breadcrumb with correct items", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
  expect(breadcrumb).toBeInTheDocument();
  expect(breadcrumb).toHaveTextContent("ホーム");
  expect(breadcrumb).toHaveTextContent("遊ぶ");
  expect(breadcrumb).toHaveTextContent("テストクイズ");
});

test("QuizPlayPageLayout renders TrustLevelBadge", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  expect(screen.getByTestId("trust-level-badge")).toBeInTheDocument();
});

test("QuizPlayPageLayout renders QuizContainer with quiz and referrerTypeId", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
    referrerTypeId: "ref-123",
  });
  render(component);

  const container = screen.getByTestId("quiz-container");
  expect(container).toBeInTheDocument();
  expect(container).toHaveAttribute("data-quiz-slug", "test-quiz");
  expect(container).toHaveAttribute("data-referrer", "ref-123");
});

test("QuizPlayPageLayout renders FaqSection", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  expect(screen.getByTestId("faq-section")).toBeInTheDocument();
});

test("QuizPlayPageLayout renders ShareButtons with correct url and title", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  const shareButtons = screen.getByTestId("share-buttons");
  expect(shareButtons).toBeInTheDocument();
  expect(shareButtons).toHaveAttribute("data-url", "/play/test-quiz");
  expect(shareButtons).toHaveAttribute("data-title", "テストクイズ");
});

test("QuizPlayPageLayout renders RelatedQuizzes with current slug", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  const relatedQuizzes = screen.getByTestId("related-quizzes");
  expect(relatedQuizzes).toBeInTheDocument();
  expect(relatedQuizzes).toHaveAttribute("data-slug", "test-quiz");
});

test("QuizPlayPageLayout renders RecommendedContent with current slug", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  const recommendedContent = screen.getByTestId("recommended-content");
  expect(recommendedContent).toBeInTheDocument();
  expect(recommendedContent).toHaveAttribute("data-slug", "test-quiz");
});

test("QuizPlayPageLayout renders share section heading", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  expect(screen.getByText("この診断が楽しかったらシェア")).toBeInTheDocument();
});
