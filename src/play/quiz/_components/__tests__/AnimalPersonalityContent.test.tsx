import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AnimalPersonalityContent from "../AnimalPersonalityContent";
import type { AnimalPersonalityDetailedContent } from "../../types";

// next/linkをモック
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// animal-personalityデータモジュールをモック
vi.mock("@/play/quiz/data/animal-personality", () => ({
  default: {
    meta: {
      slug: "animal-personality",
      title: "日本にしかいない動物で性格診断",
      accentColor: "#16a34a",
      questionCount: 10,
    },
    results: [
      {
        id: "nihon-zaru",
        title: "ニホンザル",
        icon: "🐵",
      },
      {
        id: "hondo-tanuki",
        title: "ホンドタヌキ",
        icon: "🦝",
      },
    ],
  },
  getCompatibility: vi.fn(),
  isValidAnimalTypeId: vi.fn((id: string) =>
    ["nihon-zaru", "hondo-tanuki"].includes(id),
  ),
}));

const sampleContent: AnimalPersonalityDetailedContent = {
  variant: "animal-personality",
  catchphrase: "テストキャッチコピー",
  strengths: ["強み1", "強み2"],
  weaknesses: ["弱み1", "弱み2"],
  behaviors: ["行動1", "行動2", "行動3", "行動4"],
  todayAction: "今日のアクション",
};

describe("AnimalPersonalityContent - 基本レンダリング", () => {
  it("strengthsセクションが表示されること", () => {
    render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("このタイプの強み")).toBeInTheDocument();
    expect(screen.getByText("強み1")).toBeInTheDocument();
    expect(screen.getByText("強み2")).toBeInTheDocument();
  });

  it("weaknessesセクションが表示されること", () => {
    render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("このタイプの弱み")).toBeInTheDocument();
    expect(screen.getByText("弱み1")).toBeInTheDocument();
    expect(screen.getByText("弱み2")).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("この動物に似た行動パターン")).toBeInTheDocument();
    expect(screen.getByText("行動1")).toBeInTheDocument();
    expect(screen.getByText("行動4")).toBeInTheDocument();
  });

  it("todayActionセクションが表示されること", () => {
    render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("今日試してほしいこと")).toBeInTheDocument();
    expect(screen.getByText("今日のアクション")).toBeInTheDocument();
  });

  it("全タイプ一覧が表示されること（見出しテキストは「他の動物も見てみよう」）", () => {
    render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("他の動物も見てみよう")).toBeInTheDocument();
    expect(screen.getByText("ニホンザル")).toBeInTheDocument();
    expect(screen.getByText("ホンドタヌキ")).toBeInTheDocument();
  });
});

describe("AnimalPersonalityContent - headingLevel prop", () => {
  it("headingLevel=2 の場合、セクション見出しがh2タグでレンダリングされること", () => {
    const { container } = render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const h2s = container.querySelectorAll("h2");
    // 少なくとも強み・弱み・行動・アクション・全タイプのh2が存在する
    expect(h2s.length).toBeGreaterThanOrEqual(5);
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBe(0);
  });

  it("headingLevel=3 の場合、セクション見出しがh3タグでレンダリングされること", () => {
    const { container } = render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={3}
        allTypesLayout="list"
      />,
    );
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBeGreaterThanOrEqual(5);
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBe(0);
  });
});

describe("AnimalPersonalityContent - allTypesLayout prop", () => {
  it("allTypesLayout='pill' の場合、ピル型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    // pillクラスを持つul要素が存在すること
    const pillList = container.querySelector("[class*='allTypesListPill']");
    expect(pillList).not.toBeNull();
  });

  it("allTypesLayout='list' の場合、リスト型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={3}
        allTypesLayout="list"
      />,
    );
    // listクラスを持つul要素が存在すること
    const listEl = container.querySelector("[class*='allTypesListVertical']");
    expect(listEl).not.toBeNull();
  });
});

describe("AnimalPersonalityContent - afterTodayAction スロット", () => {
  it("afterTodayAction が提供された場合、todayActionの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-today-action-slot">スロットコンテンツ</div>
    );
    render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
        afterTodayAction={afterContent}
      />,
    );
    expect(screen.getByTestId("after-today-action-slot")).toBeInTheDocument();
    expect(screen.getByText("スロットコンテンツ")).toBeInTheDocument();
  });

  it("afterTodayAction が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(
        <AnimalPersonalityContent
          content={sampleContent}
          resultId="nihon-zaru"
          headingLevel={2}
          allTypesLayout="pill"
        />,
      );
    }).not.toThrow();
  });
});

describe("AnimalPersonalityContent - 現在のタイプのハイライト", () => {
  it("resultIdと一致するタイプにカレントスタイルが適用されること", () => {
    const { container } = render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    // 現在のタイプのアイテムは "current" クラスを持つ
    const currentItems = container.querySelectorAll(
      "[class*='allTypesItemCurrent']",
    );
    expect(currentItems.length).toBe(1);
  });
});

describe("AnimalPersonalityContent - wrapper クラス", () => {
  it("wrapperクラスを持つ最外層要素が存在すること（CSS変数定義のため）", () => {
    const { container } = render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const wrapper = container.querySelector("[class*='wrapper']");
    expect(wrapper).not.toBeNull();
  });
});

describe("AnimalPersonalityContent - インラインスタイル不使用（CSS変数管理）", () => {
  it("sectionHeadingにインラインスタイルが設定されていないこと", () => {
    const { container } = render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    // CSS変数はCSSクラス側で管理するため、インラインスタイルを使用しない
    const headings = container.querySelectorAll("[class*='sectionHeading']");
    headings.forEach((heading) => {
      expect((heading as HTMLElement).style.color).toBe("");
    });
  });

  it("todayActionCardにインラインスタイルが設定されていないこと", () => {
    const { container } = render(
      <AnimalPersonalityContent
        content={sampleContent}
        resultId="nihon-zaru"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    // CSS変数はCSSクラス側で管理するため、インラインスタイルを使用しない
    const card = container.querySelector("[class*='todayActionCard']");
    expect(card).not.toBeNull();
    expect((card as HTMLElement).style.backgroundColor).toBe("");
  });
});
