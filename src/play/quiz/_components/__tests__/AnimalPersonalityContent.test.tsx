import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AnimalPersonalityContent from "../AnimalPersonalityContent";
import type { AnimalPersonalityDetailedContent } from "../../types";

const sampleContent: AnimalPersonalityDetailedContent = {
  variant: "animal-personality",
  catchphrase: "テストキャッチコピー",
  strengths: ["強み1", "強み2"],
  weaknesses: ["弱み1", "弱み2"],
  behaviors: ["行動1", "行動2", "行動3", "行動4"],
  todayAction: "今日のアクション",
};

describe("AnimalPersonalityContent - 基本レンダリング", () => {
  it("strengthsセクションが表示されること", () => {
    render(<AnimalPersonalityContent content={sampleContent} />);
    expect(screen.getByText("このタイプの強み")).toBeInTheDocument();
    expect(screen.getByText("強み1")).toBeInTheDocument();
    expect(screen.getByText("強み2")).toBeInTheDocument();
  });

  it("weaknessesセクションが表示されること", () => {
    render(<AnimalPersonalityContent content={sampleContent} />);
    expect(screen.getByText("このタイプの弱み")).toBeInTheDocument();
    expect(screen.getByText("弱み1")).toBeInTheDocument();
    expect(screen.getByText("弱み2")).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること", () => {
    render(<AnimalPersonalityContent content={sampleContent} />);
    expect(screen.getByText("この動物に似た行動パターン")).toBeInTheDocument();
    expect(screen.getByText("行動1")).toBeInTheDocument();
    expect(screen.getByText("行動4")).toBeInTheDocument();
  });

  it("todayActionセクションが表示されること", () => {
    render(<AnimalPersonalityContent content={sampleContent} />);
    expect(screen.getByText("今日試してほしいこと")).toBeInTheDocument();
    expect(screen.getByText("今日のアクション")).toBeInTheDocument();
  });
});

describe("AnimalPersonalityContent - 見出しの段", () => {
  it("小見出しはどれもセクションの中の小見出しの段（h3）で組み、すべてのタイプを持たない", () => {
    const { container } = render(
      <AnimalPersonalityContent content={sampleContent} />,
    );
    expect(container.querySelectorAll("h3").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll("h1, h2")).toHaveLength(0);
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
  });
});

describe("AnimalPersonalityContent - afterTodayAction スロット", () => {
  it("afterTodayAction が提供された場合、todayActionの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-today-action-slot">スロットコンテンツ</div>
    );
    render(
      <AnimalPersonalityContent
        content={sampleContent}
        afterTodayAction={afterContent}
      />,
    );
    expect(screen.getByTestId("after-today-action-slot")).toBeInTheDocument();
    expect(screen.getByText("スロットコンテンツ")).toBeInTheDocument();
  });

  it("afterTodayAction が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(<AnimalPersonalityContent content={sampleContent} />);
    }).not.toThrow();
  });
});

describe("AnimalPersonalityContent - 読みものの組み方", () => {
  it("文は段落、あるあるは箇条書きで組み、カードの区画を持たない", () => {
    const { container } = render(
      <AnimalPersonalityContent content={sampleContent} />,
    );
    for (const text of [sampleContent.todayAction]) {
      expect(screen.getByText(text).tagName).toBe("P");
    }
    for (const item of [
      ...sampleContent.strengths,
      ...sampleContent.weaknesses,
      ...sampleContent.behaviors,
    ]) {
      expect(screen.getByText(item).tagName).toBe("LI");
    }
    expect(container.querySelector("[class*='Card']")).toBeNull();
  });
});
