import { expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import ResultPageShell from "../ResultPageShell";
import type { QuizDefinition, QuizResult } from "../../types";
import { followsPhraseRules } from "@/lib/phrase-breaks";

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

  renderShell();
  expect(
    screen.getByRole("heading", { level: 1 }).nextElementSibling,
  ).toBeNull();
});

/** 詳しい読みものを持つタイプと、同じ診断のもう1つのタイプ。 */
const readingResult: QuizResult = {
  ...mockResult,
  detailedContent: {
    traits: ["特徴"],
    behaviors: ["あるある"],
    advice: "助言",
  },
};
const readingQuiz: QuizDefinition = {
  ...mockQuiz,
  results: [
    readingResult,
    { id: "result-b", title: "もう1つのタイプ", description: "説明" },
  ],
};

test("タイプ名のあとに、添えた段落・診断への誘い・説明の全文をこの順に置き、そのあとにルートの中身を続ける", () => {
  const { container } = renderShell({
    quiz: readingQuiz,
    result: readingResult,
    lead: "キャッチコピー",
    description: "タイプの説明",
    children: <div data-testid="child-content">子コンテンツ</div>,
  });

  const order = [
    screen.getByText("キャッチコピー"),
    screen.getByRole("link", { name: "あなたはどのタイプ? 診断してみよう" }),
    screen.getByText("全5問 / 登録不要"),
    screen.getByText("タイプの説明"),
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
  // 説明は切り分けず、開くボタンを持たない（DESIGN.md §8）
  expect(screen.queryByRole("button")).toBeNull();
});

test("詳しい読みものを持つタイプは、ルートの中身をセクション「このタイプについて」（h2）に置き、そのあとにすべてのタイプ（h2）、共有の区画を続ける", () => {
  renderShell({
    quiz: readingQuiz,
    result: readingResult,
    children: <div data-testid="child-content">子コンテンツ</div>,
  });

  const reading = screen.getByRole("region", { name: "このタイプについて" });
  expect(
    within(reading).getByRole("heading", {
      level: 2,
      name: "このタイプについて",
    }),
  ).toBeInTheDocument();
  expect(within(reading).getByTestId("child-content")).toBeInTheDocument();
  const allTypes = screen.getByRole("heading", {
    level: 2,
    name: "すべてのタイプ（2）",
  });
  const share = screen.getByRole("region", { name: "この結果を共有" });
  expect(reading).not.toContainElement(allTypes);
  for (const [before, after] of [
    [reading, allTypes],
    [allTypes, share],
  ]) {
    expect(
      before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  }
  // 結果のページでは、いまのタイプの行は開いているページなので現在地になる
  expect(
    screen.getByRole("link", { name: "テスト結果タイトル" }),
  ).toHaveAttribute("aria-current", "page");
});

test("結果の色を渡したときは、すべてのタイプの行も色見本を持つ", () => {
  renderShell({
    quiz: {
      ...readingQuiz,
      results: readingQuiz.results.map((result) => ({
        ...result,
        color: "#165e83",
      })),
    },
    result: readingResult,
    swatch: "#165e83",
  });
  const allTypes = screen.getByRole("heading", { name: "すべてのタイプ（2）" })
    .parentElement as HTMLElement;
  expect(allTypes.querySelectorAll("[style*='background']")).toHaveLength(2);
});

test("詳しい読みものを持たないタイプは、読みもののセクションもすべてのタイプも置かない", () => {
  renderShell({ quiz: readingQuiz, result: mockResult, children: undefined });
  expect(
    screen.queryByRole("region", { name: "このタイプについて" }),
  ).toBeNull();
  expect(screen.queryByRole("heading", { name: /^すべてのタイプ/ })).toBeNull();
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

test("見出しは書き手が分けた文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
  renderShell();
  const headings: string[][] = [["この", "結果を", "共有"]];
  for (const phrases of headings) {
    expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    const heading = screen.getByRole("heading", { name: phrases.join("") });
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  }
});
