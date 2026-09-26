import { expect, test, vi, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ResultCard from "../ResultCard";
import type {
  QuizResult,
  QuizResultDetailedContent,
  ContrarianFortuneDetailedContent,
  CharacterFortuneDetailedContent,
  AnimalPersonalityDetailedContent,
  MusicPersonalityDetailedContent,
  TraditionalColorDetailedContent,
  YojiPersonalityDetailedContent,
  UnexpectedCompatibilityDetailedContent,
  ImpossibleAdviceDetailedContent,
} from "../../types";

// next/dynamicをモック: テスト環境では vi.mock によりモジュールが同期的にキャッシュされるため、
// loaderが返すPromiseを同期的に評価できる。
// ただし Promise.then は常に非同期のため、別のアプローチを取る:
// vi.mock でモジュールがすでに登録されているため、
// loader() を呼んでその結果をトップレベルで await するのではなく、
// vi.mock ファクトリ内での特定のモジュールパスに対するマッピングを使う。
vi.mock("next/dynamic", async () => {
  // AnimalPersonalityContent / MusicPersonalityContent / TraditionalColorContent
  // を事前にインポートして同期キャッシュする。ほかの *Content は data-testid を持つスタブで代替する。
  const animal =
    await import("@/play/quiz/_components/AnimalPersonalityContent");
  const music = await import("@/play/quiz/_components/MusicPersonalityContent");
  const traditionalColor =
    await import("@/play/quiz/_components/TraditionalColorContent");

  return {
    default: (
      loader: () => Promise<{
        default: React.ComponentType<Record<string, unknown>>;
      }>,
    ) => {
      // loaderの文字列表現から対応するコンポーネントを選択する。
      // loader.toString() でインポートパスを取得し、適切なモックを返す。
      const loaderStr = loader.toString();
      let cachedComp: React.ComponentType<Record<string, unknown>>;
      if (loaderStr.includes("AnimalPersonalityContent")) {
        cachedComp = animal.default as unknown as React.ComponentType<
          Record<string, unknown>
        >;
      } else if (loaderStr.includes("MusicPersonalityContent")) {
        cachedComp = music.default as unknown as React.ComponentType<
          Record<string, unknown>
        >;
      } else if (loaderStr.includes("TraditionalColorContent")) {
        cachedComp = traditionalColor.default as unknown as React.ComponentType<
          Record<string, unknown>
        >;
      } else if (loaderStr.includes("YojiPersonalityContent")) {
        // YojiPersonalityContent を data-testid を持つスタブで代替
        cachedComp = (props: Record<string, unknown>) =>
          React.createElement(
            "div",
            { "data-testid": "yoji-personality-content" },
            String(
              (props.content as Record<string, unknown>)?.kanjiBreakdown ?? "",
            ),
          );
      } else if (loaderStr.includes("UnexpectedCompatibilityContent")) {
        // UnexpectedCompatibilityContent を data-testid を持つスタブで代替
        cachedComp = (props: Record<string, unknown>) =>
          React.createElement(
            "div",
            { "data-testid": "unexpected-compatibility-content" },
            String(
              (props.detailedContent as Record<string, unknown>)
                ?.entityEssence ?? "",
            ),
          );
      } else if (loaderStr.includes("ImpossibleAdviceContent")) {
        // ImpossibleAdviceContent を data-testid を持つスタブで代替
        cachedComp = (props: Record<string, unknown>) =>
          React.createElement(
            "div",
            { "data-testid": "impossible-advice-content" },
            String(
              (props.detailedContent as Record<string, unknown>)
                ?.diagnosisCore ?? "",
            ),
          );
      } else if (loaderStr.includes("ContrarianFortuneContent")) {
        // ContrarianFortuneContent を data-testid を持つスタブで代替
        // coreSentence / persona / thirdPartyNote を表示して実装通りの動作を検証できるようにする
        cachedComp = (props: Record<string, unknown>) => {
          const dc = props.detailedContent as Record<string, unknown>;
          return React.createElement(
            "div",
            { "data-testid": "contrarian-fortune-content" },
            React.createElement("div", null, String(dc?.coreSentence ?? "")),
            React.createElement("div", null, String(dc?.persona ?? "")),
            React.createElement("div", null, String(dc?.thirdPartyNote ?? "")),
          );
        };
      } else {
        // 未知のコンポーネントはfallback
        cachedComp = () => null;
      }

      function DynamicStub(props: Record<string, unknown>) {
        return React.createElement(cachedComp, props);
      }
      DynamicStub.displayName = "DynamicStub";
      return DynamicStub;
    },
  };
});

// ShareButtonsコンポーネントをモック（Web Share APIなどの依存を排除）
vi.mock("@/components/ShareButtons", () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="share-buttons">
      <span>{text}</span>
    </div>
  ),
}));

// CompatibilitySectionコンポーネントをモック
vi.mock("@/play/quiz/_components/CompatibilitySection", () => ({
  default: ({
    myType,
    friendType,
  }: {
    myType: { id: string; title: string };
    friendType: { id: string; title: string };
  }) => (
    <div data-testid="compatibility-section">
      <span>{myType.title}</span>
      <span>{friendType.title}</span>
    </div>
  ),
}));

// MusicPersonalityContentコンポーネントをモック
// MusicPersonalityContent は referrerTypeId を受け取り、相性セクション・招待ボタンを内部で生成する
vi.mock("@/play/quiz/_components/MusicPersonalityContent", () => ({
  default: ({
    content,
    referrerTypeId,
    afterTodayAction,
  }: {
    content: {
      strengths: string[];
      weaknesses: string[];
      behaviors: string[];
      todayAction: string;
    };
    referrerTypeId?: string;
    afterTodayAction?: React.ReactNode;
  }) => {
    // モック版の相性判定ロジック（music-personalityデータモックと合わせる）
    const validIds = ["festival-pioneer", "playlist-evangelist"];
    const showCompatibility =
      referrerTypeId && validIds.includes(referrerTypeId);

    return (
      <div data-testid="music-personality-content">
        {content.strengths.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
        {content.weaknesses.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
        {content.behaviors.map((b, i) => (
          <span key={i}>{b}</span>
        ))}
        <span>{content.todayAction}</span>
        {afterTodayAction ??
          (showCompatibility ? (
            <>
              <div data-testid="compatibility-section">
                <span>相性セクション</span>
              </div>
              <div data-testid="invite-friend-button">
                <span>音楽性格診断で相性を調べよう!</span>
              </div>
            </>
          ) : (
            <div data-testid="invite-friend-button">
              <span>音楽性格診断で相性を調べよう!</span>
            </div>
          ))}
      </div>
    );
  },
}));

// InviteFriendButtonコンポーネントをモック
vi.mock("@/play/quiz/_components/InviteFriendButton", () => ({
  default: ({ inviteText }: { inviteText: string }) => (
    <div data-testid="invite-friend-button">
      <span>{inviteText}</span>
    </div>
  ),
}));

// traditional-colorデータモジュールをモック
vi.mock("@/play/quiz/data/traditional-color", () => ({
  default: {
    meta: {
      slug: "traditional-color",
      title: "伝統色で性格診断",
      questionCount: 10,
    },
    results: [
      {
        id: "ai-iro",
        title: "藍色",
        color: "#1e3a5f",
        icon: "🔵",
      },
      {
        id: "kurenai",
        title: "紅色",
        color: "#c0392b",
        icon: "🔴",
      },
    ],
  },
}));

// music-personalityデータモジュールをモック
vi.mock("@/play/quiz/data/music-personality", () => ({
  default: {
    meta: {
      slug: "music-personality",
      title: "音楽性格診断",
      accentColor: "#7c3aed",
      questionCount: 10,
    },
    results: [
      {
        id: "festival-pioneer",
        title: "フェス一番乗り族",
        icon: "🎪",
      },
      {
        id: "playlist-evangelist",
        title: "プレイリスト伝道師",
        icon: "🎧",
      },
    ],
  },
  getCompatibility: (typeA: string, typeB: string) => {
    if (
      (typeA === "festival-pioneer" && typeB === "playlist-evangelist") ||
      (typeA === "playlist-evangelist" && typeB === "festival-pioneer")
    ) {
      return { label: "音楽相性テスト", description: "音楽相性テスト説明" };
    }
    return undefined;
  },
  isValidMusicTypeId: (id: string) =>
    ["festival-pioneer", "playlist-evangelist"].includes(id),
}));

// animal-personalityデータモジュールをモック
vi.mock("@/play/quiz/data/animal-personality", () => ({
  default: {
    meta: {
      slug: "animal-personality",
      title: "日本にしかいない動物で性格診断",
      accentColor: "#16a34a",
      questionCount: 10,
    },
    results: [
      {
        id: "nihon-zaru",
        title: "ニホンザル",
        icon: "🐵",
        detailedContent: {
          variant: "animal-personality",
          catchphrase: "テストキャッチコピー",
          strengths: ["強み1", "強み2"],
          weaknesses: ["弱み1"],
          behaviors: ["あるある1"],
          todayAction: "テストアクション",
        },
      },
      {
        id: "hondo-tanuki",
        title: "ホンドタヌキ",
        icon: "🦝",
        detailedContent: {
          variant: "animal-personality",
          catchphrase: "タヌキキャッチコピー",
          strengths: ["タヌキ強み1"],
          weaknesses: ["タヌキ弱み1"],
          behaviors: ["タヌキあるある1"],
          todayAction: "タヌキアクション",
        },
      },
    ],
  },
  getCompatibility: (typeA: string, typeB: string) => {
    if (
      (typeA === "nihon-zaru" && typeB === "hondo-tanuki") ||
      (typeA === "hondo-tanuki" && typeB === "nihon-zaru")
    ) {
      return { label: "テスト相性", description: "テスト相性説明" };
    }
    return undefined;
  },
  isValidAnimalTypeId: (id: string) =>
    ["nihon-zaru", "hondo-tanuki"].includes(id),
}));

// impossible-adviceデータモジュールをモック
vi.mock("@/play/quiz/data/impossible-advice", () => ({
  default: {
    meta: {
      slug: "impossible-advice",
      title: "達成困難アドバイス診断",
      accentColor: "#7c3aed",
      questionCount: 7,
    },
    results: [
      {
        id: "timemagician",
        title: "時間魔術師見習い",
        description: "説明1",
        color: "#7c3aed",
        icon: "⏰",
      },
      {
        id: "gravityfighter",
        title: "重力と戦う者",
        description: "説明2",
        color: "#dc2626",
        icon: "💪",
      },
    ],
  },
}));

// unexpected-compatibilityデータモジュールをモック
vi.mock("@/play/quiz/data/unexpected-compatibility", () => ({
  default: {
    meta: {
      slug: "unexpected-compatibility",
      title: "斜め上の相性診断",
      accentColor: "#0891b2",
      questionCount: 8,
    },
    results: [
      {
        id: "vendingmachine",
        title: "自動販売機",
        description: "説明1",
        color: "#0891b2",
        icon: "🥤",
      },
      {
        id: "oldclock",
        title: "古い掛け時計",
        description: "説明2",
        color: "#92400e",
        icon: "🕰️",
      },
    ],
  },
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

/**
 * 色をインラインスタイルで持つ要素。色見本（主題が色の項目）を除く。
 * タイプやクイズの色は装飾に使わず、結果の包みも和色を data-color で選ぶので、ほかに色を入れる要素は無い（DESIGN.md §2）。
 */
function inlineColoredElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[style]")).filter(
    (el) =>
      /color|background/i.test(el.getAttribute("style") ?? "") &&
      !el.className.includes("swatch"),
  );
}

const defaultProps = {
  result: baseResult,
  quizType: "personality" as const,
  quizTitle: "テストクイズ",
  quizSlug: "test-quiz",
  onRetry: vi.fn(),
};

describe("ResultCard - 結果を包み（Tsutsumi）で見せる（personality 型のみ）", () => {
  // 適用条件: quizType === "personality" かつ result.icon と result.color が両方存在。
  const tsutsumiResult: QuizResult = {
    id: "type-a",
    title: "包みのタイプ",
    description: "包みの説明です。",
    icon: "🦊",
    color: "#c0392b",
  };

  test("personality + icon + color のとき結果が包み（Tsutsumi）で表示される（診断完了ラベル・タイプ名・絵文字なし）", () => {
    const { container } = render(
      <ResultCard {...defaultProps} result={tsutsumiResult} />,
    );
    // 到達の承認ラベル（包み表示時のみ）
    expect(screen.getByText("診断完了")).toBeInTheDocument();
    // タイプ名は包みの核として表示される（複数箇所に出現しうるため queryAllByText で存在だけ確認）
    expect(screen.queryAllByText("包みのタイプ").length).toBeGreaterThan(0);
    // Tsutsumi（包み）が figure として描画され、和色8色のいずれかに決定的に写像される
    const tsutsumi = container.querySelector("figure[data-color]");
    expect(tsutsumi).not.toBeNull();
    expect([
      "kurenai",
      "kaki",
      "yamabuki",
      "moegi",
      "tokiwa",
      "ai",
      "fuji",
      "suou",
    ]).toContain(tsutsumi?.getAttribute("data-color"));
    // 絵文字（result.icon）は装飾として描画しない（DESIGN.md §5 絵文字を置かない）
    expect(screen.queryByText("🦊")).not.toBeInTheDocument();
  });

  test("包みで見せる結果タイトルは見出し(h2)で描画される（SRの見出しナビで結果に到達できる・WCAG 1.3.1）", () => {
    render(<ResultCard {...defaultProps} result={tsutsumiResult} />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "包みのタイプ",
    });
    expect(heading.tagName).toBe("H2");
  });

  test("color 欠落時は抑制ヘッダにフォールバック（診断完了ラベル・象徴を出さない）", () => {
    // baseResult は icon はあるが color なし
    render(<ResultCard {...defaultProps} />);
    expect(screen.queryByText("診断完了")).not.toBeInTheDocument();
    // フォールバック時は象徴アイコンを出さない
    expect(screen.queryByText("🧪")).not.toBeInTheDocument();
    // タイプ名と「あなたの結果」ラベルは表示される
    expect(screen.getByText("テスト結果")).toBeInTheDocument();
    expect(screen.getByText("あなたの結果")).toBeInTheDocument();
  });

  test("knowledge 型は icon/color があっても包みを出さずフォールバックする", () => {
    render(
      <ResultCard
        {...defaultProps}
        quizType="knowledge"
        result={tsutsumiResult}
      />,
    );
    expect(screen.queryByText("診断完了")).not.toBeInTheDocument();
    expect(screen.getByText("包みのタイプ")).toBeInTheDocument();
    expect(screen.getByText("あなたの結果")).toBeInTheDocument();
  });
});

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

  test("traits（持ち味）が表示されること", () => {
    render(<ResultCard {...defaultProps} detailedContent={standardContent} />);
    // 診断を遊んだ本人にも持ち味を届けるため、結果のページと同じく traits を表示する。
    expect(screen.getByText("特徴1")).toBeInTheDocument();
    expect(screen.getByText("特徴2")).toBeInTheDocument();
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

describe("ResultCard - Standard variant すべてのタイプの一覧", () => {
  // 標準形式（variant なし）の診断（word-sense-personality）も、variant の診断と同じくすべてのタイプを並べる。
  const standardContent: QuizResultDetailedContent = {
    traits: ["特徴1"],
    behaviors: ["あるある1"],
    advice: "アドバイス",
  };
  const currentResult: QuizResult = {
    id: "type-a",
    title: "タイプA",
    description: "タイプAの説明です。",
    icon: "🅰️",
  };
  const allTypes: QuizResult[] = [
    {
      id: "type-a",
      title: "タイプA",
      description: "タイプAの説明",
      icon: "🅰️",
    },
    {
      id: "type-b",
      title: "タイプB",
      description: "タイプBの説明",
      icon: "🅱️",
    },
    {
      id: "type-c",
      title: "タイプC",
      description: "タイプCの説明",
      icon: "🌟",
    },
  ];

  test("allResults が複数あるとき、見出しがタイプの数を言うすべてのタイプが表示されること", () => {
    render(
      <ResultCard
        {...defaultProps}
        result={currentResult}
        detailedContent={standardContent}
        allResults={allTypes}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "すべてのタイプ（3）" }),
    ).toBeInTheDocument();
  });

  test("自タイプ以外は同一診断の結果ページへのリンクになること", () => {
    render(
      <ResultCard
        {...defaultProps}
        result={currentResult}
        detailedContent={standardContent}
        allResults={allTypes}
      />,
    );
    expect(screen.getByText("タイプB").closest("a")).toHaveAttribute(
      "href",
      "/play/test-quiz/result/type-b",
    );
    expect(screen.getByText("タイプC").closest("a")).toHaveAttribute(
      "href",
      "/play/test-quiz/result/type-c",
    );
  });

  test("自分のタイプの行は、結果のページへ移るので、現在地でなくいまの項目（aria-current=true）で示すこと", () => {
    render(
      <ResultCard
        {...defaultProps}
        result={currentResult}
        detailedContent={standardContent}
        allResults={allTypes}
      />,
    );
    expect(screen.getByRole("link", { name: "タイプA" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("allResults が未指定の場合はナビが表示されないこと", () => {
    render(
      <ResultCard
        {...defaultProps}
        result={currentResult}
        detailedContent={standardContent}
      />,
    );
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
  });

  test("allResults が1件のみの場合はナビが表示されないこと", () => {
    render(
      <ResultCard
        {...defaultProps}
        result={currentResult}
        detailedContent={standardContent}
        allResults={[allTypes[0]]}
      />,
    );
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
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

  test("ContrarianFortuneContent コンポーネントが使われること（data-testid で確認）", () => {
    render(
      <ResultCard
        {...defaultProps}
        detailedContent={contrarianContent}
        allResults={[]}
      />,
    );
    expect(
      screen.getByTestId("contrarian-fortune-content"),
    ).toBeInTheDocument();
  });

  test("catchphrase が ResultCard 上部に表示されること", () => {
    render(
      <ResultCard
        {...defaultProps}
        detailedContent={contrarianContent}
        allResults={[]}
      />,
    );
    expect(screen.getByText("これがキャッチフレーズです")).toBeInTheDocument();
  });

  test("ContrarianFortuneContent に coreSentence / persona / thirdPartyNote が渡されること", () => {
    render(
      <ResultCard
        {...defaultProps}
        detailedContent={contrarianContent}
        allResults={[]}
      />,
    );
    // スタブコンポーネントがこれらのフィールドを表示する
    expect(screen.getByText("これがコアセンテンスです。")).toBeInTheDocument();
    expect(screen.getByText("ペルソナのテキストです。")).toBeInTheDocument();
    expect(
      screen.getByText("第三者ノートのテキストです。"),
    ).toBeInTheDocument();
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

describe("ResultCard - animal-personality variant", () => {
  const animalContent: AnimalPersonalityDetailedContent = {
    variant: "animal-personality",
    catchphrase: "場の空気を作るのは、いつもあなたから始まる。",
    strengths: ["推進力がある", "情報感度が高い"],
    weaknesses: ["モチベのオンオフが極端"],
    behaviors: [
      "新しいカフェを見つけた瞬間、友達にスクリーンショットを送っている。",
    ],
    todayAction: "次の集まりで幹事を誰か別の人に任せてみてください。",
  };

  const animalResult: QuizResult = {
    id: "nihon-zaru",
    title: "ニホンザル -- 温泉を発明した革命児",
    description: "あなたはニホンザルタイプです。",
    icon: "🐵",
  };

  const animalProps = {
    result: animalResult,
    quizType: "personality" as const,
    quizTitle: "日本にしかいない動物で性格診断",
    quizSlug: "animal-personality",
    onRetry: vi.fn(),
    detailedContent: animalContent,
  };

  test("catchphrase が description の前に表示されること", () => {
    const { container } = render(<ResultCard {...animalProps} />);
    const catchphrase = screen.getByText(
      "場の空気を作るのは、いつもあなたから始まる。",
    );
    const description = screen.getByText("あなたはニホンザルタイプです。");

    expect(catchphrase).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // catchphraseがdescriptionより前に現れることを確認
    const position = description.compareDocumentPosition(catchphrase);
    // Node.DOCUMENT_POSITION_PRECEDING = 2 (catchphraseがdescriptionより前)
    expect(position & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();

    void container;
  });

  test("strengths が表示されること", () => {
    render(<ResultCard {...animalProps} />);
    expect(screen.getByText("推進力がある")).toBeInTheDocument();
    expect(screen.getByText("情報感度が高い")).toBeInTheDocument();
    expect(screen.getByText("このタイプの強み")).toBeInTheDocument();
  });

  test("weaknesses が表示されること", () => {
    render(<ResultCard {...animalProps} />);
    expect(screen.getByText("モチベのオンオフが極端")).toBeInTheDocument();
    expect(screen.getByText("このタイプの弱み")).toBeInTheDocument();
  });

  test("behaviors が表示されること", () => {
    render(<ResultCard {...animalProps} />);
    expect(
      screen.getByText(
        "新しいカフェを見つけた瞬間、友達にスクリーンショットを送っている。",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("この動物に似た行動パターン")).toBeInTheDocument();
  });

  test("todayAction が表示されること", () => {
    render(<ResultCard {...animalProps} />);
    expect(
      screen.getByText("次の集まりで幹事を誰か別の人に任せてみてください。"),
    ).toBeInTheDocument();
    expect(screen.getByText("今日試してほしいこと")).toBeInTheDocument();
  });

  test("referrerTypeIdなしの場合、InviteFriendButton が表示されること", () => {
    render(<ResultCard {...animalProps} />);
    expect(screen.getByTestId("invite-friend-button")).toBeInTheDocument();
    expect(
      screen.queryByTestId("compatibility-section"),
    ).not.toBeInTheDocument();
  });

  test("有効なreferrerTypeIdがある場合、CompatibilitySection が表示されること", () => {
    render(<ResultCard {...animalProps} referrerTypeId="hondo-tanuki" />);
    // 相性セクションが表示される
    expect(screen.getByTestId("compatibility-section")).toBeInTheDocument();
    // 相性表示時もInviteFriendButtonは表示される（友達に送る動線）
    expect(screen.getByTestId("invite-friend-button")).toBeInTheDocument();
  });

  test("全タイプ一覧が表示されること", () => {
    render(<ResultCard {...animalProps} />);
    // モックデータには nihon-zaru と hondo-tanuki の2タイプが存在
    expect(screen.getByText("ニホンザル")).toBeInTheDocument();
    expect(screen.getByText("ホンドタヌキ")).toBeInTheDocument();
  });

  test("タイプやクイズの色を、どの要素にもインラインスタイルで入れないこと", () => {
    const { container } = render(<ResultCard {...animalProps} />);
    expect(inlineColoredElements(container)).toEqual([]);
  });

  test("AnimalPersonalityContent の wrapper クラスが存在すること", () => {
    const { container } = render(<ResultCard {...animalProps} />);
    const wrapper = container.querySelector("[class*='wrapper']");
    expect(wrapper).not.toBeNull();
  });
});

describe("ResultCard - catchphrase に色を入れない", () => {
  const animalContent: AnimalPersonalityDetailedContent = {
    variant: "animal-personality",
    catchphrase: "動物キャッチコピー",
    strengths: ["強み1"],
    weaknesses: ["弱み1"],
    behaviors: ["あるある1"],
    todayAction: "今日のアクション",
  };
  const animalResult: QuizResult = {
    id: "nihon-zaru",
    title: "ニホンザル",
    description: "説明文",
    icon: "🐵",
  };

  const musicContent: MusicPersonalityDetailedContent = {
    variant: "music-personality",
    catchphrase: "音楽キャッチコピー",
    strengths: ["音楽強み1"],
    weaknesses: ["音楽弱み1"],
    behaviors: ["音楽あるある1"],
    todayAction: "音楽アクション",
  };
  const musicResult: QuizResult = {
    id: "festival-pioneer",
    title: "フェス一番乗り族",
    description: "フェス説明文",
    icon: "🎪",
  };

  test("animal-personality: catchphraseBeforeDescription がインラインスタイルを持たないこと", () => {
    const { container } = render(
      <ResultCard
        result={animalResult}
        quizType="personality"
        quizTitle="動物診断"
        quizSlug="animal-personality"
        onRetry={vi.fn()}
        detailedContent={animalContent}
      />,
    );
    const catchphraseEl = container.querySelector(
      "[class*='catchphraseBeforeDescription']",
    );
    expect(catchphraseEl).not.toBeNull();
    expect(catchphraseEl?.getAttribute("style")).toBeNull();
  });

  test("music-personality: catchphraseBeforeDescription がインラインスタイルを持たないこと", () => {
    const { container } = render(
      <ResultCard
        result={musicResult}
        quizType="personality"
        quizTitle="音楽性格診断"
        quizSlug="music-personality"
        onRetry={vi.fn()}
        detailedContent={musicContent}
      />,
    );
    const catchphraseEl = container.querySelector(
      "[class*='catchphraseBeforeDescription']",
    );
    expect(catchphraseEl).not.toBeNull();
    expect(catchphraseEl?.getAttribute("style")).toBeNull();
  });
});

describe("ResultCard - music-personality variant", () => {
  const musicContent: MusicPersonalityDetailedContent = {
    variant: "music-personality",
    catchphrase: "音楽で世界を共有したい、あなたの魂。",
    strengths: ["トレンドへのアンテナが高い", "音楽で人をつなぐ力がある"],
    weaknesses: ["音楽趣味を押しつけがちになる"],
    behaviors: ["新曲をリリース当日に全曲通しで聴く。"],
    todayAction: "お気に入りの曲を1人の友達にシェアしてみてください。",
  };

  const musicResult: QuizResult = {
    id: "festival-pioneer",
    title: "フェス一番乗り族",
    description: "あなたはフェス一番乗り族タイプです。",
    icon: "🎪",
  };

  const musicProps = {
    result: musicResult,
    quizType: "personality" as const,
    quizTitle: "音楽性格診断",
    quizSlug: "music-personality",
    onRetry: vi.fn(),
    detailedContent: musicContent,
  };

  test("catchphrase が description の前に表示されること", () => {
    render(<ResultCard {...musicProps} />);
    const catchphrase =
      screen.getByText("音楽で世界を共有したい、あなたの魂。");
    const description =
      screen.getByText("あなたはフェス一番乗り族タイプです。");

    expect(catchphrase).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // catchphraseがdescriptionより前に現れることを確認
    const position = description.compareDocumentPosition(catchphrase);
    // Node.DOCUMENT_POSITION_PRECEDING = 2 (catchphraseがdescriptionより前)
    expect(position & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  test("MusicPersonalityContent コンポーネントがレンダリングされること", () => {
    render(<ResultCard {...musicProps} />);
    expect(screen.getByTestId("music-personality-content")).toBeInTheDocument();
  });

  test("strengths と weaknesses と behaviors と todayAction が表示されること", () => {
    render(<ResultCard {...musicProps} />);
    expect(screen.getByText("トレンドへのアンテナが高い")).toBeInTheDocument();
    expect(screen.getByText("音楽で人をつなぐ力がある")).toBeInTheDocument();
    expect(
      screen.getByText("音楽趣味を押しつけがちになる"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("新曲をリリース当日に全曲通しで聴く。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("お気に入りの曲を1人の友達にシェアしてみてください。"),
    ).toBeInTheDocument();
  });

  test("referrerTypeIdなしの場合、InviteFriendButton が表示されること", () => {
    render(<ResultCard {...musicProps} />);
    expect(screen.getByTestId("invite-friend-button")).toBeInTheDocument();
    expect(
      screen.queryByTestId("compatibility-section"),
    ).not.toBeInTheDocument();
  });

  test("有効なreferrerTypeIdがある場合、CompatibilitySection が表示されること", () => {
    render(<ResultCard {...musicProps} referrerTypeId="playlist-evangelist" />);
    expect(screen.getByTestId("compatibility-section")).toBeInTheDocument();
    expect(screen.getByTestId("invite-friend-button")).toBeInTheDocument();
  });
});

describe("ResultCard - traditional-color variant", () => {
  const traditionalColorContent: TraditionalColorDetailedContent = {
    variant: "traditional-color",
    catchphrase: "静けさの中に、揺るぎない芯を持つ色。",
    colorMeaning:
      "藍色は古来より日本の衣服や染め物に使われてきた深い青色です。",
    season: "夏",
    scenery: "夕暮れ時の川面に映る空の色",
    behaviors: ["細部にこだわる", "落ち着いた環境を好む"],
    colorAdvice: "あなたの静けさは、周囲に安心感を与えています。",
  };

  const traditionalColorResult: QuizResult = {
    id: "ai-iro",
    title: "藍色",
    description: "あなたは藍色タイプです。",
    color: "#1e3a5f",
    icon: "🔵",
  };

  const traditionalColorProps = {
    result: traditionalColorResult,
    quizType: "personality" as const,
    quizTitle: "伝統色で性格診断",
    quizSlug: "traditional-color",
    onRetry: vi.fn(),
    detailedContent: traditionalColorContent,
  };

  test("TraditionalColorContent がレンダリングされること（colorMeaning が表示される）", () => {
    render(<ResultCard {...traditionalColorProps} />);
    expect(
      screen.getByText(
        "藍色は古来より日本の衣服や染め物に使われてきた深い青色です。",
      ),
    ).toBeInTheDocument();
  });

  test("colorAdvice が表示されること", () => {
    render(<ResultCard {...traditionalColorProps} />);
    expect(
      screen.getByText("あなたの静けさは、周囲に安心感を与えています。"),
    ).toBeInTheDocument();
  });

  test("behaviors が表示されること", () => {
    render(<ResultCard {...traditionalColorProps} />);
    expect(screen.getByText("細部にこだわる")).toBeInTheDocument();
    expect(screen.getByText("落ち着いた環境を好む")).toBeInTheDocument();
  });

  test("catchphrase が description の前に表示されること", () => {
    render(<ResultCard {...traditionalColorProps} />);
    const catchphrase =
      screen.getByText("静けさの中に、揺るぎない芯を持つ色。");
    const description = screen.getByText("あなたは藍色タイプです。");

    expect(catchphrase).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // catchphraseがdescriptionより前に現れることを確認
    const position = description.compareDocumentPosition(catchphrase);
    // Node.DOCUMENT_POSITION_PRECEDING = 2 (catchphraseがdescriptionより前)
    expect(position & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  test("結果は包み（Tsutsumi）で表示され、タイプの色をどの要素にもインラインスタイルで入れないこと", () => {
    const { container } = render(<ResultCard {...traditionalColorProps} />);
    // catchphrase は Tsutsumi の word として包みの中に表示される（標準ヘッダの
    // catchphraseBeforeDescription は showMedal=true の間は使わない・重複防止）。
    const tsutsumi = container.querySelector("figure[data-color]");
    expect(tsutsumi).not.toBeNull();
    expect(inlineColoredElements(container)).toEqual([]);
  });

  test("全タイプ一覧が表示されること", () => {
    render(<ResultCard {...traditionalColorProps} />);
    // モックデータには藍色と紅色の2タイプが存在
    // 藍色はh2（result.title）と全タイプ一覧の両方に出るため getAllByText で確認
    const aiiroElements = screen.getAllByText("藍色");
    expect(aiiroElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("紅色")).toBeInTheDocument();
  });
});

describe("ResultCard - yoji-personality variant", () => {
  const yojiContent: YojiPersonalityDetailedContent = {
    variant: "yoji-personality",
    catchphrase: "四方を見渡す、あなたの眼力。",
    kanjiBreakdown:
      "「四」は四方、「面」は方向を示し、全体を見渡す俯瞰力を表す熟語です。",
    origin: "中国古典に由来し、全方向を視野に収める指導者像を意味します。",
    behaviors: [
      "会議で最初に全体像を把握しようとする",
      "リスクと機会を同時に考える",
    ],
    motto: "全体を見て、本質を掴め。",
  };

  const yojiResult: QuizResult = {
    id: "shimenso",
    title: "四面楚歌",
    description: "あなたは四面楚歌タイプです。",
    color: "#8b5cf6",
    icon: "🏯",
  };

  const yojiProps = {
    result: yojiResult,
    quizType: "personality" as const,
    quizTitle: "四字熟語性格診断",
    quizSlug: "yoji-personality",
    onRetry: vi.fn(),
    detailedContent: yojiContent,
  };

  test("YojiPersonalityContent コンポーネントがレンダリングされること", () => {
    render(<ResultCard {...yojiProps} />);
    expect(screen.getByTestId("yoji-personality-content")).toBeInTheDocument();
  });

  test("catchphrase が description の前に表示されること", () => {
    render(<ResultCard {...yojiProps} />);
    const catchphrase = screen.getByText("四方を見渡す、あなたの眼力。");
    const description = screen.getByText("あなたは四面楚歌タイプです。");

    expect(catchphrase).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // catchphraseがdescriptionより前に現れることを確認
    const position = description.compareDocumentPosition(catchphrase);
    // Node.DOCUMENT_POSITION_PRECEDING = 2 (catchphraseがdescriptionより前)
    expect(position & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  test("結果は包み（Tsutsumi）で表示され、タイプの色をどの要素にもインラインスタイルで入れないこと", () => {
    const { container } = render(<ResultCard {...yojiProps} />);
    // catchphrase は Tsutsumi の word として包みの中に表示される（標準ヘッダの
    // catchphraseBeforeDescription は showMedal=true の間は使わない・重複防止）。
    const tsutsumi = container.querySelector("figure[data-color]");
    expect(tsutsumi).not.toBeNull();
    expect(inlineColoredElements(container)).toEqual([]);
  });

  test("result.color が未設定の場合、catchphraseBeforeDescription がインラインスタイルを持たないこと", () => {
    const yojiResultNoColor: QuizResult = {
      ...yojiResult,
      color: undefined,
    };
    const { container } = render(
      <ResultCard {...yojiProps} result={yojiResultNoColor} />,
    );
    const catchphraseEl = container.querySelector(
      "[class*='catchphraseBeforeDescription']",
    );
    expect(catchphraseEl).not.toBeNull();
    expect(catchphraseEl?.getAttribute("style")).toBeNull();
  });
});

describe("ResultCard - unexpected-compatibility variant", () => {
  const unexpectedContent: UnexpectedCompatibilityDetailedContent = {
    variant: "unexpected-compatibility",
    catchphrase: "24時間、あなたの選択を静かに待っている",
    entityEssence:
      "自動販売機とは、選択の自由と即時の応答が詰まった箱だ。何も言わずそこにあり、押せば迷いなく応える。",
    whyCompatible:
      "あなたが自動販売機と相性が良いのは、「ちゃんと応えてくれる」という確かさを求めているから。",
    behaviors: [
      "グループLINEに誰も答えないと、気づいたら自分がまとめ役になっていた。",
      "疲れた帰り道、光っている自販機を見るとなぜか少し元気になる。",
    ],
    lifeAdvice:
      "小さな「ちゃんと応えた」の積み重ねが、やがて信頼という光になる。",
  };

  const unexpectedResult: QuizResult = {
    id: "vendingmachine",
    title: "自動販売機",
    description: "あなたと相性が良い存在は自動販売機です。",
    color: "#0891b2",
    icon: "🥤",
  };

  const unexpectedProps = {
    result: unexpectedResult,
    quizType: "personality" as const,
    quizTitle: "斜め上の相性診断",
    quizSlug: "unexpected-compatibility",
    onRetry: vi.fn(),
    detailedContent: unexpectedContent,
  };

  test("UnexpectedCompatibilityContent コンポーネントがレンダリングされること", () => {
    render(<ResultCard {...unexpectedProps} />);
    expect(
      screen.getByTestId("unexpected-compatibility-content"),
    ).toBeInTheDocument();
  });

  test("entityEssence が表示されること", () => {
    render(<ResultCard {...unexpectedProps} />);
    expect(
      screen.getByText(
        "自動販売機とは、選択の自由と即時の応答が詰まった箱だ。何も言わずそこにあり、押せば迷いなく応える。",
      ),
    ).toBeInTheDocument();
  });

  test("catchphrase が description の前に表示されること", () => {
    render(<ResultCard {...unexpectedProps} />);
    const catchphrase = screen.getByText(
      "24時間、あなたの選択を静かに待っている",
    );
    const description = screen.getByText(
      "あなたと相性が良い存在は自動販売機です。",
    );

    expect(catchphrase).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // catchphraseがdescriptionより前に現れることを確認
    const position = description.compareDocumentPosition(catchphrase);
    // Node.DOCUMENT_POSITION_PRECEDING = 2 (catchphraseがdescriptionより前)
    expect(position & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  test("結果は包み（Tsutsumi）で表示され、タイプの色をどの要素にもインラインスタイルで入れないこと", () => {
    const { container } = render(<ResultCard {...unexpectedProps} />);
    // catchphrase は Tsutsumi の word として包みの中に表示される（標準ヘッダの
    // catchphraseBeforeDescription は showMedal=true の間は使わない・重複防止）。
    const tsutsumi = container.querySelector("figure[data-color]");
    expect(tsutsumi).not.toBeNull();
    expect(inlineColoredElements(container)).toEqual([]);
  });
});

describe("ResultCard - allResults prop", () => {
  test("allResults propが渡されてもエラーが起きないこと（unexpected-compatibility）", () => {
    const unexpectedContent: UnexpectedCompatibilityDetailedContent = {
      variant: "unexpected-compatibility",
      catchphrase: "テストキャッチフレーズ",
      entityEssence: "テストエッセンス",
      whyCompatible: "テスト相性理由",
      behaviors: ["テスト行動"],
      lifeAdvice: "テストアドバイス",
    };
    const unexpectedResult: QuizResult = {
      id: "vendingmachine",
      title: "自動販売機",
      description: "テスト説明",
      color: "#0891b2",
      icon: "🥤",
    };
    const allResultsMock: QuizResult[] = [
      { id: "vendingmachine", title: "自動販売機", description: "説明1" },
      { id: "oldclock", title: "古い掛け時計", description: "説明2" },
    ];
    // allResults を明示的に渡してもエラーが起きないことを確認
    render(
      <ResultCard
        result={unexpectedResult}
        quizType="personality"
        quizTitle="斜め上の相性診断"
        quizSlug="unexpected-compatibility"
        onRetry={vi.fn()}
        detailedContent={unexpectedContent}
        allResults={allResultsMock}
      />,
    );
    expect(
      screen.getByTestId("unexpected-compatibility-content"),
    ).toBeInTheDocument();
  });

  test("allResults propが渡されてもエラーが起きないこと（impossible-advice）", () => {
    const impossibleContent: ImpossibleAdviceDetailedContent = {
      variant: "impossible-advice",
      catchphrase: "テストキャッチフレーズ",
      diagnosisCore: "テスト診断コア",
      behaviors: ["テスト行動"],
      practicalTip: "テスト実践ヒント",
    };
    const impossibleResult: QuizResult = {
      id: "timemagician",
      title: "時間魔術師見習い",
      description: "テスト説明",
      color: "#7c3aed",
      icon: "⏰",
    };
    const allResultsMock: QuizResult[] = [
      { id: "timemagician", title: "時間魔術師見習い", description: "説明1" },
      { id: "gravityfighter", title: "重力と戦う者", description: "説明2" },
    ];
    // allResults を明示的に渡してもエラーが起きないことを確認
    render(
      <ResultCard
        result={impossibleResult}
        quizType="personality"
        quizTitle="達成困難アドバイス診断"
        quizSlug="impossible-advice"
        onRetry={vi.fn()}
        detailedContent={impossibleContent}
        allResults={allResultsMock}
      />,
    );
    expect(screen.getByTestId("impossible-advice-content")).toBeInTheDocument();
  });
});

describe("ResultCard - impossible-advice variant", () => {
  const impossibleContent: ImpossibleAdviceDetailedContent = {
    variant: "impossible-advice",
    catchphrase: "時間はあなたを待ってはいない、でも操れる気がしている",
    diagnosisCore:
      "時間感覚と現実のギャップに悩むあなたへ。魔法のように時間を操れると信じているが、まだ見習い段階。",
    behaviors: [
      "締め切り1時間前まで「まだ余裕がある」と思っている",
      "「あと5分だけ」が5回繰り返される",
    ],
    practicalTip:
      "タイマーを15分単位で設定してみてください。魔術師への第一歩です。",
  };

  const impossibleResult: QuizResult = {
    id: "timemagician",
    title: "時間魔術師見習い",
    description: "あなたと相性が良い診断タイプは時間魔術師見習いです。",
    color: "#7c3aed",
    icon: "⏰",
  };

  const impossibleProps = {
    result: impossibleResult,
    quizType: "personality" as const,
    quizTitle: "達成困難アドバイス診断",
    quizSlug: "impossible-advice",
    onRetry: vi.fn(),
    detailedContent: impossibleContent,
  };

  test("ImpossibleAdviceContent コンポーネントがレンダリングされること", () => {
    render(<ResultCard {...impossibleProps} />);
    expect(screen.getByTestId("impossible-advice-content")).toBeInTheDocument();
  });

  test("diagnosisCore が表示されること", () => {
    render(<ResultCard {...impossibleProps} />);
    expect(
      screen.getByText(
        "時間感覚と現実のギャップに悩むあなたへ。魔法のように時間を操れると信じているが、まだ見習い段階。",
      ),
    ).toBeInTheDocument();
  });

  test("catchphrase が description の前に表示されること", () => {
    render(<ResultCard {...impossibleProps} />);
    const catchphrase = screen.getByText(
      "時間はあなたを待ってはいない、でも操れる気がしている",
    );
    const description = screen.getByText(
      "あなたと相性が良い診断タイプは時間魔術師見習いです。",
    );

    expect(catchphrase).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // catchphraseがdescriptionより前に現れることを確認
    const position = description.compareDocumentPosition(catchphrase);
    // Node.DOCUMENT_POSITION_PRECEDING = 2 (catchphraseがdescriptionより前)
    expect(position & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  test("結果は包み（Tsutsumi）で表示され、タイプの色をどの要素にもインラインスタイルで入れないこと", () => {
    const { container } = render(<ResultCard {...impossibleProps} />);
    // catchphrase は Tsutsumi の word として包みの中に表示される（標準ヘッダの
    // catchphraseBeforeDescription は showMedal=true の間は使わない・重複防止）。
    const tsutsumi = container.querySelector("figure[data-color]");
    expect(tsutsumi).not.toBeNull();
    expect(inlineColoredElements(container)).toEqual([]);
  });
});

describe("ResultCard - 真の残余同点の開示ブロック", () => {
  // word-sense-personality の同点時のみ QuizContainer が coTypes を渡す。
  // 主タイプ（result）は determineResult の決定的勝者、coTypes は同点を分け合う副タイプ。
  const wordSenseResult: QuizResult = {
    id: "elegant-precise",
    title: "一字千金（いちじせんきん）タイプ",
    description: "あなたは一字千金タイプです。",
  };
  const wordSenseProps = {
    result: wordSenseResult,
    quizType: "personality" as const,
    quizTitle: "言葉の感覚診断",
    quizSlug: "word-sense-personality",
    onRetry: vi.fn(),
  };

  test("coTypes が未指定のときは開示ブロックを描画しない（単独勝者）", () => {
    const { container } = render(<ResultCard {...wordSenseProps} />);
    expect(
      screen.queryByLabelText("同じくらい強く出た型"),
    ).not.toBeInTheDocument();
    expect(container.querySelector("[class*='tiedDisclosure']")).toBeNull();
  });

  test("coTypes が空配列のときも開示ブロックを描画しない", () => {
    const { container } = render(
      <ResultCard {...wordSenseProps} coTypes={[]} />,
    );
    expect(
      screen.queryByLabelText("同じくらい強く出た型"),
    ).not.toBeInTheDocument();
    expect(container.querySelector("[class*='tiedDisclosure']")).toBeNull();
  });

  test("2 型同点（coTypes 1 件）: 主タイプと副タイプを同格に列挙し、副タイプの結果解説へリンクする", () => {
    const coTypes: QuizResult[] = [
      {
        id: "poetic-sensory",
        title: "花鳥風月（かちょうふうげつ）タイプ",
        description: "花鳥風月タイプの説明。",
      },
    ];
    render(<ResultCard {...wordSenseProps} coTypes={coTypes} />);

    // 開示ブロックの region が存在する
    const region = screen.getByLabelText("同じくらい強く出た型");
    expect(region).toBeInTheDocument();

    // 同格コピー: 主・副の両型名を含み「同じくらい強く出ています」と述べる（X>Y を暗示しない）
    expect(region.textContent).toContain("一字千金（いちじせんきん）タイプ");
    expect(region.textContent).toContain("花鳥風月（かちょうふうげつ）タイプ");
    expect(region.textContent).toContain("同じくらい強く出ています");
    // 「主に」という優劣を暗示する語を使わない
    expect(region.textContent).not.toContain("主に");

    // 副タイプの第三者向け結果解説ページへのリンク
    const link = screen
      .getByText("花鳥風月（かちょうふうげつ）タイプの解説を見る")
      .closest("a");
    expect(link).toHaveAttribute(
      "href",
      "/play/word-sense-personality/result/poetic-sensory",
    );
  });

  test("3 型同点（coTypes 2 件）: 3 型すべてを列挙し、2 つの副タイプへリンクする", () => {
    const coTypes: QuizResult[] = [
      {
        id: "poetic-sensory",
        title: "花鳥風月（かちょうふうげつ）タイプ",
        description: "花鳥風月タイプの説明。",
      },
      {
        id: "logical-clear",
        title: "理路整然（りろせいぜん）タイプ",
        description: "理路整然タイプの説明。",
      },
    ];
    render(<ResultCard {...wordSenseProps} coTypes={coTypes} />);

    const region = screen.getByLabelText("同じくらい強く出た型");
    expect(region.textContent).toContain("一字千金（いちじせんきん）タイプ");
    expect(region.textContent).toContain("花鳥風月（かちょうふうげつ）タイプ");
    expect(region.textContent).toContain("理路整然（りろせいぜん）タイプ");

    // 2 つの副タイプそれぞれに結果解説ページリンクがある
    expect(
      screen
        .getByText("花鳥風月（かちょうふうげつ）タイプの解説を見る")
        .closest("a"),
    ).toHaveAttribute(
      "href",
      "/play/word-sense-personality/result/poetic-sensory",
    );
    expect(
      screen
        .getByText("理路整然（りろせいぜん）タイプの解説を見る")
        .closest("a"),
    ).toHaveAttribute(
      "href",
      "/play/word-sense-personality/result/logical-clear",
    );
  });
});
