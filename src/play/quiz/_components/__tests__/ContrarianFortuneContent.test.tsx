/**
 * ContrarianFortuneContent コンポーネントのテスト。
 *
 * テスト対象:
 * - coreSentence / behaviors / persona / thirdPartyNote の4セクション表示
 * - humorMetrics テーブル（存在する場合のみ表示）
 * - 全タイプ一覧（pill レイアウト）
 * - headingLevel prop（h2/h3）
 * - resultColor の CSS変数注入（--type-color）
 * - afterThirdPartyNote スロット
 * - 現在タイプのハイライト（aria-current）
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ContrarianFortuneContent from "../ContrarianFortuneContent";
import type { ContrarianFortuneDetailedContent } from "../../types";
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

const sampleContent: ContrarianFortuneDetailedContent = {
  variant: "contrarian-fortune",
  catchphrase: "「みんなと違う」が生きがいの人",
  coreSentence:
    "流行を追わないのではなく、流行を避けることで自分を定義している。",
  behaviors: [
    "人気のカフェに行かない理由を3つ以上言える。",
    "「みんながいいって言うから」という理由だけで何かを避ける。",
    "マイナーなものを好む自分に満足感を覚える。",
  ],
  persona:
    "このタイプの人は、主流に乗ることへの抵抗感を強く持っている。自分の個性を守るために逆張りを武器にするが、実はその行動自体が一つのパターンになっていることに気づいていない。",
  thirdPartyNote:
    "一緒にいると、お店選びでは多数派の意見に必ず異議を唱える。ただし、その反論が的確なこともあり、おかげで穴場スポットを発見できることも多い。",
};

const sampleContentWithMetrics: ContrarianFortuneDetailedContent = {
  ...sampleContent,
  humorMetrics: [
    { label: "逆張り指数", value: "98%" },
    { label: "流行回避率", value: "最高レベル" },
    { label: "独自路線度", value: "★★★★★" },
  ],
};

const sampleAllResults: QuizResult[] = [
  {
    id: "antitrend",
    title: "逆張りマスター",
    description: "説明1",
    color: "#7c3aed",
    icon: "🔄",
  },
  {
    id: "unique",
    title: "マイウェイ型",
    description: "説明2",
    color: "#0891b2",
    icon: "🌊",
  },
  {
    id: "classic",
    title: "王道無視型",
    description: "説明3",
    color: "#dc2626",
    icon: "🎭",
  },
];

const sampleColor = "#7c3aed";
const sampleQuizSlug = "contrarian-fortune";

describe("ContrarianFortuneContent - 基本レンダリング", () => {
  it("coreSentenceセクションが表示されること", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(
      screen.getByText(
        "流行を追わないのではなく、流行を避けることで自分を定義している。",
      ),
    ).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("あるある行動")).toBeInTheDocument();
    expect(
      screen.getByText("人気のカフェに行かない理由を3つ以上言える。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("マイナーなものを好む自分に満足感を覚える。"),
    ).toBeInTheDocument();
  });

  it("personaセクションが表示されること", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("このタイプの人物像")).toBeInTheDocument();
    expect(
      screen.getByText(
        "このタイプの人は、主流に乗ることへの抵抗感を強く持っている。自分の個性を守るために逆張りを武器にするが、実はその行動自体が一つのパターンになっていることに気づいていない。",
      ),
    ).toBeInTheDocument();
  });

  it("thirdPartyNoteセクションが表示されること", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(
      screen.getByText("このタイプの人と一緒にいると"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "一緒にいると、お店選びでは多数派の意見に必ず異議を唱える。ただし、その反論が的確なこともあり、おかげで穴場スポットを発見できることも多い。",
      ),
    ).toBeInTheDocument();
  });

  it("全タイプ一覧が表示されること", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("他のタイプも見てみよう")).toBeInTheDocument();
    expect(screen.getByText("逆張りマスター")).toBeInTheDocument();
    expect(screen.getByText("マイウェイ型")).toBeInTheDocument();
    expect(screen.getByText("王道無視型")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneContent - humorMetrics（条件付き表示）", () => {
  it("humorMetricsが存在しない場合、テーブルが表示されないこと", () => {
    const { container } = render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(container.querySelector("table")).toBeNull();
  });

  it("humorMetricsが存在する場合、テーブルが表示されること", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContentWithMetrics}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("逆張り指数")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByText("流行回避率")).toBeInTheDocument();
    expect(screen.getByText("最高レベル")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneContent - headingLevel prop", () => {
  it("headingLevel=2 の場合、セクション見出しがh2タグでレンダリングされること", () => {
    const { container } = render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const h2s = container.querySelectorAll("h2");
    // behaviors / persona / thirdPartyNote / 全タイプのh2が存在する
    expect(h2s.length).toBeGreaterThanOrEqual(3);
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBe(0);
  });

  it("headingLevel=3 の場合、セクション見出しがh3タグでレンダリングされること", () => {
    const { container } = render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={3}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBeGreaterThanOrEqual(3);
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBe(0);
  });
});

describe("ContrarianFortuneContent - allTypesLayout prop", () => {
  it("allTypesLayout='pill' の場合、ピル型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
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
});

describe("ContrarianFortuneContent - afterThirdPartyNote スロット", () => {
  it("afterThirdPartyNote が提供された場合、thirdPartyNoteの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-third-party-note-slot">CTAコンテンツ</div>
    );
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
        afterThirdPartyNote={afterContent}
      />,
    );
    expect(
      screen.getByTestId("after-third-party-note-slot"),
    ).toBeInTheDocument();
    expect(screen.getByText("CTAコンテンツ")).toBeInTheDocument();
  });

  it("afterThirdPartyNote が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(
        <ContrarianFortuneContent
          quizSlug={sampleQuizSlug}
          resultId="antitrend"
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

describe("ContrarianFortuneContent - wrapper クラスと --type-color CSS変数", () => {
  it("wrapperクラスを持つ最外層要素が存在すること", () => {
    const { container } = render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
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
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
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

describe("ContrarianFortuneContent - 現在のタイプのハイライト", () => {
  it("resultIdと一致するタイプにカレントスタイルが適用されること", () => {
    const { container } = render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
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

describe("ContrarianFortuneContent - aria-current", () => {
  it("現在のタイプのリンクに aria-current='page' が設定されること", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const currentLink = screen.getByRole("link", { name: /逆張りマスター/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
  });

  it("現在でないタイプのリンクには aria-current が設定されないこと", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const otherLink = screen.getByRole("link", { name: /マイウェイ型/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });

  it("別のresultIdを渡した場合、そのタイプがカレントになること", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="unique"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={3}
        allTypesLayout="pill"
        resultColor="#0891b2"
      />,
    );
    const currentLink = screen.getByRole("link", { name: /マイウェイ型/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
    const otherLink = screen.getByRole("link", { name: /逆張りマスター/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });
});

describe("ContrarianFortuneContent - リンクのhref", () => {
  it("全タイプ一覧のリンクが正しいhrefを持つこと", () => {
    render(
      <ContrarianFortuneContent
        quizSlug={sampleQuizSlug}
        resultId="antitrend"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const uniqueLink = screen.getByRole("link", { name: /マイウェイ型/ });
    expect(uniqueLink).toHaveAttribute(
      "href",
      `/play/${sampleQuizSlug}/result/unique`,
    );
  });
});
