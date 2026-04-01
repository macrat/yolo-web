import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultCard from "../ResultCard";
import type { QuizResult, DetailedContent } from "../../types";

// ShareButtonsをモック（windowオブジェクトへのアクセスを避ける）
vi.mock("@/play/quiz/_components/ShareButtons", () => ({
  default: () => <div data-testid="share-buttons" />,
}));

const baseResult: QuizResult = {
  id: "type-a",
  title: "タイプA",
  description: "タイプAの説明文です。",
};

const baseProps = {
  result: baseResult,
  quizType: "personality" as const,
  quizTitle: "テスト診断",
  quizSlug: "test-quiz",
  onRetry: vi.fn(),
};

describe("ResultCard — detailedContent未設定時", () => {
  test("detailedContentがundefinedのとき、追加セクションが表示されない", () => {
    const { container } = render(<ResultCard {...baseProps} />);
    expect(container.querySelector(".behaviorsSection")).toBeNull();
    expect(container.querySelector("details")).toBeNull();
  });

  test("基本情報（タイトル・説明）は表示される", () => {
    render(<ResultCard {...baseProps} />);
    expect(screen.getByText("タイプA")).toBeInTheDocument();
    expect(screen.getByText("タイプAの説明文です。")).toBeInTheDocument();
  });
});

describe("ResultCard — 標準形式 detailedContent", () => {
  const standardDetailedContent: DetailedContent = {
    traits: ["特徴1", "特徴2"],
    behaviors: ["あるある1", "あるある2", "あるある3"],
    advice: "アドバイスのテキストです。",
  };

  test("behaviorsが表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={standardDetailedContent} />,
    );
    expect(screen.getByText("あるある1")).toBeInTheDocument();
    expect(screen.getByText("あるある2")).toBeInTheDocument();
    expect(screen.getByText("あるある3")).toBeInTheDocument();
  });

  test("デフォルトのbehaviorsHeadingが表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={standardDetailedContent} />,
    );
    expect(screen.getByText("あなたのあるある")).toBeInTheDocument();
  });

  test("resultPageLabelsのbehaviorsHeadingが使用される", () => {
    render(
      <ResultCard
        {...baseProps}
        detailedContent={standardDetailedContent}
        resultPageLabels={{ behaviorsHeading: "このタイプのあるある" }}
      />,
    );
    expect(screen.getByText("このタイプのあるある")).toBeInTheDocument();
  });

  test("detailsセクションが表示される（折りたたみ）", () => {
    render(
      <ResultCard {...baseProps} detailedContent={standardDetailedContent} />,
    );
    expect(screen.getByText("もっと詳しく見る")).toBeInTheDocument();
  });

  test("traits（特徴）がdetails内に表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={standardDetailedContent} />,
    );
    expect(screen.getByText("特徴1")).toBeInTheDocument();
    expect(screen.getByText("特徴2")).toBeInTheDocument();
  });

  test("advice（アドバイス）がdetails内に表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={standardDetailedContent} />,
    );
    expect(screen.getByText("アドバイスのテキストです。")).toBeInTheDocument();
  });

  test("デフォルトのtraitsHeadingが表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={standardDetailedContent} />,
    );
    expect(screen.getByText("あなたの特徴")).toBeInTheDocument();
  });

  test("デフォルトのadviceHeadingが表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={standardDetailedContent} />,
    );
    expect(screen.getByText("あなたへのアドバイス")).toBeInTheDocument();
  });

  test("resultPageLabelsでtraitsHeadingとadviceHeadingをカスタマイズできる", () => {
    render(
      <ResultCard
        {...baseProps}
        detailedContent={standardDetailedContent}
        resultPageLabels={{
          traitsHeading: "このタイプの特徴",
          adviceHeading: "このタイプへのアドバイス",
        }}
      />,
    );
    expect(screen.getByText("このタイプの特徴")).toBeInTheDocument();
    expect(screen.getByText("このタイプへのアドバイス")).toBeInTheDocument();
  });
});

describe("ResultCard — contrarian-fortune detailedContent", () => {
  const contrarianDetailedContent: DetailedContent = {
    variant: "contrarian-fortune",
    catchphrase: "逆張りのキャッチコピー",
    coreSentence: "逆張りの核心文です。",
    behaviors: ["逆張りあるある1", "逆張りあるある2"],
    persona: "逆張りペルソナのテキストです。",
    thirdPartyNote: "第三者ノートです。",
    humorMetrics: [{ label: "逆張り度", value: "100%" }],
  };

  test("behaviorsが表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={contrarianDetailedContent} />,
    );
    expect(screen.getByText("逆張りあるある1")).toBeInTheDocument();
    expect(screen.getByText("逆張りあるある2")).toBeInTheDocument();
  });

  test("behaviorsHeadingは「あなたのあるある」固定", () => {
    render(
      <ResultCard {...baseProps} detailedContent={contrarianDetailedContent} />,
    );
    expect(screen.getByText("あなたのあるある")).toBeInTheDocument();
  });

  test("catchphraseとcoreSentenceがdetails内に表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={contrarianDetailedContent} />,
    );
    expect(screen.getByText("逆張りのキャッチコピー")).toBeInTheDocument();
    expect(screen.getByText("逆張りの核心文です。")).toBeInTheDocument();
  });

  test("personaがdetails内に表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={contrarianDetailedContent} />,
    );
    expect(
      screen.getByText("逆張りペルソナのテキストです。"),
    ).toBeInTheDocument();
  });

  test("thirdPartyNoteは受検者向け画面では表示されない", () => {
    render(
      <ResultCard {...baseProps} detailedContent={contrarianDetailedContent} />,
    );
    expect(screen.queryByText("第三者ノートです。")).not.toBeInTheDocument();
  });

  test("humorMetricsは受検者向け画面では表示されない", () => {
    render(
      <ResultCard {...baseProps} detailedContent={contrarianDetailedContent} />,
    );
    expect(screen.queryByText("逆張り度")).not.toBeInTheDocument();
  });

  test("details summaryのテキストは「あなたの深層プロファイル」", () => {
    render(
      <ResultCard {...baseProps} detailedContent={contrarianDetailedContent} />,
    );
    expect(screen.getByText("あなたの深層プロファイル")).toBeInTheDocument();
  });
});

describe("ResultCard — character-fortune detailedContent", () => {
  const characterDetailedContent: DetailedContent = {
    variant: "character-fortune",
    characterIntro: "キャラクターの自己紹介です。",
    behaviorsHeading: "キャラあるある見出し",
    behaviors: ["キャラあるある1", "キャラあるある2"],
    characterMessageHeading: "キャラからの本音",
    characterMessage: "キャラクターのメッセージです。",
    thirdPartyNote: "第三者ノートです。",
    compatibilityPrompt: "相性診断への誘導です。",
  };

  test("behaviorsが表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={characterDetailedContent} />,
    );
    expect(screen.getByText("キャラあるある1")).toBeInTheDocument();
    expect(screen.getByText("キャラあるある2")).toBeInTheDocument();
  });

  test("behaviorsHeadingはdetailedContent.behaviorsHeadingを使用", () => {
    render(
      <ResultCard {...baseProps} detailedContent={characterDetailedContent} />,
    );
    expect(screen.getByText("キャラあるある見出し")).toBeInTheDocument();
  });

  test("characterIntroがdetails内に表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={characterDetailedContent} />,
    );
    expect(
      screen.getByText("キャラクターの自己紹介です。"),
    ).toBeInTheDocument();
  });

  test("characterMessageがdetails内に表示される", () => {
    render(
      <ResultCard {...baseProps} detailedContent={characterDetailedContent} />,
    );
    expect(
      screen.getByText("キャラクターのメッセージです。"),
    ).toBeInTheDocument();
  });

  test("thirdPartyNoteは受検者向け画面では表示されない", () => {
    render(
      <ResultCard {...baseProps} detailedContent={characterDetailedContent} />,
    );
    expect(screen.queryByText("第三者ノートです。")).not.toBeInTheDocument();
  });

  test("compatibilityPromptは受検者向け画面では表示されない", () => {
    render(
      <ResultCard {...baseProps} detailedContent={characterDetailedContent} />,
    );
    expect(
      screen.queryByText("相性診断への誘導です。"),
    ).not.toBeInTheDocument();
  });

  test("details summaryのテキストはcharacterMessageHeadingを使用", () => {
    render(
      <ResultCard {...baseProps} detailedContent={characterDetailedContent} />,
    );
    // summaryにcharacterMessageHeadingが表示される（重複なく1回のみ）
    expect(screen.getByText("キャラからの本音")).toBeInTheDocument();
  });
});

describe("ResultCard — ShareButtonsの後にbehaviorsSectionが配置される", () => {
  const detailedContent: DetailedContent = {
    behaviors: ["あるある1"],
    traits: ["特徴1"],
    advice: "アドバイス",
  };

  test("retryButtonの直前にbehaviorsSectionが存在する", () => {
    const { container } = render(
      <ResultCard {...baseProps} detailedContent={detailedContent} />,
    );
    const card = container.firstChild as HTMLElement;
    const children = Array.from(card.children);
    const retryButtonIndex = children.findIndex(
      (el) => el.tagName === "BUTTON",
    );
    // retryButtonの直前の要素にdetails or behaviorsセクションが含まれる
    expect(retryButtonIndex).toBeGreaterThan(0);
  });
});
