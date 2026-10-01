import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CharacterFortuneResultPage, { generateMetadata } from "../page";

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

// ResultPageShell は、ページが渡した値（添えた段落・説明・中身）をそのまま出す部品に替える
vi.mock("@/play/quiz/_components/ResultPageShell", () => ({
  default: ({
    quiz,
    lead,
    description,
    children,
  }: {
    quiz: { meta: { questionCount: number } };
    lead?: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="result-page-shell">
      {lead && <p>{lead}</p>}
      <p>全{quiz.meta.questionCount}問 / 登録不要</p>
      {description && <p>{description}</p>}
      {children}
    </div>
  ),
}));

// Mock character-fortune quiz data
vi.mock("@/play/quiz/data/character-fortune", () => ({
  isValidCharacterTypeId: (id: string) =>
    ["commander", "professor"].includes(id),
  getCompatibility: (a: string, b: string) =>
    [a, b].sort().join("--") === "commander--professor"
      ? { label: "作戦と知恵の同盟", description: "司令官と教授の相性の説明" }
      : undefined,
  default: {
    meta: {
      title: "守護キャラ診断",
      slug: "character-fortune",
      shortDescription: "あなたを守護するキャラクターを診断",
      type: "personality",
      questionCount: 10,
      category: "personality",
    },
    results: [
      {
        id: "commander",
        title: "司令官キャラ",
        description: "司令官の説明",
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

describe("CharacterFortuneResultPage 誘い", () => {
  it("読みもののあとの誘いは相性の区画の1つだけで、同じ行き先のリンクを続けて並べない", async () => {
    const params = Promise.resolve({ resultId: "commander" });
    const page = await CharacterFortuneResultPage({ params });
    render(page);

    const tryLink = screen.getByRole("link", {
      name: "診断して相性を見てみる",
    });
    // 解いたあとに、このキャラとの相性が解き終えた画面に出るよう、招待のリンクと同じ ?ref= を付ける
    expect(tryLink).toHaveAttribute(
      "href",
      "/play/character-fortune?ref=commander",
    );
    expect(tryLink.nextElementSibling).toHaveTextContent("登録不要");
    expect(
      screen
        .getAllByRole("link")
        .filter((link) =>
          link.getAttribute("href")?.startsWith("/play/character-fortune"),
        ),
    ).toHaveLength(1);
  });
});

describe("CharacterFortuneResultPage 相性の共有のリンク（?with=）", () => {
  it("友達のタイプを受け取ると、読みもののあと・相性への誘いの前に、相性の名前を小見出し（h3）にして相性を出す", async () => {
    const page = await CharacterFortuneResultPage({
      params: Promise.resolve({ resultId: "commander" }),
      searchParams: Promise.resolve({ with: "professor" }),
    });
    render(page);

    const label = screen.getByRole("heading", {
      level: 3,
      name: "作戦と知恵の同盟",
    });
    expect(
      screen.getByText("「司令官キャラ」と「教授キャラ」の相性"),
    ).toBeInTheDocument();
    expect(screen.getByText("司令官と教授の相性の説明")).toBeInTheDocument();
    const order = [
      screen.getByText("第三者向けテキスト"),
      label,
      screen.getByText("相性誘導テキスト"),
    ];
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("友達のタイプが無い・正しくないときは、相性を出さない", async () => {
    for (const searchParams of [
      undefined,
      Promise.resolve({ with: "unknown" }),
      Promise.resolve({ with: ["professor", "commander"] }),
    ]) {
      const { unmount } = render(
        await CharacterFortuneResultPage({
          params: Promise.resolve({ resultId: "commander" }),
          searchParams,
        }),
      );
      expect(screen.queryByText(/の相性$/)).toBeNull();
      unmount();
    }
  });
});

describe("CharacterFortuneResultPage generateMetadata", () => {
  it("相性を出さないページは検索に載せ、題はタイプ名と診断名", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ resultId: "commander" }),
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.title).toContain("司令官キャラ | 守護キャラ診断の結果");
  });

  it("相性のページは検索に載せず、題と説明で相性を言い、正規の URL はタイプの結果のページ", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ resultId: "commander" }),
      searchParams: Promise.resolve({ with: "professor" }),
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.title).toContain(
      "司令官キャラ x 教授キャラ - 作戦と知恵の同盟",
    );
    expect(metadata.description).toBe("司令官と教授の相性の説明");
    expect(metadata.alternates?.canonical).toMatch(
      /\/play\/character-fortune\/result\/commander$/,
    );
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
