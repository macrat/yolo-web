/**
 * StandardResultLayout コンポーネントのテスト。
 * B-258: 結果ページコンポーネントのアーキテクチャ改善で導入。
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StandardResultLayout from "../StandardResultLayout";
import type { StandardResultLayoutProps } from "../types";
import type { QuizMeta, QuizResult } from "@/play/quiz/types";

const dummyQuizMeta: QuizMeta = {
  slug: "test-quiz",
  title: "テストクイズ",
  description: "テスト",
  shortDescription: "テスト",
  type: "personality",
  category: "personality",
  questionCount: 10,
  icon: "🎯",
  accentColor: "#3b82f6",
  keywords: [],
  publishedAt: "2026-01-01T00:00:00+09:00",
  trustLevel: "generated",
};

const dummyResult: QuizResult = {
  id: "result-1",
  title: "結果1",
  description: "テスト結果の説明文",
};

const baseProps: StandardResultLayoutProps = {
  slug: "test-quiz",
  resultId: "result-1",
  quizMeta: dummyQuizMeta,
  result: dummyResult,
  shareText: "シェアテキスト",
  shareUrl: "https://example.com",
  ctaText: "あなたはどのタイプ? 診断してみよう",
  detailedContent: undefined,
  isDescriptionLong: false,
  traitsHeading: "このタイプの特徴",
  behaviorsHeading: "このタイプのあるある",
  adviceHeading: "このタイプの人へのアドバイス",
};

describe("StandardResultLayout", () => {
  it("DescriptionExpanderが表示される", () => {
    render(<StandardResultLayout {...baseProps} />);
    expect(screen.getByText("テスト結果の説明文")).toBeInTheDocument();
  });

  it("CTA1ボタンが表示される", () => {
    render(<StandardResultLayout {...baseProps} />);
    expect(
      screen.getByText("あなたはどのタイプ? 診断してみよう"),
    ).toBeInTheDocument();
  });

  it("CTA1に questionCount が表示される", () => {
    render(<StandardResultLayout {...baseProps} />);
    expect(screen.getByText("全10問 / 登録不要")).toBeInTheDocument();
  });

  it("CTA1リンクが正しいhrefを持つ", () => {
    render(<StandardResultLayout {...baseProps} />);
    const link = screen.getAllByRole("link", {
      name: "あなたはどのタイプ? 診断してみよう",
    })[0];
    expect(link).toHaveAttribute("href", "/play/test-quiz");
  });

  it("detailedContent が undefined の場合、traits/behaviors/advice セクションが表示されない", () => {
    render(<StandardResultLayout {...baseProps} />);
    expect(screen.queryByText("このタイプの特徴")).not.toBeInTheDocument();
    expect(screen.queryByText("このタイプのあるある")).not.toBeInTheDocument();
    expect(
      screen.queryByText("このタイプの人へのアドバイス"),
    ).not.toBeInTheDocument();
  });

  it("detailedContent が存在する場合、traits セクションが表示される", () => {
    const props: StandardResultLayoutProps = {
      ...baseProps,
      detailedContent: {
        variant: undefined,
        traits: ["特徴1", "特徴2"],
        behaviors: ["あるある1"],
        advice: "アドバイステキスト",
      },
    };
    render(<StandardResultLayout {...props} />);
    expect(screen.getByText("このタイプの特徴")).toBeInTheDocument();
    expect(screen.getByText("特徴1")).toBeInTheDocument();
    expect(screen.getByText("特徴2")).toBeInTheDocument();
  });

  it("detailedContent が存在する場合、behaviors セクションが表示される", () => {
    const props: StandardResultLayoutProps = {
      ...baseProps,
      detailedContent: {
        variant: undefined,
        traits: ["特徴1"],
        behaviors: ["あるある1", "あるある2"],
        advice: "アドバイステキスト",
      },
    };
    render(<StandardResultLayout {...props} />);
    expect(screen.getByText("このタイプのあるある")).toBeInTheDocument();
    expect(screen.getByText("あるある1")).toBeInTheDocument();
    expect(screen.getByText("あるある2")).toBeInTheDocument();
  });

  it("detailedContent が存在する場合、advice セクションが表示される", () => {
    const props: StandardResultLayoutProps = {
      ...baseProps,
      detailedContent: {
        variant: undefined,
        traits: ["特徴1"],
        behaviors: ["あるある1"],
        advice: "アドバイステキスト",
      },
    };
    render(<StandardResultLayout {...props} />);
    expect(
      screen.getByText("このタイプの人へのアドバイス"),
    ).toBeInTheDocument();
    expect(screen.getByText("アドバイステキスト")).toBeInTheDocument();
  });

  it("detailedContent が存在する場合、CTA2が表示される", () => {
    const props: StandardResultLayoutProps = {
      ...baseProps,
      detailedContent: {
        variant: undefined,
        traits: ["特徴1"],
        behaviors: ["あるある1"],
        advice: "アドバイス",
      },
    };
    render(<StandardResultLayout {...props} />);
    // CTA2はリンクが2つ（CTA1 + CTA2）
    const links = screen.getAllByRole("link", {
      name: "あなたはどのタイプ? 診断してみよう",
    });
    expect(links).toHaveLength(2);
  });

  it("カスタム見出しが表示される", () => {
    const props: StandardResultLayoutProps = {
      ...baseProps,
      traitsHeading: "カスタム特徴見出し",
      behaviorsHeading: "カスタムあるある見出し",
      adviceHeading: "カスタムアドバイス見出し",
      detailedContent: {
        variant: undefined,
        traits: ["特徴1"],
        behaviors: ["あるある1"],
        advice: "アドバイス",
      },
    };
    render(<StandardResultLayout {...props} />);
    expect(screen.getByText("カスタム特徴見出し")).toBeInTheDocument();
    expect(screen.getByText("カスタムあるある見出し")).toBeInTheDocument();
    expect(screen.getByText("カスタムアドバイス見出し")).toBeInTheDocument();
  });
});
