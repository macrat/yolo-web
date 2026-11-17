import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MusicPersonalityContent from "../MusicPersonalityContent";
import type { MusicPersonalityDetailedContent } from "../../types";

// music-personalityデータモジュールをモック
vi.mock("@/play/quiz/data/music-personality", () => ({
  default: {
    meta: {
      slug: "music-personality",
      title: "音楽性格診断",
      questionCount: 10,
    },
    results: [
      {
        id: "festival-pioneer",
        title: "フェス一番乗り族",
      },
      {
        id: "playlist-evangelist",
        title: "プレイリスト伝道師",
      },
    ],
  },
}));

const sampleContent: MusicPersonalityDetailedContent = {
  variant: "music-personality",
  catchphrase: "テストキャッチコピー",
  strengths: ["音楽的な強み1", "音楽的な強み2"],
  weaknesses: ["音楽的な弱み1", "音楽的な弱み2"],
  behaviors: [
    "音楽あるある1",
    "音楽あるある2",
    "音楽あるある3",
    "音楽あるある4",
  ],
  todayAction: "今日の音楽ライフのヒントテキスト",
};

describe("MusicPersonalityContent - 基本レンダリング", () => {
  it("strengthsセクションが表示されること（絵文字なし見出し）", () => {
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
      />,
    );
    expect(screen.getByText("このタイプの音楽的な強み")).toBeInTheDocument();
    expect(screen.getByText("音楽的な強み1")).toBeInTheDocument();
    expect(screen.getByText("音楽的な強み2")).toBeInTheDocument();
  });

  it("weaknessesセクションが表示されること（絵文字なし見出し）", () => {
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
      />,
    );
    expect(screen.getByText("このタイプの音楽的な弱み")).toBeInTheDocument();
    expect(screen.getByText("音楽的な弱み1")).toBeInTheDocument();
    expect(screen.getByText("音楽的な弱み2")).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること（絵文字なし見出し）", () => {
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
      />,
    );
    expect(screen.getByText("このタイプの音楽あるある")).toBeInTheDocument();
    expect(screen.getByText("音楽あるある1")).toBeInTheDocument();
    expect(screen.getByText("音楽あるある4")).toBeInTheDocument();
  });

  it("todayActionセクションが表示されること（絵文字なし見出し）", () => {
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
      />,
    );
    expect(screen.getByText("今日の音楽ライフのヒント")).toBeInTheDocument();
    expect(
      screen.getByText("今日の音楽ライフのヒントテキスト"),
    ).toBeInTheDocument();
  });
});

describe("MusicPersonalityContent - 見出しの段", () => {
  it("小見出しはどれもセクションの中の小見出しの段（h3）で組み、すべてのタイプを持たない", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
      />,
    );
    expect(container.querySelectorAll("h3").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll("h1, h2")).toHaveLength(0);
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
  });
});

describe("MusicPersonalityContent - afterTodayAction スロット", () => {
  it("afterTodayAction が提供された場合、todayActionの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-today-action-slot">スロットコンテンツ</div>
    );
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        afterTodayAction={afterContent}
      />,
    );
    expect(screen.getByTestId("after-today-action-slot")).toBeInTheDocument();
    expect(screen.getByText("スロットコンテンツ")).toBeInTheDocument();
  });

  it("afterTodayAction が未設定の場合、エラーなくレンダリングされること", () => {
    expect(() => {
      render(
        <MusicPersonalityContent
          content={sampleContent}
          resultId="festival-pioneer"
        />,
      );
    }).not.toThrow();
  });
});

describe("MusicPersonalityContent - 読みものの組み方", () => {
  it("文は段落、あるあるは箇条書きで組み、カードの区画を持たない", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        afterTodayAction={null}
      />,
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

// タイプごとの色をインラインスタイルで入れない（DESIGN.md §2）。
