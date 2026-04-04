/**
 * ImpossibleAdviceContent コンポーネントのテスト。
 *
 * テスト対象:
 * - diagnosisCore / behaviors / practicalTip の3セクション表示
 * - 全タイプ一覧（pill レイアウト）
 * - headingLevel prop（h2/h3）
 * - resultColor の CSS変数注入（--type-color）
 * - afterPracticalTip スロット
 * - 現在タイプのハイライト（aria-current）
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ImpossibleAdviceContent from "../ImpossibleAdviceContent";
import type { ImpossibleAdviceDetailedContent } from "../../types";
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

const sampleContent: ImpossibleAdviceDetailedContent = {
  variant: "impossible-advice",
  catchphrase: "答えを出そうとするから苦しい",
  diagnosisCore:
    "あなたの悩みの本質は「正解を求めること」にある。正解のない問いに向き合い続けることで消耗してしまう。",
  behaviors: [
    "選択肢が多いほど決められなくなる。",
    "決めた後も「これで良かったのか」と考え続ける。",
    "他人の意見を聞くほど迷いが深まる。",
  ],
  practicalTip:
    "「決める」ではなく「決めてみる」と言い換えてみてください。取り消せる選択なら、まず試してみることが答えになります。",
};

const sampleAllResults: QuizResult[] = [
  {
    id: "perfectionist",
    title: "完璧主義の迷宮",
    description: "説明1",
    color: "#7c3aed",
    icon: "🌀",
  },
  {
    id: "overthinking",
    title: "考えすぎのループ",
    description: "説明2",
    color: "#0891b2",
    icon: "💭",
  },
  {
    id: "comparison",
    title: "比較の罠",
    description: "説明3",
    color: "#dc2626",
    icon: "⚖️",
  },
];

const sampleColor = "#7c3aed";
const sampleQuizSlug = "impossible-advice";

describe("ImpossibleAdviceContent - 基本レンダリング", () => {
  it("diagnosisCoreセクションが表示されること", () => {
    render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("あなたの悩みの本質")).toBeInTheDocument();
    expect(
      screen.getByText(
        "あなたの悩みの本質は「正解を求めること」にある。正解のない問いに向き合い続けることで消耗してしまう。",
      ),
    ).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("ついやってしまうこと")).toBeInTheDocument();
    expect(
      screen.getByText("選択肢が多いほど決められなくなる。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("他人の意見を聞くほど迷いが深まる。"),
    ).toBeInTheDocument();
  });

  it("practicalTipセクションが表示されること", () => {
    render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("本当に使える小さなヒント")).toBeInTheDocument();
    expect(
      screen.getByText(
        "「決める」ではなく「決めてみる」と言い換えてみてください。取り消せる選択なら、まず試してみることが答えになります。",
      ),
    ).toBeInTheDocument();
  });

  it("全タイプ一覧が表示されること", () => {
    render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    expect(screen.getByText("他のタイプも見てみよう")).toBeInTheDocument();
    expect(screen.getByText("完璧主義の迷宮")).toBeInTheDocument();
    expect(screen.getByText("考えすぎのループ")).toBeInTheDocument();
    expect(screen.getByText("比較の罠")).toBeInTheDocument();
  });
});

describe("ImpossibleAdviceContent - headingLevel prop", () => {
  it("headingLevel=2 の場合、セクション見出しがh2タグでレンダリングされること", () => {
    const { container } = render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const h2s = container.querySelectorAll("h2");
    // diagnosisCore / behaviors / practicalTip / 全タイプのh2が存在する
    expect(h2s.length).toBeGreaterThanOrEqual(4);
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBe(0);
  });

  it("headingLevel=3 の場合、セクション見出しがh3タグでレンダリングされること", () => {
    const { container } = render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={3}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBeGreaterThanOrEqual(4);
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBe(0);
  });
});

describe("ImpossibleAdviceContent - allTypesLayout prop", () => {
  it("allTypesLayout='pill' の場合、ピル型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
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

describe("ImpossibleAdviceContent - afterPracticalTip スロット", () => {
  it("afterPracticalTip が提供された場合、practicalTipの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-practical-tip-slot">CTAコンテンツ</div>
    );
    render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
        afterPracticalTip={afterContent}
      />,
    );
    expect(screen.getByTestId("after-practical-tip-slot")).toBeInTheDocument();
    expect(screen.getByText("CTAコンテンツ")).toBeInTheDocument();
  });

  it("afterPracticalTip が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(
        <ImpossibleAdviceContent
          quizSlug={sampleQuizSlug}
          resultId="perfectionist"
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

describe("ImpossibleAdviceContent - wrapper クラスと --type-color CSS変数", () => {
  it("wrapperクラスを持つ最外層要素が存在すること", () => {
    const { container } = render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
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
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
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

describe("ImpossibleAdviceContent - 現在のタイプのハイライト", () => {
  it("resultIdと一致するタイプにカレントスタイルが適用されること", () => {
    const { container } = render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
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

describe("ImpossibleAdviceContent - aria-current", () => {
  it("現在のタイプのリンクに aria-current='page' が設定されること", () => {
    render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const currentLink = screen.getByRole("link", { name: /完璧主義の迷宮/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
  });

  it("現在でないタイプのリンクには aria-current が設定されないこと", () => {
    render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const otherLink = screen.getByRole("link", { name: /考えすぎのループ/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });

  it("別のresultIdを渡した場合、そのタイプがカレントになること", () => {
    render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="overthinking"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={3}
        allTypesLayout="pill"
        resultColor="#0891b2"
      />,
    );
    const currentLink = screen.getByRole("link", { name: /考えすぎのループ/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
    const otherLink = screen.getByRole("link", { name: /完璧主義の迷宮/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });
});

describe("ImpossibleAdviceContent - リンクのhref", () => {
  it("全タイプ一覧のリンクが正しいhrefを持つこと", () => {
    render(
      <ImpossibleAdviceContent
        quizSlug={sampleQuizSlug}
        resultId="perfectionist"
        detailedContent={sampleContent}
        allResults={sampleAllResults}
        headingLevel={2}
        allTypesLayout="pill"
        resultColor={sampleColor}
      />,
    );
    const loopLink = screen.getByRole("link", { name: /考えすぎのループ/ });
    expect(loopLink).toHaveAttribute(
      "href",
      `/play/${sampleQuizSlug}/result/overthinking`,
    );
  });
});
