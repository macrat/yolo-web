import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import YojiPersonalityContent from "../YojiPersonalityContent";
import type { YojiPersonalityDetailedContent } from "../../types";

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

describe("YojiPersonalityContent - 基本レンダリング", () => {
  it("kanjiBreakdownセクションが表示されること", () => {
    render(<YojiPersonalityContent content={sampleContent} />);
    expect(screen.getByText("この四字熟語の成り立ち")).toBeInTheDocument();
    expect(
      screen.getByText(
        "「初」はものごとの始まり、「志」はこころざし・目標、「貫」はつらぬく、「徹」は最後までやり通す——四字が組み合わさり、最初に抱いた志を最後まで貫き通すという強い意志を表す。",
      ),
    ).toBeInTheDocument();
  });

  it("originセクションが表示されること", () => {
    render(<YojiPersonalityContent content={sampleContent} />);
    expect(screen.getByText("この四字熟語のルーツ")).toBeInTheDocument();
    expect(
      screen.getByText(
        "「初志」と「貫徹」がそれぞれ独立した表現として古くから存在し、組み合わさって一つの四字熟語になったとされる。古典的な明確な出典は特定されておらず、日本で広まった合成語型の表現と考えられている。",
      ),
    ).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(<YojiPersonalityContent content={sampleContent} />);
    expect(screen.getByText("この四字熟語が現れる日常")).toBeInTheDocument();
    expect(screen.getByText("行動あるある1")).toBeInTheDocument();
    expect(screen.getByText("行動あるある4")).toBeInTheDocument();
  });

  it("mottoセクションが表示されること", () => {
    render(<YojiPersonalityContent content={sampleContent} />);
    expect(screen.getByText("座右の銘として")).toBeInTheDocument();
    expect(
      screen.getByText("始めた志を信じ、最後まで歩き続けよう。"),
    ).toBeInTheDocument();
  });
});

describe("YojiPersonalityContent - 見出しの段", () => {
  it("小見出しはどれもセクションの中の小見出しの段（h3）で組み、すべてのタイプを持たない", () => {
    const { container } = render(
      <YojiPersonalityContent content={sampleContent} />,
    );
    expect(container.querySelectorAll("h3").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll("h1, h2")).toHaveLength(0);
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
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
        afterMotto={afterContent}
      />,
    );
    expect(screen.getByTestId("after-motto-slot")).toBeInTheDocument();
    expect(screen.getByText("CTAコンテンツ")).toBeInTheDocument();
  });

  it("afterMotto が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(<YojiPersonalityContent content={sampleContent} />);
    }).not.toThrow();
  });
});

describe("YojiPersonalityContent - 読みものの組み方", () => {
  it("文は段落、あるあるは箇条書きで組み、カードの区画を持たない", () => {
    const { container } = render(
      <YojiPersonalityContent content={sampleContent} />,
    );
    for (const text of [
      sampleContent.kanjiBreakdown,
      sampleContent.origin,
      sampleContent.motto,
    ]) {
      expect(screen.getByText(text).tagName).toBe("P");
    }
    for (const item of [...sampleContent.behaviors]) {
      expect(screen.getByText(item).tagName).toBe("LI");
    }
    expect(container.querySelector("[class*='Card']")).toBeNull();
  });
});
