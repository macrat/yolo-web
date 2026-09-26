import { expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ResultPageShell from "../ResultPageShell";
import type { QuizDefinition, QuizResult } from "../../types";

// 依存コンポーネントをモックしてテストを安定させる
vi.mock("@/components/Breadcrumb", () => ({
  default: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav aria-label="パンくずリスト">
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </nav>
  ),
}));

vi.mock("@/components/ShareButtons", () => ({
  default: ({ text, title }: { text: string; title: string }) => (
    <div data-testid="share-buttons">
      <span>{text}</span>
      <span>{title}</span>
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

function renderShell(
  result: QuizResult = mockResult,
  swatch?: string,
): ReturnType<typeof render> {
  return render(
    <ResultPageShell
      quiz={mockQuiz}
      result={result}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
      swatch={swatch}
    >
      <div>子コンテンツ</div>
    </ResultPageShell>,
  );
}

test("ResultPageShell names the quiz right above the type name", () => {
  renderShell();

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1.previousElementSibling).toHaveTextContent(/^テストクイズの結果$/);
});

test("ResultPageShell renders the type name as the h1, once, broken only between phrases", () => {
  const { container } = renderShell({
    ...mockResult,
    title: "締切3分前に本気出す炎の司令塔",
  });

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveTextContent(/^締切3分前に本気出す炎の司令塔$/);
  // 見出しの中は文の字と折り所の <wbr> だけで、字を分ける要素を持たない（DESIGN.md §4）
  expect(h1.querySelectorAll("wbr").length).toBeGreaterThan(0);
  expect([...h1.children].every((child) => child.tagName === "WBR")).toBe(true);
  // 同じタイプ名を2度出さない
  expect(
    container.textContent?.split("締切3分前に本気出す炎の司令塔").length,
  ).toBe(2);
  // 絵文字（result.icon）は描かない（DESIGN.md §5）
  expect(screen.queryByText("🎯")).not.toBeInTheDocument();
});

test("ResultPageShell adds the reading right after the h1, outside it", () => {
  renderShell({
    ...mockResult,
    title: "花鳥風月タイプ",
    reading: { word: "花鳥風月", kana: "かちょうふうげつ" },
  });

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveTextContent(/^花鳥風月タイプ$/);
  expect(h1.nextElementSibling).toHaveTextContent(/^かちょうふうげつ$/);
});

test("ResultPageShell shows the result color as a swatch without text only when given", () => {
  const { unmount } = renderShell(mockResult, "#0d5661");

  const swatch = screen.getByRole("heading", { level: 1 })
    .nextElementSibling as HTMLElement;
  expect(swatch.style.backgroundColor).toBe("rgb(13, 86, 97)");
  expect(swatch).toHaveTextContent("");
  expect(swatch).toHaveAttribute("aria-hidden", "true");
  unmount();

  const { container } = renderShell(mockResult);
  expect(
    screen.getByRole("heading", { level: 1 }).nextElementSibling,
  ).toBeNull();
  expect(container.querySelector("figure")).toBeNull();
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
  // 共有のタイトルに診断の名前が渡る
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
  expect(within(breadcrumb).getByText("遊び")).toBeInTheDocument();
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
