/**
 * ImpossibleAdviceContent コンポーネントのテスト。
 *
 * テスト対象:
 * - diagnosisCore / behaviors / practicalTip の3セクション表示
 * - 小見出しの段（h3）と、すべてのタイプを持たないこと
 * - afterPracticalTip スロット
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ImpossibleAdviceContent from "../ImpossibleAdviceContent";
import type { ImpossibleAdviceDetailedContent } from "../../types";

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

describe("ImpossibleAdviceContent - 基本レンダリング", () => {
  it("diagnosisCoreセクションが表示されること", () => {
    render(<ImpossibleAdviceContent detailedContent={sampleContent} />);
    expect(screen.getByText("あなたの悩みの本質")).toBeInTheDocument();
    expect(
      screen.getByText(
        "あなたの悩みの本質は「正解を求めること」にある。正解のない問いに向き合い続けることで消耗してしまう。",
      ),
    ).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(<ImpossibleAdviceContent detailedContent={sampleContent} />);
    expect(screen.getByText("ついやってしまうこと")).toBeInTheDocument();
    expect(
      screen.getByText("選択肢が多いほど決められなくなる。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("他人の意見を聞くほど迷いが深まる。"),
    ).toBeInTheDocument();
  });

  it("practicalTipセクションが表示されること", () => {
    render(<ImpossibleAdviceContent detailedContent={sampleContent} />);
    expect(screen.getByText("本当に使える小さなヒント")).toBeInTheDocument();
    expect(
      screen.getByText(
        "「決める」ではなく「決めてみる」と言い換えてみてください。取り消せる選択なら、まず試してみることが答えになります。",
      ),
    ).toBeInTheDocument();
  });
});

describe("ImpossibleAdviceContent - 見出しの段", () => {
  it("小見出しはどれもセクションの中の小見出しの段（h3）で組み、すべてのタイプを持たない", () => {
    const { container } = render(
      <ImpossibleAdviceContent detailedContent={sampleContent} />,
    );
    expect(container.querySelectorAll("h3").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll("h1, h2")).toHaveLength(0);
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
  });
});

describe("ImpossibleAdviceContent - afterPracticalTip スロット", () => {
  it("afterPracticalTip が提供された場合、practicalTipの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-practical-tip-slot">CTAコンテンツ</div>
    );
    render(
      <ImpossibleAdviceContent
        detailedContent={sampleContent}
        afterPracticalTip={afterContent}
      />,
    );
    expect(screen.getByTestId("after-practical-tip-slot")).toBeInTheDocument();
    expect(screen.getByText("CTAコンテンツ")).toBeInTheDocument();
  });

  it("afterPracticalTip が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(<ImpossibleAdviceContent detailedContent={sampleContent} />);
    }).not.toThrow();
  });
});

describe("ImpossibleAdviceContent - 読みものの組み方", () => {
  it("文は段落、あるあるは箇条書きで組み、カードの区画を持たない", () => {
    const { container } = render(
      <ImpossibleAdviceContent detailedContent={sampleContent} />,
    );
    for (const text of [
      sampleContent.diagnosisCore,
      sampleContent.practicalTip,
    ]) {
      expect(screen.getByText(text).tagName).toBe("P");
    }
    for (const item of [...sampleContent.behaviors]) {
      expect(screen.getByText(item).tagName).toBe("LI");
    }
    expect(container.querySelector("[class*='Card']")).toBeNull();
  });
});
