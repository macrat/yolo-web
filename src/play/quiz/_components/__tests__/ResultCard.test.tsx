import { expect, test, vi, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultCard from "../ResultCard";
import type {
  QuizResult,
  QuizResultDetailedContent,
  ContrarianFortuneDetailedContent,
  CharacterFortuneDetailedContent,
} from "../../types";

// ShareButtonsコンポーネントをモック（Web Share APIなどの依存を排除）
vi.mock("@/play/quiz/_components/ShareButtons", () => ({
  default: ({ shareText }: { shareText: string }) => (
    <div data-testid="share-buttons">
      <span>{shareText}</span>
    </div>
  ),
}));

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

const baseResult: QuizResult = {
  id: "type-a",
  title: "テスト結果",
  description: "テスト用の結果説明です。",
  icon: "🧪",
};

const defaultProps = {
  result: baseResult,
  quizType: "personality" as const,
  quizTitle: "テストクイズ",
  quizSlug: "test-quiz",
  onRetry: vi.fn(),
};

describe("ResultCard - detailedContent未設定", () => {
  test("detailedContentがundefinedの場合、detailedSectionが表示されないこと", () => {
    const { container } = render(<ResultCard {...defaultProps} />);
    // detailedSectionクラスの要素が存在しないことを確認
    // (CSSモジュールのためdata-testidで確認)
    expect(container.querySelector(".detailedSection")).toBeNull();
    // ただし基本コンテンツは表示される
    expect(screen.getByText("テスト結果")).toBeInTheDocument();
    expect(screen.getByText("テスト用の結果説明です。")).toBeInTheDocument();
  });
});

describe("ResultCard - Standard variant", () => {
  const standardContent: QuizResultDetailedContent = {
    traits: ["特徴1", "特徴2"],
    behaviors: ["あるある1", "あるある2", "あるある3"],
    advice: "このタイプへのアドバイスです。",
  };

  test("behaviors と advice が表示されること", () => {
    render(<ResultCard {...defaultProps} detailedContent={standardContent} />);
    expect(screen.getByText("あるある1")).toBeInTheDocument();
    expect(screen.getByText("あるある2")).toBeInTheDocument();
    expect(screen.getByText("あるある3")).toBeInTheDocument();
    expect(
      screen.getByText("このタイプへのアドバイスです。"),
    ).toBeInTheDocument();
  });

  test("traitsが表示されないこと", () => {
    render(<ResultCard {...defaultProps} detailedContent={standardContent} />);
    // Standard variantでtraitsは表示しない
    expect(screen.queryByText("特徴1")).not.toBeInTheDocument();
    expect(screen.queryByText("特徴2")).not.toBeInTheDocument();
  });

  test("カスタムresultPageLabelsの見出しが使われること", () => {
    render(
      <ResultCard
        {...defaultProps}
        detailedContent={standardContent}
        resultPageLabels={{
          behaviorsHeading: "カスタムあるある見出し",
          adviceHeading: "カスタムアドバイス見出し",
        }}
      />,
    );
    expect(screen.getByText("カスタムあるある見出し")).toBeInTheDocument();
    expect(screen.getByText("カスタムアドバイス見出し")).toBeInTheDocument();
  });

  test("resultPageLabelsが未設定の場合はデフォルト見出しが使われること", () => {
    render(<ResultCard {...defaultProps} detailedContent={standardContent} />);
    expect(screen.getByText("このタイプのあるある")).toBeInTheDocument();
    expect(
      screen.getByText("このタイプの人へのアドバイス"),
    ).toBeInTheDocument();
  });
});

describe("ResultCard - contrarian-fortune variant", () => {
  const contrarianContent: ContrarianFortuneDetailedContent = {
    variant: "contrarian-fortune",
    catchphrase: "これがキャッチフレーズです",
    coreSentence: "これがコアセンテンスです。",
    behaviors: ["逆張りあるある1", "逆張りあるある2"],
    persona: "ペルソナのテキストです。",
    thirdPartyNote: "第三者ノートのテキストです。",
    humorMetrics: [
      { label: "逆張り度", value: "★★★★★" },
      { label: "共感拒否力", value: "★★★★☆" },
    ],
  };

  test("catchphrase + behaviors + humorMetrics が表示されること", () => {
    render(
      <ResultCard {...defaultProps} detailedContent={contrarianContent} />,
    );
    expect(screen.getByText("これがキャッチフレーズです")).toBeInTheDocument();
    expect(screen.getByText("逆張りあるある1")).toBeInTheDocument();
    expect(screen.getByText("逆張りあるある2")).toBeInTheDocument();
    expect(screen.getByText("逆張り度")).toBeInTheDocument();
    expect(screen.getByText("★★★★★")).toBeInTheDocument();
    expect(screen.getByText("共感拒否力")).toBeInTheDocument();
    expect(screen.getByText("★★★★☆")).toBeInTheDocument();
  });

  test("thirdPartyNote / persona / coreSentence が表示されないこと", () => {
    render(
      <ResultCard {...defaultProps} detailedContent={contrarianContent} />,
    );
    expect(
      screen.queryByText("第三者ノートのテキストです。"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ペルソナのテキストです。"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("これがコアセンテンスです。"),
    ).not.toBeInTheDocument();
  });
});

describe("ResultCard - character-fortune variant", () => {
  const characterContent: CharacterFortuneDetailedContent = {
    variant: "character-fortune",
    characterIntro: "キャラクターの自己紹介テキストです。",
    behaviorsHeading: "キャラが語るあるある",
    behaviors: ["キャラあるある1", "キャラあるある2"],
    characterMessageHeading: "キャラからの本音",
    characterMessage: "キャラクターメッセージの内容です。",
    thirdPartyNote: "第三者視点のテキストです。",
    compatibilityPrompt: "相性診断への誘導文です。",
  };

  test("characterIntro + behaviors(with heading) + characterMessage(with heading) が表示されること", () => {
    render(<ResultCard {...defaultProps} detailedContent={characterContent} />);
    expect(
      screen.getByText("キャラクターの自己紹介テキストです。"),
    ).toBeInTheDocument();
    expect(screen.getByText("キャラが語るあるある")).toBeInTheDocument();
    expect(screen.getByText("キャラあるある1")).toBeInTheDocument();
    expect(screen.getByText("キャラあるある2")).toBeInTheDocument();
    expect(screen.getByText("キャラからの本音")).toBeInTheDocument();
    expect(
      screen.getByText("キャラクターメッセージの内容です。"),
    ).toBeInTheDocument();
  });

  test("thirdPartyNote / compatibilityPrompt が表示されないこと", () => {
    render(<ResultCard {...defaultProps} detailedContent={characterContent} />);
    expect(
      screen.queryByText("第三者視点のテキストです。"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("相性診断への誘導文です。"),
    ).not.toBeInTheDocument();
  });
});

describe("ResultCard - DOM順序", () => {
  test("detailedSection が ShareButtons より先に表示されること", () => {
    const domOrderContent: QuizResultDetailedContent = {
      traits: ["特徴1"],
      behaviors: ["あるある1"],
      advice: "アドバイス",
    };

    const { container } = render(
      <ResultCard {...defaultProps} detailedContent={domOrderContent} />,
    );

    const shareButtons = container.querySelector(
      "[data-testid='share-buttons']",
    );
    const behaviorsItem = screen.getByText("あるある1").closest("li");

    expect(shareButtons).toBeInTheDocument();
    expect(behaviorsItem).toBeInTheDocument();

    if (shareButtons && behaviorsItem) {
      // behaviorsItemがshareButtonsより前に現れることを確認
      const position = shareButtons.compareDocumentPosition(behaviorsItem);
      // Node.DOCUMENT_POSITION_PRECEDING = 2 (behaviorsItemがshareButtonsより前)
      expect(position & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    }
  });
});

describe("ResultCard - humorMetrics省略時", () => {
  test("humorMetricsがundefinedの場合、テーブルが表示されないこと", () => {
    const contrarianContentNoMetrics: ContrarianFortuneDetailedContent = {
      variant: "contrarian-fortune",
      catchphrase: "キャッチフレーズ",
      coreSentence: "コアセンテンス",
      behaviors: ["あるある1"],
      persona: "ペルソナ",
      thirdPartyNote: "第三者ノート",
      // humorMetrics は省略
    };

    const { container } = render(
      <ResultCard
        {...defaultProps}
        detailedContent={contrarianContentNoMetrics}
      />,
    );
    expect(container.querySelector("table")).toBeNull();
  });

  test("humorMetricsが空配列の場合、テーブルが表示されないこと", () => {
    const contrarianContentEmptyMetrics: ContrarianFortuneDetailedContent = {
      variant: "contrarian-fortune",
      catchphrase: "キャッチフレーズ",
      coreSentence: "コアセンテンス",
      behaviors: ["あるある1"],
      persona: "ペルソナ",
      thirdPartyNote: "第三者ノート",
      humorMetrics: [],
    };

    const { container } = render(
      <ResultCard
        {...defaultProps}
        detailedContent={contrarianContentEmptyMetrics}
      />,
    );
    expect(container.querySelector("table")).toBeNull();
  });
});
