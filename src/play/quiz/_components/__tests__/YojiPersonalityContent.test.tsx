import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import YojiPersonalityContent from "../YojiPersonalityContent";
import type { YojiPersonalityDetailedContent } from "../../types";

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

// yoji-personalityデータモジュールをモック
vi.mock("@/play/quiz/data/yoji-personality", () => ({
  default: {
    meta: {
      slug: "yoji-personality",
      title: "あなたを四字熟語に例えると?",
      accentColor: "#b91c1c",
      questionCount: 8,
    },
    results: [
      {
        id: "shoshikantetsu",
        title: "初志貫徹",
        icon: "🎯",
        color: "#1e40af",
      },
      {
        id: "tenshinranman",
        title: "天真爛漫",
        icon: "☀️",
        color: "#f59e0b",
      },
      {
        id: "sessatakuma",
        title: "切磋琢磨",
        icon: "💪",
        color: "#059669",
      },
    ],
  },
}));

const sampleContent: YojiPersonalityDetailedContent = {
  variant: "yoji-personality",
  catchphrase: "一度決めたら、最後まで。それがあなた。",
  kanjiBreakdown:
    "「初」はものごとの始まり、「志」はこころざし・目標、「貫」はつらぬく、「徹」は最後までやり通す——四字が組み合わさり、最初に抱いた志を最後まで貫き通すという強い意志を表す。",
  origin:
    "「初志」と「貫徹」がそれぞれ独立した表現として古くから存在し、組み合わさって一つの四字熟語になったとされる。古典的な明確な出典は特定されておらず、日本で広まった合成語型の表現と考えられている。",
  behaviors: [
    "行動あるある1",
    "行動あるある2",
    "行動あるある3",
    "行動あるある4",
  ],
  motto: "始めた志を信じ、最後まで歩き続けよう。",
};

const sampleColor = "#1e40af";

describe("YojiPersonalityContent - 基本レンダリング", () => {
  it("kanjiBreakdownセクションが表示されること", () => {
    render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("この四字熟語の成り立ち")).toBeInTheDocument();
    expect(
      screen.getByText(
        "「初」はものごとの始まり、「志」はこころざし・目標、「貫」はつらぬく、「徹」は最後までやり通す——四字が組み合わさり、最初に抱いた志を最後まで貫き通すという強い意志を表す。",
      ),
    ).toBeInTheDocument();
  });

  it("originセクションが表示されること", () => {
    render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("この四字熟語のルーツ")).toBeInTheDocument();
    expect(
      screen.getByText(
        "「初志」と「貫徹」がそれぞれ独立した表現として古くから存在し、組み合わさって一つの四字熟語になったとされる。古典的な明確な出典は特定されておらず、日本で広まった合成語型の表現と考えられている。",
      ),
    ).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("この四字熟語が現れる日常")).toBeInTheDocument();
    expect(screen.getByText("行動あるある1")).toBeInTheDocument();
    expect(screen.getByText("行動あるある4")).toBeInTheDocument();
  });

  it("mottoセクションが表示されること", () => {
    render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("座右の銘として")).toBeInTheDocument();
    expect(
      screen.getByText("始めた志を信じ、最後まで歩き続けよう。"),
    ).toBeInTheDocument();
  });

  it("全タイプ一覧が表示されること（見出しは「他の四字熟語も見てみよう」）", () => {
    render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("他の四字熟語も見てみよう")).toBeInTheDocument();
    expect(screen.getByText("初志貫徹")).toBeInTheDocument();
    expect(screen.getByText("天真爛漫")).toBeInTheDocument();
    expect(screen.getByText("切磋琢磨")).toBeInTheDocument();
  });
});

describe("YojiPersonalityContent - headingLevel prop", () => {
  it("headingLevel=2 の場合、セクション見出しがh2タグでレンダリングされること", () => {
    const { container } = render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const h2s = container.querySelectorAll("h2");
    // kanjiBreakdown / origin / behaviors / motto / 全タイプのh2が存在する
    expect(h2s.length).toBeGreaterThanOrEqual(5);
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBe(0);
  });

  it("headingLevel=3 の場合、セクション見出しがh3タグでレンダリングされること", () => {
    const { container } = render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
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

describe("YojiPersonalityContent - allTypesLayout prop", () => {
  it("allTypesLayout='pill' の場合、ピル型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
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
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={3}
        allTypesLayout="list"
      />,
    );
    const listEl = container.querySelector("[class*='allTypesListVertical']");
    expect(listEl).not.toBeNull();
  });
});

describe("YojiPersonalityContent - afterMotto スロット", () => {
  it("afterMotto が提供された場合、mottoの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-motto-slot">CTAコンテンツ</div>
    );
    render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
        afterMotto={afterContent}
      />,
    );
    expect(screen.getByTestId("after-motto-slot")).toBeInTheDocument();
    expect(screen.getByText("CTAコンテンツ")).toBeInTheDocument();
  });

  it("afterMotto が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(
        <YojiPersonalityContent
          content={sampleContent}
          resultId="shoshikantetsu"
          resultColor={sampleColor}
          headingLevel={2}
          allTypesLayout="pill"
        />,
      );
    }).not.toThrow();
  });
});

describe("YojiPersonalityContent - 現在のタイプのハイライト", () => {
  it("resultIdと一致するタイプにカレントスタイルが適用されること", () => {
    const { container } = render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
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

describe("YojiPersonalityContent - wrapper クラスと --type-color CSS変数", () => {
  it("wrapperクラスを持つ最外層要素が存在すること", () => {
    const { container } = render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
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
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
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

describe("YojiPersonalityContent - aria-current", () => {
  it("現在のタイプのリンクに aria-current='page' が設定されること", () => {
    render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const currentLink = screen.getByRole("link", { name: /初志貫徹/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
  });

  it("現在でないタイプのリンクには aria-current が設定されないこと", () => {
    render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="shoshikantetsu"
        resultColor={sampleColor}
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const otherLink = screen.getByRole("link", { name: /天真爛漫/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });

  it("allTypesLayout='list' でも現在のタイプのリンクに aria-current='page' が設定されること", () => {
    render(
      <YojiPersonalityContent
        content={sampleContent}
        resultId="tenshinranman"
        resultColor="#f59e0b"
        headingLevel={3}
        allTypesLayout="list"
      />,
    );
    const currentLink = screen.getByRole("link", { name: /天真爛漫/ });
    expect(currentLink).toHaveAttribute("aria-current", "page");
    const otherLink = screen.getByRole("link", { name: /初志貫徹/ });
    expect(otherLink).not.toHaveAttribute("aria-current");
  });
});
