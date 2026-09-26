import { expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import ResultPageShell from "../ResultPageShell";
import type { QuizDefinition, QuizResult } from "../../types";

// パンくず・共有・関連の中身はそれぞれのテストが確かめるので、ここでは渡した値だけを出す部品に替える
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

type ShellProps = ComponentProps<typeof ResultPageShell>;

function renderShell(
  props: Partial<ShellProps> = {},
): ReturnType<typeof render> {
  return render(
    <ResultPageShell
      quiz={mockQuiz}
      result={mockResult}
      shareText="シェアテキスト"
      shareUrl="https://example.com/result"
      ctaText="あなたはどのタイプ? 診断してみよう"
      {...props}
    >
      {props.children ?? <div>子コンテンツ</div>}
    </ResultPageShell>,
  );
}

test("タイプ名のすぐ上で、何の診断の結果かを言う", () => {
  renderShell();

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1.previousElementSibling).toHaveTextContent(/^テストクイズの結果$/);
});

test("診断が短い名前を持つときは、その名前で何の結果かを言う", () => {
  renderShell({
    quiz: { ...mockQuiz, meta: { ...mockQuiz.meta, shortTitle: "テスト診断" } },
  });

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1.previousElementSibling).toHaveTextContent(/^テスト診断の結果$/);
});

test("タイプ名を h1 に1度だけ出し、文節のあいだの <wbr> のほかに字を分ける要素を持たない", () => {
  const { container } = renderShell({
    result: { ...mockResult, title: "締切3分前に本気出す炎の司令塔" },
  });

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveTextContent(/^締切3分前に本気出す炎の司令塔$/);
  // 見出しの中は文の字と折り所の <wbr> だけで、字を分ける要素を持たない（DESIGN.md §4）
  expect(h1.querySelectorAll("wbr").length).toBeGreaterThan(0);
  expect([...h1.children].every((child) => child.tagName === "WBR")).toBe(true);
  expect(
    container.textContent?.split("締切3分前に本気出す炎の司令塔").length,
  ).toBe(2);
  // 絵文字（result.icon）は描かない（DESIGN.md §5）
  expect(screen.queryByText("🎯")).not.toBeInTheDocument();
});

test("読みにくい語を持つタイプは、読みを h1 の外のすぐ下に添える", () => {
  renderShell({
    result: {
      ...mockResult,
      title: "花鳥風月タイプ",
      reading: { word: "花鳥風月", kana: "かちょうふうげつ" },
    },
  });

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveTextContent(/^花鳥風月タイプ$/);
  expect(h1.nextElementSibling).toHaveTextContent(/^かちょうふうげつ$/);
});

test("名前に読みを添えた形のタイプは、h1 を名前だけにし、読みをすぐ下に添える", () => {
  renderShell({
    result: {
      ...mockResult,
      title: "藍色(あいいろ)",
      nameParts: { name: "藍色", reading: "あいいろ" },
    },
  });

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveTextContent(/^藍色$/);
  expect(h1.nextElementSibling).toHaveTextContent(/^あいいろ$/);
});

test("結果の色を渡したときだけ、字を持たない色見本を出す", () => {
  const { unmount } = renderShell({ swatch: "#0d5661" });

  const swatch = screen.getByRole("heading", { level: 1 })
    .nextElementSibling as HTMLElement;
  expect(swatch.style.backgroundColor).toBe("rgb(13, 86, 97)");
  expect(swatch).toHaveTextContent("");
  expect(swatch).toHaveAttribute("aria-hidden", "true");
  unmount();

  const { container } = renderShell();
  expect(
    screen.getByRole("heading", { level: 1 }).nextElementSibling,
  ).toBeNull();
  expect(container.querySelector("figure")).toBeNull();
});

test("タイプ名のあとに、添えた段落・説明・診断への誘いをこの順に置き、そのあとにルートの中身を続ける", () => {
  const { container } = renderShell({
    lead: "キャッチコピー",
    description: "タイプの説明",
    children: <div data-testid="child-content">子コンテンツ</div>,
  });

  const order = [
    screen.getByText("キャッチコピー"),
    screen.getByText("タイプの説明"),
    screen.getByRole("link", { name: "あなたはどのタイプ? 診断してみよう" }),
    screen.getByText("全5問 / 登録不要"),
    screen.getByTestId("child-content"),
  ];
  for (let i = 1; i < order.length; i++) {
    expect(
      order[i - 1].compareDocumentPosition(order[i]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  }
  expect(
    screen.getByRole("link", { name: "あなたはどのタイプ? 診断してみよう" }),
  ).toHaveAttribute("href", "/play/test-quiz");
  expect(container.querySelector("[data-inverted]")).not.toBeNull();
});

test("共有の区画を1つだけ置き、見出し「この結果を共有」が区画の名前になる", () => {
  renderShell();

  const share = screen.getByRole("region", { name: "この結果を共有" });
  expect(within(share).getByTestId("share-buttons")).toHaveTextContent(
    "シェアテキスト",
  );
  // 共有のタイトルに診断の名前が渡る
  expect(within(share).getByTestId("share-buttons")).toHaveTextContent(
    "テストクイズ",
  );
  expect(screen.getAllByTestId("share-buttons")).toHaveLength(1);
});

test("afterShare を渡したときだけ、共有の区画のあとに置く", () => {
  const { unmount } = renderShell({
    afterShare: <div data-testid="after-share">シェア後コンテンツ</div>,
  });

  const share = screen.getByRole("region", { name: "この結果を共有" });
  const afterShare = screen.getByTestId("after-share");
  expect(
    share.compareDocumentPosition(afterShare) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  unmount();

  renderShell();
  expect(screen.queryByTestId("after-share")).toBeNull();
});

test("パンくずに、ホーム・遊び・診断・結果を並べる", () => {
  renderShell();

  const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
  expect(breadcrumb).toHaveTextContent("ホーム");
  expect(within(breadcrumb).getByText("遊び")).toBeInTheDocument();
  expect(breadcrumb).toHaveTextContent("テストクイズ");
  expect(breadcrumb).toHaveTextContent("結果");
});

test("関連の診断とおすすめに、いまの診断の slug を渡す", () => {
  renderShell();

  expect(screen.getByText("related-test-quiz")).toBeInTheDocument();
  expect(screen.getByText("recommended-test-quiz")).toBeInTheDocument();
});
