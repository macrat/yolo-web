/**
 * UnexpectedCompatibilityContent コンポーネントのテスト。
 *
 * テスト対象:
 * - entityEssence / whyCompatible / behaviors / lifeAdvice の4セクション表示
 * - 小見出しの段（h3）と、すべてのタイプを持たないこと
 * - afterLifeAdvice スロット
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import UnexpectedCompatibilityContent from "../UnexpectedCompatibilityContent";
import type { UnexpectedCompatibilityDetailedContent } from "../../types";

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

describe("UnexpectedCompatibilityContent - 基本レンダリング", () => {
  it("entityEssenceセクションが表示されること", () => {
    render(<UnexpectedCompatibilityContent detailedContent={sampleContent} />);
    expect(screen.getByText("この存在の本質")).toBeInTheDocument();
    expect(
      screen.getByText(
        "自動販売機とは、選択の自由と即時の応答が詰まった箱だ。何も言わずそこにあり、押せば迷いなく応える。",
      ),
    ).toBeInTheDocument();
  });

  it("whyCompatibleセクションが表示されること", () => {
    render(<UnexpectedCompatibilityContent detailedContent={sampleContent} />);
    expect(screen.getByText("なぜ相性が良いのか")).toBeInTheDocument();
    expect(
      screen.getByText(
        "あなたが自動販売機と相性が良いのは、「ちゃんと応えてくれる」という確かさを求めているから。",
      ),
    ).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(<UnexpectedCompatibilityContent detailedContent={sampleContent} />);
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
    render(<UnexpectedCompatibilityContent detailedContent={sampleContent} />);
    expect(screen.getByText("この存在から学べること")).toBeInTheDocument();
    expect(
      screen.getByText(
        "小さな「ちゃんと応えた」の積み重ねが、やがて信頼という光になる。",
      ),
    ).toBeInTheDocument();
  });
});

describe("UnexpectedCompatibilityContent - 見出しの段", () => {
  it("小見出しはどれもセクションの中の小見出しの段（h3）で組み、すべてのタイプを持たない", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent detailedContent={sampleContent} />,
    );
    expect(container.querySelectorAll("h3").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll("h1, h2")).toHaveLength(0);
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
  });
});

describe("UnexpectedCompatibilityContent - afterLifeAdvice スロット", () => {
  it("afterLifeAdvice が提供された場合、lifeAdviceの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-life-advice-slot">CTAコンテンツ</div>
    );
    render(
      <UnexpectedCompatibilityContent
        detailedContent={sampleContent}
        afterLifeAdvice={afterContent}
      />,
    );
    expect(screen.getByTestId("after-life-advice-slot")).toBeInTheDocument();
    expect(screen.getByText("CTAコンテンツ")).toBeInTheDocument();
  });

  it("afterLifeAdvice が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(
        <UnexpectedCompatibilityContent detailedContent={sampleContent} />,
      );
    }).not.toThrow();
  });
});

describe("UnexpectedCompatibilityContent - 読みものの組み方", () => {
  it("文は段落、あるあるは箇条書きで組み、カードの区画を持たない", () => {
    const { container } = render(
      <UnexpectedCompatibilityContent detailedContent={sampleContent} />,
    );
    for (const text of [
      sampleContent.entityEssence,
      sampleContent.whyCompatible,
      sampleContent.lifeAdvice,
    ]) {
      expect(screen.getByText(text).tagName).toBe("P");
    }
    for (const item of [...sampleContent.behaviors]) {
      expect(screen.getByText(item).tagName).toBe("LI");
    }
    expect(container.querySelector("[class*='Card']")).toBeNull();
  });
});
