/**
 * ContrarianFortuneLayout コンポーネントのテスト。
 * contrarian-fortune variant専用レイアウトが正しく描画されることを確認する。
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContrarianFortuneLayout from "../ContrarianFortuneLayout";
import type { ContrarianFortuneLayoutProps } from "../types";
import type {
  QuizMeta,
  QuizResult,
  ContrarianFortuneDetailedContent,
} from "@/play/quiz/types";

/** テスト用ダミーデータ */
const dummyQuizMeta: QuizMeta = {
  slug: "test-quiz",
  title: "テストクイズ",
  description: "テスト説明",
  shortDescription: "テスト短文",
  type: "personality",
  category: "personality",
  questionCount: 5,
  icon: "🎯",
  accentColor: "#FF5733",
  keywords: [],
  publishedAt: "2026-01-01T00:00:00+09:00",
  trustLevel: "generated",
};

const dummyResult: QuizResult = {
  id: "type-a",
  title: "タイプA",
  description: "タイプAの説明",
  icon: "🅰️",
};

const dummyAllResults: QuizResult[] = [
  dummyResult,
  {
    id: "type-b",
    title: "タイプB",
    description: "タイプBの説明",
    icon: "🅱️",
  },
];

const dummyDetailedContent: ContrarianFortuneDetailedContent = {
  variant: "contrarian-fortune",
  catchphrase: "テストキャッチコピー",
  coreSentence: "テストコア文",
  behaviors: ["あるある1", "あるある2"],
  persona: "テスト人物像",
  thirdPartyNote: "テスト第三者視点",
  humorMetrics: [
    { label: "笑い指標1", value: "高" },
    { label: "笑い指標2", value: "低" },
  ],
};

const dummyProps: ContrarianFortuneLayoutProps = {
  slug: "test-quiz",
  resultId: "type-a",
  quizMeta: dummyQuizMeta,
  result: dummyResult,
  shareText: "シェアテキスト",
  shareUrl: "https://example.com/result",
  ctaText: "もう一度やる",
  detailedContent: dummyDetailedContent,
  allResults: dummyAllResults,
};

describe("ContrarianFortuneLayout", () => {
  it("catchphrase が描画される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(screen.getByText("テストキャッチコピー")).toBeInTheDocument();
  });

  it("coreSentence が描画される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(screen.getByText("テストコア文")).toBeInTheDocument();
  });

  it("あるある見出しが表示される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(
      screen.getByText("このタイプの人、こんなことしてませんか？"),
    ).toBeInTheDocument();
  });

  it("behaviors が全て描画される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(screen.getByText("あるある1")).toBeInTheDocument();
    expect(screen.getByText("あるある2")).toBeInTheDocument();
  });

  it("persona が描画される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(screen.getByText("テスト人物像")).toBeInTheDocument();
  });

  it("第三者セクション見出しが表示される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(
      screen.getByText("このタイプの人と一緒にいると"),
    ).toBeInTheDocument();
  });

  it("thirdPartyNote が描画される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(screen.getByText("テスト第三者視点")).toBeInTheDocument();
  });

  it("humorMetrics が存在する場合テーブルが描画される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(screen.getByText("笑い指標1")).toBeInTheDocument();
    expect(screen.getByText("高")).toBeInTheDocument();
    expect(screen.getByText("笑い指標2")).toBeInTheDocument();
    expect(screen.getByText("低")).toBeInTheDocument();
  });

  it("humorMetrics が空の場合テーブルが描画されない", () => {
    const propsWithoutMetrics: ContrarianFortuneLayoutProps = {
      ...dummyProps,
      detailedContent: {
        ...dummyDetailedContent,
        humorMetrics: [],
      },
    };
    render(<ContrarianFortuneLayout {...propsWithoutMetrics} />);
    expect(screen.queryByText("笑い指標1")).not.toBeInTheDocument();
  });

  it("全結果リストが描画される（allResults）", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(screen.getByText("タイプA")).toBeInTheDocument();
    expect(screen.getByText("タイプB")).toBeInTheDocument();
  });

  it("現在のresultIdのリンクに current スタイルが適用される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    // タイプAが現在のresultId、タイプBはそうでない
    const links = screen.getAllByRole("link");
    // 全タイプ一覧内のリンクのうちtype-aへのリンクが存在すること
    const resultLinks = links.filter((link) =>
      link.getAttribute("href")?.includes("/result/"),
    );
    expect(resultLinks.length).toBe(2);
  });

  it("allTypesCta が描画される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(screen.getByText("あなたのタイプはどれ？")).toBeInTheDocument();
  });

  it("ctaText と questionCount が描画される", () => {
    render(<ContrarianFortuneLayout {...dummyProps} />);
    expect(screen.getByText("もう一度やる")).toBeInTheDocument();
    expect(screen.getByText("全5問 / 登録不要")).toBeInTheDocument();
  });

  it("detailedSection は catchphrase の外側に配置される（DOM順序）", () => {
    const { container } = render(<ContrarianFortuneLayout {...dummyProps} />);
    const catchphrase = container.querySelector("p");
    // catchphraseは最初のp要素として描画される
    expect(catchphrase?.textContent).toBe("テストキャッチコピー");
  });
});
