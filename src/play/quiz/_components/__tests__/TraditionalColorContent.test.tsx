import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TraditionalColorContent from "../TraditionalColorContent";
import type { TraditionalColorDetailedContent } from "../../types";

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

// traditional-colorデータモジュールをモック
vi.mock("@/play/quiz/data/traditional-color", () => ({
  default: {
    meta: {
      slug: "traditional-color",
      title: "日本の伝統色診断",
      accentColor: "#0d5661",
      questionCount: 8,
    },
    results: [
      {
        id: "ai",
        title: "藍色(あいいろ)",
        icon: "🌊",
        color: "#0d5661",
      },
      {
        id: "shu",
        title: "朱色(しゅいろ)",
        icon: "🔥",
        color: "#ab3b3a",
      },
      {
        id: "sakura",
        title: "桜色(さくらいろ)",
        icon: "🌸",
        color: "#fedfe1",
      },
    ],
  },
}));

const sampleContent: TraditionalColorDetailedContent = {
  variant: "traditional-color",
  catchphrase: "知的で深みのある探究者",
  colorMeaning:
    "藍色は日本の染物文化を代表する色。江戸時代には庶民の着物に広く使われ、「ジャパン・ブルー」とも呼ばれ海外でも親しまれている。",
  season: "夏",
  scenery: "夏の夜空と静かな海辺",
  behaviors: ["行動1", "行動2", "行動3", "行動4"],
  colorAdvice: "あなたの深い知性が周囲を照らしている。",
};

describe("TraditionalColorContent - 基本レンダリング", () => {
  it("colorMeaningセクションが表示されること", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    expect(screen.getByText("この色の物語")).toBeInTheDocument();
    expect(
      screen.getByText(
        "藍色は日本の染物文化を代表する色。江戸時代には庶民の着物に広く使われ、「ジャパン・ブルー」とも呼ばれ海外でも親しまれている。",
      ),
    ).toBeInTheDocument();
  });

  it("scenery + season セクションが表示されること", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    expect(screen.getByText("この色が映える風景")).toBeInTheDocument();
    expect(screen.getByText("夏の夜空と静かな海辺")).toBeInTheDocument();
    expect(screen.getByText("夏")).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    expect(screen.getByText("この色が現れる場面")).toBeInTheDocument();
    expect(screen.getByText("行動1")).toBeInTheDocument();
    expect(screen.getByText("行動4")).toBeInTheDocument();
  });

  it("colorAdviceセクションが表示されること", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    expect(screen.getByText("この色からのひとこと")).toBeInTheDocument();
    expect(
      screen.getByText("あなたの深い知性が周囲を照らしている。"),
    ).toBeInTheDocument();
  });

  it("他のタイプが表示され、見出しがタイプの数を言うこと", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    expect(
      screen.getByRole("heading", { name: /^他のタイプ（\d+）$/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("藍色(あいいろ)")).toBeInTheDocument();
    expect(screen.getByText("朱色(しゅいろ)")).toBeInTheDocument();
    expect(screen.getByText("桜色(さくらいろ)")).toBeInTheDocument();
  });
});

describe("TraditionalColorContent - placement による見出しの階層", () => {
  it("結果のページ（placement=resultPage）では、セクション見出しがh2タグでレンダリングされること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    const h2s = container.querySelectorAll("h2");
    // colorMeaning / scenery+season / behaviors / colorAdvice / 全タイプのh2が存在する
    expect(h2s.length).toBeGreaterThanOrEqual(5);
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBe(0);
  });

  it("解き終えた画面（placement=solvedScreen）では、セクション見出しがh3タグでレンダリングされること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="solvedScreen"
      />,
    );
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBeGreaterThanOrEqual(5);
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBe(0);
  });
});

describe("TraditionalColorContent - afterColorAdvice スロット", () => {
  it("afterColorAdvice が提供された場合、colorAdviceの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-color-advice-slot">CTAコンテンツ</div>
    );
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
        afterColorAdvice={afterContent}
      />,
    );
    expect(screen.getByTestId("after-color-advice-slot")).toBeInTheDocument();
    expect(screen.getByText("CTAコンテンツ")).toBeInTheDocument();
  });

  it("afterColorAdvice が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(
        <TraditionalColorContent
          content={sampleContent}
          resultId="ai"
          placement="resultPage"
        />,
      );
    }).not.toThrow();
  });
});

describe("TraditionalColorContent - wrapper", () => {
  it("wrapperクラスを持つ最外層要素が存在すること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    const wrapper = container.querySelector("[class*='wrapper']");
    expect(wrapper).not.toBeNull();
  });

  it("タイプの色を wrapper のインラインスタイルに入れないこと", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    const wrapper = container.querySelector(
      "[class*='wrapper']",
    ) as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.getAttribute("style")).toBeNull();
  });
});

describe("TraditionalColorContent - 他のタイプの色見本", () => {
  it("各タイプの行が、そのタイプの伝統色の色見本を持つこと", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    const rows = container.querySelectorAll("li");
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const swatch = row.querySelector<HTMLElement>('span[aria-hidden="true"]');
      expect(swatch?.style.backgroundColor).not.toBe("");
    }
  });
});

describe("TraditionalColorContent - aria-current", () => {
  it("現在のタイプのリンクに aria-current='page' が設定されること", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    // 藍色(あいいろ)のリンクは aria-current="page" を持つ
    const currentLink = screen.getByRole("link", { name: /藍色/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
  });

  it("現在でないタイプのリンクには aria-current が設定されないこと", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        placement="resultPage"
      />,
    );
    const otherLink = screen.getByRole("link", { name: /朱色/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });

  it("解き終えた画面では、渡した resultId のタイプがいまの項目（aria-current='true'）になること", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="shu"
        placement="solvedScreen"
      />,
    );
    const currentLink = screen.getByRole("link", { name: /朱色/ });
    expect(currentLink).toHaveAttribute("aria-current", "true");
    // 他のリンクには aria-current がないこと
    const otherLink = screen.getByRole("link", { name: /藍色/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });
});
