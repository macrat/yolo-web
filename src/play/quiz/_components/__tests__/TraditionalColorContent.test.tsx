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

const sampleColor = "#0d5661";

describe("TraditionalColorContent - 基本レンダリング", () => {
  it("colorMeaningセクションが表示されること", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
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
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
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
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
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
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("この色からのひとこと")).toBeInTheDocument();
    expect(
      screen.getByText("あなたの深い知性が周囲を照らしている。"),
    ).toBeInTheDocument();
  });

  it("全タイプ一覧が表示されること（見出しは「他の色も見てみよう」）", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("他の色も見てみよう")).toBeInTheDocument();
    expect(screen.getByText("藍色(あいいろ)")).toBeInTheDocument();
    expect(screen.getByText("朱色(しゅいろ)")).toBeInTheDocument();
    expect(screen.getByText("桜色(さくらいろ)")).toBeInTheDocument();
  });
});

describe("TraditionalColorContent - headingLevel prop", () => {
  it("headingLevel=2 の場合、セクション見出しがh2タグでレンダリングされること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const h2s = container.querySelectorAll("h2");
    // colorMeaning / scenery+season / behaviors / colorAdvice / 全タイプのh2が存在する
    expect(h2s.length).toBeGreaterThanOrEqual(5);
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBe(0);
  });

  it("headingLevel=3 の場合、セクション見出しがh3タグでレンダリングされること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
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

describe("TraditionalColorContent - allTypesLayout prop", () => {
  it("allTypesLayout='pill' の場合、ピル型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const pillList = container.querySelector("[class*='allTypesListPill']");
    expect(pillList).not.toBeNull();
  });

  it("allTypesLayout='list' の場合、リスト型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={3}
        allTypesLayout="list"
      />,
    );
    const listEl = container.querySelector("[class*='allTypesListVertical']");
    expect(listEl).not.toBeNull();
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
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
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
          resultColor={sampleColor}
          headingLevel={2}
          allTypesLayout="pill"
        />,
      );
    }).not.toThrow();
  });
});

describe("TraditionalColorContent - 現在のタイプのハイライト", () => {
  it("resultIdと一致するタイプにカレントスタイルが適用されること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const currentItems = container.querySelectorAll(
      "[class*='allTypesItemCurrent']",
    );
    expect(currentItems.length).toBe(1);
  });
});

describe("TraditionalColorContent - wrapper クラスと --type-color CSS変数", () => {
  it("wrapperクラスを持つ最外層要素が存在すること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const wrapper = container.querySelector("[class*='wrapper']");
    expect(wrapper).not.toBeNull();
  });

  it("wrapperに --type-color がインラインスタイルとして注入されること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const wrapper = container.querySelector(
      "[class*='wrapper']",
    ) as HTMLElement;
    expect(wrapper).not.toBeNull();
    // CSS変数 --type-color がインラインスタイルで設定されていること
    expect(wrapper.style.getPropertyValue("--type-color")).toBe(sampleColor);
  });
});

describe("TraditionalColorContent - 全タイプ一覧の色ドット", () => {
  it("各タイプに色ドット要素（colorDot）が表示されること", () => {
    const { container } = render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const colorDots = container.querySelectorAll("[class*='colorDot']");
    // モックには3タイプあるので3つのドットが存在すること
    expect(colorDots.length).toBe(3);
  });
});

describe("TraditionalColorContent - aria-current", () => {
  it("現在のタイプのリンクに aria-current='page' が設定されること", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="ai"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
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
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const otherLink = screen.getByRole("link", { name: /朱色/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });

  it("allTypesLayout='list' でも現在のタイプのリンクに aria-current='page' が設定されること", () => {
    render(
      <TraditionalColorContent
        content={sampleContent}
        resultId="shu"
        resultColor="#ab3b3a"
        headingLevel={3}
        allTypesLayout="list"
      />,
    );
    const currentLink = screen.getByRole("link", { name: /朱色/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
    // 他のリンクには aria-current がないこと
    const otherLink = screen.getByRole("link", { name: /藍色/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });
});
