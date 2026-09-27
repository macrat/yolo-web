import { expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import QuizPlayPageLayout from "../QuizPlayPageLayout";
import type { QuizDefinition } from "../../types";
import { followsPhraseRules, splitIntoPhrases } from "@/lib/phrase-breaks";

// Server Componentの依存コンポーネントをモックする。
vi.mock("@/components/Breadcrumb", () => ({
  default: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav aria-label="パンくずリスト">
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </nav>
  ),
}));

vi.mock("@/components/Panel", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
}));

vi.mock("@/play/quiz/_components/QuizContainer", () => ({
  default: ({
    quiz,
    referrerTypeId,
    resultHeadings,
    readingHeadings,
  }: {
    quiz: QuizDefinition;
    referrerTypeId?: string;
    resultHeadings: Record<string, { phrases: string[] }>;
    readingHeadings: Record<string, string[]>;
  }) => (
    <div
      data-testid="quiz-container"
      data-quiz-slug={quiz.meta.slug}
      data-referrer={referrerTypeId}
      data-result-headings={JSON.stringify(resultHeadings)}
      data-reading-headings={JSON.stringify(readingHeadings)}
    />
  ),
}));

vi.mock("@/components/FaqSection", () => ({
  default: () => <div data-testid="faq-section" />,
}));

vi.mock("@/components/ShareButtons", () => ({
  default: (props: {
    url: string;
    title: string;
    text?: string;
    contentType?: string;
    contentId?: string;
    surface?: string;
  }) => (
    <div
      data-testid="share-buttons"
      data-url={props.url}
      data-title={props.title}
      data-props={JSON.stringify(props)}
    />
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
  expect(within(breadcrumb).getByText("遊び")).toBeInTheDocument();
  expect(breadcrumb).toHaveTextContent("テストクイズ");
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

test("診断のページの末尾に、何を共有するかを言う「この診断を勧める」の見出しのページの共有がある", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  expect(
    screen.getByRole("heading", { level: 2, name: "この診断を勧める" }),
  ).toBeInTheDocument();
});

test("知識クイズのページの共有の見出しは「このクイズを勧める」", async () => {
  const component = await QuizPlayPageLayout({
    quiz: { ...mockQuiz, meta: { ...mockQuiz.meta, type: "knowledge" } },
    slug: "test-quiz",
  });
  render(component);

  expect(
    screen.getByRole("heading", { level: 2, name: "このクイズを勧める" }),
  ).toBeInTheDocument();
});

test("ページの共有は、ページの URL を、quiz の contentType と接頭辞の無い slug で数え、surface を送らない", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  const props = JSON.parse(
    screen.getByTestId("share-buttons").getAttribute("data-props") ?? "{}",
  );
  expect(props).toEqual({
    url: "/play/test-quiz",
    title: "テストクイズ",
    sns: ["x", "line", "hatena", "copy"],
    contentType: "quiz",
    contentId: "test-quiz",
  });
});

test("結果の見出し（タイプ名）の文節の区切りを、サーバーで全タイプぶん作って渡す", async () => {
  const component = await QuizPlayPageLayout({
    quiz: {
      ...mockQuiz,
      results: [
        {
          id: "poet",
          title: "締切3分前に本気出す炎の司令塔",
          description: "説明",
        },
      ],
    },
    slug: "test-quiz",
  });
  render(component);

  const headings = JSON.parse(
    screen.getByTestId("quiz-container").getAttribute("data-result-headings") ??
      "{}",
  );
  expect(headings.poet.phrases.join("")).toBe("締切3分前に本気出す炎の司令塔");
  expect(headings.poet.phrases.length).toBeGreaterThan(1);
});

test("名前と読みを持つタイプの見出しの区切りは、名前だけで作る", async () => {
  const component = await QuizPlayPageLayout({
    quiz: {
      ...mockQuiz,
      results: [
        {
          id: "ai-iro",
          title: "藍色(あいいろ)",
          nameParts: { name: "藍色", reading: "あいいろ" },
          description: "説明",
        },
      ],
    },
    slug: "test-quiz",
  });
  render(component);

  const headings = JSON.parse(
    screen.getByTestId("quiz-container").getAttribute("data-result-headings") ??
      "{}",
  );
  expect(headings["ai-iro"].phrases.join("")).toBe("藍色");
});

test("解き終えた画面の読みものの小見出しの区切りを、サーバーで作って渡す", async () => {
  const component = await QuizPlayPageLayout({
    quiz: mockQuiz,
    slug: "test-quiz",
  });
  render(component);

  const readingHeadings = JSON.parse(
    screen
      .getByTestId("quiz-container")
      .getAttribute("data-reading-headings") ?? "{}",
  );
  expect(Object.keys(readingHeadings)).toEqual([
    "このタイプの特徴",
    "このタイプのあるある",
    "このタイプの人へのアドバイス",
  ]);
  expect(readingHeadings["このタイプの特徴"].join("")).toBe("このタイプの特徴");
});

test("見出しは文節の切れ目でだけ折れる（DESIGN.md §4）", async () => {
  render(await QuizPlayPageLayout({ quiz: mockQuiz, slug: "test-quiz" }));
  const title = screen.getByRole("heading", { level: 1 });
  expect(title.innerHTML).toBe(
    splitIntoPhrases(title.textContent ?? "").join("<wbr>"),
  );
  const headings: string[][] = [["この", "診断を", "勧める"]];
  for (const phrases of headings) {
    expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    const heading = screen.getByRole("heading", { name: phrases.join("") });
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  }
});
