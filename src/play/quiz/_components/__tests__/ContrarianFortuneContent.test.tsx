/**
 * ContrarianFortuneContent コンポーネントのテスト。
 *
 * テスト対象:
 * - behaviors / persona / thirdPartyNote の3セクション表示
 * - humorMetrics テーブル（存在する場合のみ表示）
 * - 小見出しの段（h3）と、すべてのタイプを持たないこと
 * - afterThirdPartyNote スロット
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContrarianFortuneContent from "../ContrarianFortuneContent";
import type { ContrarianFortuneDetailedContent } from "../../types";

const sampleContent: ContrarianFortuneDetailedContent = {
  variant: "contrarian-fortune",
  catchphrase: "「みんなと違う」が生きがいの人",
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

describe("ContrarianFortuneContent - 基本レンダリング", () => {
  it("behaviorsセクションが表示されること", () => {
    render(<ContrarianFortuneContent detailedContent={sampleContent} />);
    expect(screen.getByText("あるある行動")).toBeInTheDocument();
    expect(
      screen.getByText("人気のカフェに行かない理由を3つ以上言える。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("マイナーなものを好む自分に満足感を覚える。"),
    ).toBeInTheDocument();
  });

  it("personaセクションが表示されること", () => {
    render(<ContrarianFortuneContent detailedContent={sampleContent} />);
    expect(screen.getByText("このタイプの人物像")).toBeInTheDocument();
    expect(
      screen.getByText(
        "このタイプの人は、主流に乗ることへの抵抗感を強く持っている。自分の個性を守るために逆張りを武器にするが、実はその行動自体が一つのパターンになっていることに気づいていない。",
      ),
    ).toBeInTheDocument();
  });

  it("thirdPartyNoteセクションが表示されること", () => {
    render(<ContrarianFortuneContent detailedContent={sampleContent} />);
    expect(
      screen.getByText("このタイプの人と一緒にいると"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "一緒にいると、お店選びでは多数派の意見に必ず異議を唱える。ただし、その反論が的確なこともあり、おかげで穴場スポットを発見できることも多い。",
      ),
    ).toBeInTheDocument();
  });
});

describe("ContrarianFortuneContent - humorMetrics（条件付き表示）", () => {
  it("humorMetricsが存在しない場合、テーブルが表示されないこと", () => {
    const { container } = render(
      <ContrarianFortuneContent detailedContent={sampleContent} />,
    );
    expect(container.querySelector("table")).toBeNull();
    expect(screen.queryByText("このタイプを数字で見ると")).toBeNull();
  });

  it("humorMetricsが存在する場合、テーブルが表示されること", () => {
    render(
      <ContrarianFortuneContent detailedContent={sampleContentWithMetrics} />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    // 表は自分の小見出しの下に置き、「一緒にいると」の区画の中身に見せない
    expect(
      screen.getByRole("heading", { name: "このタイプを数字で見ると" }),
    ).toBeInTheDocument();
    expect(screen.getByText("逆張り指数")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByText("流行回避率")).toBeInTheDocument();
    expect(screen.getByText("最高レベル")).toBeInTheDocument();
  });
});

describe("ContrarianFortuneContent - 見出しの段", () => {
  it("小見出しはどれもセクションの中の小見出しの段（h3）で組み、すべてのタイプを持たない", () => {
    const { container } = render(
      <ContrarianFortuneContent detailedContent={sampleContent} />,
    );
    expect(container.querySelectorAll("h3").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll("h1, h2")).toHaveLength(0);
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
  });
});

describe("ContrarianFortuneContent - afterThirdPartyNote スロット", () => {
  it("afterThirdPartyNote が提供された場合、thirdPartyNoteの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-third-party-note-slot">CTAコンテンツ</div>
    );
    render(
      <ContrarianFortuneContent
        detailedContent={sampleContent}
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
      render(<ContrarianFortuneContent detailedContent={sampleContent} />);
    }).not.toThrow();
  });
});

describe("ContrarianFortuneContent - 読みものの組み方", () => {
  it("文は段落、あるあるは箇条書きで組み、カードの区画を持たない", () => {
    const { container } = render(
      <ContrarianFortuneContent detailedContent={sampleContent} />,
    );
    for (const text of [sampleContent.persona, sampleContent.thirdPartyNote]) {
      expect(screen.getByText(text).tagName).toBe("P");
    }
    for (const item of [...sampleContent.behaviors]) {
      expect(screen.getByText(item).tagName).toBe("LI");
    }
    expect(container.querySelector("[class*='Card']")).toBeNull();
  });
});
