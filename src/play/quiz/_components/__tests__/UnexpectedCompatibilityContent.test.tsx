/**
 * UnexpectedCompatibilityContent コンポーネントのテスト。
 *
 * テスト対象:
 * - entityEssence / whyCompatible / behaviors / lifeAdvice の4セクション表示
 * - 全タイプ一覧（pill / list / grid レイアウト）
 * - headingLevel prop（h2/h3）
 * - resultColor の CSS変数注入（--type-color）
 * - afterLifeAdvice スロット
 * - 現在タイプのハイライト（aria-current）
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import UnexpectedCompatibilityContent from "../UnexpectedCompatibilityContent";
import type { UnexpectedCompatibilityDetailedContent } from "../../types";
import type { QuizResult } from "../../types";

// next/link をモック
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

const sampleContent: UnexpectedCompatibilityDetailedContent = {
  variant: "unexpected-compatibility",
  catchphrase: "24時間、あなたの選択を静かに待っている",
  entityEssence:
    "自動販売機とは、選択の自由と即時の応答が詰まった箱だ。何も言わずそこにあり、押せば迷いなく応える。",
  whyCompatible:
    "あなたが自動販売機と相性が良いのは、「ちゃんと応えてくれる」という確かさを求めているから。",
  behaviors: [
    "グループLINEに誰も答えないと、気づいたら自分がまとめ役になっていた。",
    "「いつでも声かけていいよ」と言った手前、本当にいつでも来られる。",
    "自販機の前で「温かいか冷たいか」だけ決めてボタンを押す。",
    "疲れた帰り道、光っている自販機を見るとなぜか少し元気になる。",
  ],
  lifeAdvice:
    "小さな「ちゃんと応えた」の積み重ねが、やがて信頼という光になる。",
};

const sampleAllResults: QuizResult[] = [
  {
    id: "vendingmachine",
    title: "自動販売機",
    description: "説明1",
    color: "#0891b2",
    icon: "🥤",
  },
  {
    id: "oldclock",
    title: "古い掛け時計",
    description: "説明2",
    color: "#92400e",
    icon: "🕰️",
  },
  {
    id: "streetlight",
    title: "街灯",
    description: "説明3",
    color: "#ca8a04",
    icon: "💡",
  },
];

const sampleColor = "#0891b2";
const sampleQuizSlug = "unexpected-compatibility";

describe("UnexpectedCompatibilityContent - 基本レンダリング", () => {
  it("entityEssenceセクションが表示されること", () => {
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("この存在の本質")).toBeInTheDocument();
    expect(
      screen.getByText(
        "自動販売機とは、選択の自由と即時の応答が詰まった箱だ。何も言わずそこにあり、押せば迷いなく応える。",
      ),
    ).toBeInTheDocument();
  });

  it("whyCompatibleセクションが表示されること", () => {
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("なぜ相性が良いのか")).toBeInTheDocument();
    expect(
      screen.getByText(
        "あなたが自動販売機と相性が良いのは、「ちゃんと応えてくれる」という確かさを求めているから。",
      ),
    ).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("この存在と共鳴する日常")).toBeInTheDocument();
    expect(
      screen.getByText(
        "グループLINEに誰も答えないと、気づいたら自分がまとめ役になっていた。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "疲れた帰り道、光っている自販機を見るとなぜか少し元気になる。",
      ),
    ).toBeInTheDocument();
  });

  it("lifeAdviceセクションが表示されること", () => {
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("この存在から学べること")).toBeInTheDocument();
    expect(
      screen.getByText(
        "小さな「ちゃんと応えた」の積み重ねが、やがて信頼という光になる。",
      ),
    ).toBeInTheDocument();
  });

  it("全タイプ一覧が表示されること", () => {
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(
      screen.getByText("他の「相性の良い存在」も見てみよう"),
    ).toBeInTheDocument();
    expect(screen.getByText("自動販売機")).toBeInTheDocument();
    expect(screen.getByText("古い掛け時計")).toBeInTheDocument();
    expect(screen.getByText("街灯")).toBeInTheDocument();
  });
});

describe("UnexpectedCompatibilityContent - headingLevel prop", () => {
  it("headingLevel=2 の場合、セクション見出しがh2タグでレンダリングされること", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const h2s = container.querySelectorAll("h2");
    // entityEssence / whyCompatible / behaviors / lifeAdvice / 全タイプのh2が存在する
    expect(h2s.length).toBeGreaterThanOrEqual(5);
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBe(0);
  });

  it("headingLevel=3 の場合、セクション見出しがh3タグでレンダリングされること", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={3}
        allTypesLayout="list"
        resultColor={sampleColor}
      />,
    );
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBeGreaterThanOrEqual(5);
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBe(0);
  });
});

describe("UnexpectedCompatibilityContent - allTypesLayout prop", () => {
  it("allTypesLayout='pill' の場合、ピル型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const pillList = container.querySelector("[class*='allTypesListPill']");
    expect(pillList).not.toBeNull();
  });

  it("allTypesLayout='list' の場合、リスト型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={3}
        allTypesLayout="list"
        resultColor={sampleColor}
      />,
    );
    const listEl = container.querySelector("[class*='allTypesListVertical']");
    expect(listEl).not.toBeNull();
  });

  it("allTypesLayout='grid' の場合、グリッドレイアウトクラスが適用されること", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="grid"
        resultColor={sampleColor}
      />,
    );
    const gridEl = container.querySelector("[class*='allTypesListGrid']");
    expect(gridEl).not.toBeNull();
  });
});

describe("UnexpectedCompatibilityContent - afterLifeAdvice スロット", () => {
  it("afterLifeAdvice が提供された場合、lifeAdviceの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-life-advice-slot">CTAコンテンツ</div>
    );
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
        afterLifeAdvice={afterContent}
      />,
    );
    expect(screen.getByTestId("after-life-advice-slot")).toBeInTheDocument();
    expect(screen.getByText("CTAコンテンツ")).toBeInTheDocument();
  });

  it("afterLifeAdvice が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(
        <UnexpectedCompatibilityContent
          quizSlug={sampleQuizSlug}
          resultId="vendingmachine"
          detailedContent={sampleContent}
          allResults={sampleAllResults}
          headingLevel={2}
          allTypesLayout="pill"
          resultColor={sampleColor}
        />,
      );
    }).not.toThrow();
  });
});

describe("UnexpectedCompatibilityContent - wrapper クラスと --type-color CSS変数", () => {
  it("wrapperクラスを持つ最外層要素が存在すること", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const wrapper = container.querySelector("[class*='wrapper']");
    expect(wrapper).not.toBeNull();
  });

  it("wrapperに --type-color がインラインスタイルとして注入されること", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const wrapper = container.querySelector(
      "[class*='wrapper']",
    ) as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.getPropertyValue("--type-color")).toBe(sampleColor);
  });
});

describe("UnexpectedCompatibilityContent - 現在のタイプのハイライト", () => {
  it("resultIdと一致するタイプにカレントスタイルが適用されること", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const currentItems = container.querySelectorAll(
      "[class*='allTypesItemCurrent']",
    );
    expect(currentItems.length).toBe(1);
  });
});

describe("UnexpectedCompatibilityContent - aria-current", () => {
  it("現在のタイプのリンクに aria-current='page' が設定されること", () => {
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const currentLink = screen.getByRole("link", { name: /自動販売機/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
  });

  it("現在でないタイプのリンクには aria-current が設定されないこと", () => {
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const otherLink = screen.getByRole("link", { name: /古い掛け時計/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });

  it("別のresultIdを渡した場合、そのタイプがカレントになること", () => {
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="oldclock"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={3}
        allTypesLayout="list"
        resultColor="#92400e"
      />,
    );
    const currentLink = screen.getByRole("link", { name: /古い掛け時計/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
    const otherLink = screen.getByRole("link", { name: /自動販売機/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });
});

describe("UnexpectedCompatibilityContent - リンクのhref", () => {
  it("全タイプ一覧のリンクが正しいhrefを持つこと", () => {
    render(
      <UnexpectedCompatibilityContent
        quizSlug={sampleQuizSlug}
        resultId="vendingmachine"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const clockLink = screen.getByRole("link", { name: /古い掛け時計/ });
    expect(clockLink).toHaveAttribute(
      "href",
      `/play/${sampleQuizSlug}/result/oldclock`,
    );
  });
});
