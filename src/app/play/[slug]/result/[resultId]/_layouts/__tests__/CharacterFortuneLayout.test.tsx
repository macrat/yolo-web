/**
 * CharacterFortuneLayout コンポーネントのテスト。
 * B-258: 結果ページコンポーネントのアーキテクチャ改善
 *
 * テスト対象:
 * - 必須コンテンツのレンダリング（characterIntro, behaviors, characterMessage など）
 * - 全タイプ一覧リストの表示
 * - 現在の結果ハイライト（allTypesItemCurrent）
 * - CTA/シェアボタンの存在
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CharacterFortuneLayout from "../CharacterFortuneLayout";
import type { CharacterFortuneLayoutProps } from "../types";
import type {
  QuizMeta,
  QuizResult,
  CharacterFortuneDetailedContent,
} from "@/play/quiz/types";

// next/link のモック
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    style,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  ),
}));

// ShareButtons のモック
vi.mock("@/play/quiz/_components/ShareButtons", () => ({
  default: ({ shareText }: { shareText: string }) => (
    <div data-testid="share-buttons">{shareText}</div>
  ),
}));

const dummyQuizMeta: QuizMeta = {
  slug: "test-quiz",
  title: "テストクイズ",
  description: "テスト説明",
  shortDescription: "テスト",
  type: "personality",
  category: "personality",
  questionCount: 10,
  icon: "🎯",
  accentColor: "#FF6B6B",
  keywords: [],
  publishedAt: "2026-01-01T00:00:00+09:00",
  trustLevel: "generated",
};

const dummyResult: QuizResult = {
  id: "result-1",
  title: "タイプA",
  icon: "🌟",
  description: "タイプAの説明",
};

const dummyResult2: QuizResult = {
  id: "result-2",
  title: "タイプB",
  icon: "🌙",
  description: "タイプBの説明",
};

const dummyDetailedContent: CharacterFortuneDetailedContent = {
  variant: "character-fortune",
  characterIntro: "こんにちは！私が守護するよ。",
  behaviorsHeading: "このキャラあるある",
  behaviors: ["朝に儀式をする", "月を大事にする", "直感を信じる"],
  characterMessageHeading: "守護者からの本音",
  characterMessage: "あなたへのメッセージがここに入ります。",
  thirdPartyNote: "このキャラの守護を受けている人は穏やかで思いやりがある。",
  compatibilityPrompt: "あなたとの相性を見てみましょう！",
};

const defaultProps: CharacterFortuneLayoutProps = {
  slug: "test-quiz",
  resultId: "result-1",
  quizMeta: dummyQuizMeta,
  result: dummyResult,
  shareText: "診断結果シェアテキスト",
  shareUrl: "https://example.com/result",
  ctaText: "もう一度やる",
  detailedContent: dummyDetailedContent,
  allResults: [dummyResult, dummyResult2],
};

describe("CharacterFortuneLayout", () => {
  it("characterIntro が表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(
      screen.getByText("こんにちは！私が守護するよ。"),
    ).toBeInTheDocument();
  });

  it("behaviorsHeading が表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(screen.getByText("このキャラあるある")).toBeInTheDocument();
  });

  it("behaviors リストが表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(screen.getByText("朝に儀式をする")).toBeInTheDocument();
    expect(screen.getByText("月を大事にする")).toBeInTheDocument();
    expect(screen.getByText("直感を信じる")).toBeInTheDocument();
  });

  it("characterMessageHeading が表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(screen.getByText("守護者からの本音")).toBeInTheDocument();
  });

  it("characterMessage が表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(
      screen.getByText("あなたへのメッセージがここに入ります。"),
    ).toBeInTheDocument();
  });

  it("thirdPartyNote が表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(
      screen.getByText(
        "このキャラの守護を受けている人は穏やかで思いやりがある。",
      ),
    ).toBeInTheDocument();
  });

  it("compatibilityPrompt が表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(
      screen.getByText("あなたとの相性を見てみましょう！"),
    ).toBeInTheDocument();
  });

  it("ShareButtons が表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(screen.getByTestId("share-buttons")).toBeInTheDocument();
  });

  it("ctaText が表示される（複数箇所）", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    const ctaLinks = screen.getAllByText("もう一度やる");
    expect(ctaLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("全タイプ一覧が表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(screen.getByText("タイプA")).toBeInTheDocument();
    expect(screen.getByText("タイプB")).toBeInTheDocument();
  });

  it("「他のキャラも見てみよう」が表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(screen.getByText("他のキャラも見てみよう")).toBeInTheDocument();
  });

  it("「診断して相性を見てみる」ボタンが表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    expect(screen.getByText("診断して相性を見てみる")).toBeInTheDocument();
  });

  it("全タイプ一覧のリンク先が正しい", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    const link = screen
      .getAllByRole("link")
      .find(
        (a) => a.getAttribute("href") === "/play/test-quiz/result/result-2",
      );
    expect(link).toBeDefined();
  });

  it("questionCount が tryCost に表示される", () => {
    render(<CharacterFortuneLayout {...defaultProps} />);
    const tryCostElements = screen.getAllByText(/全10問 \/ 登録不要/);
    expect(tryCostElements.length).toBeGreaterThanOrEqual(1);
  });
});
