import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TraditionalColorContent from "../TraditionalColorContent";
import type { TraditionalColorDetailedContent } from "../../types";

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
    render(<TraditionalColorContent content={sampleContent} />);
    expect(screen.getByText("この色の物語")).toBeInTheDocument();
    expect(
      screen.getByText(
        "藍色は日本の染物文化を代表する色。江戸時代には庶民の着物に広く使われ、「ジャパン・ブルー」とも呼ばれ海外でも親しまれている。",
      ),
    ).toBeInTheDocument();
  });

  it("scenery + season セクションが表示されること", () => {
    render(<TraditionalColorContent content={sampleContent} />);
    expect(screen.getByText("この色が映える風景")).toBeInTheDocument();
    expect(screen.getByText("夏の夜空と静かな海辺")).toBeInTheDocument();
    expect(screen.getByText("季節：夏")).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(<TraditionalColorContent content={sampleContent} />);
    expect(screen.getByText("この色が現れる場面")).toBeInTheDocument();
    expect(screen.getByText("行動1")).toBeInTheDocument();
    expect(screen.getByText("行動4")).toBeInTheDocument();
  });

  it("colorAdviceセクションが表示されること", () => {
    render(<TraditionalColorContent content={sampleContent} />);
    expect(screen.getByText("この色からのひとこと")).toBeInTheDocument();
    expect(
      screen.getByText("あなたの深い知性が周囲を照らしている。"),
    ).toBeInTheDocument();
  });
});

describe("TraditionalColorContent - 見出しの段", () => {
  it("小見出しはどれもセクションの中の小見出しの段（h3）で組み、すべてのタイプを持たない", () => {
    const { container } = render(
      <TraditionalColorContent content={sampleContent} />,
    );
    expect(container.querySelectorAll("h3").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll("h1, h2")).toHaveLength(0);
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
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
        afterColorAdvice={afterContent}
      />,
    );
    expect(screen.getByTestId("after-color-advice-slot")).toBeInTheDocument();
    expect(screen.getByText("CTAコンテンツ")).toBeInTheDocument();
  });

  it("afterColorAdvice が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(<TraditionalColorContent content={sampleContent} />);
    }).not.toThrow();
  });
});

describe("TraditionalColorContent - 読みものの組み方", () => {
  it("文は段落、あるあるは箇条書きで組み、カードの区画を持たない", () => {
    const { container } = render(
      <TraditionalColorContent content={sampleContent} />,
    );
    for (const text of [
      sampleContent.colorMeaning,
      sampleContent.scenery,
      sampleContent.colorAdvice,
    ]) {
      expect(screen.getByText(text).tagName).toBe("P");
    }
    for (const item of [...sampleContent.behaviors]) {
      expect(screen.getByText(item).tagName).toBe("LI");
    }
    expect(container.querySelector("[class*='Card']")).toBeNull();
  });
});
