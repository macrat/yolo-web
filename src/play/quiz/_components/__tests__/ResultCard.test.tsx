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
} from "../../types";

// next/dynamicをモック: テスト環境では vi.mock によりモジュールが同期的にキャッシュされるため、
// loaderが返すPromiseを同期的に評価できる。
// ただし Promise.then は常に非同期のため、別のアプローチを取る:
// vi.mock でモジュールがすでに登録されているため、
// loader() を呼んでその結果をトップレベルで await するのではなく、
// vi.mock ファクトリ内での特定のモジュールパスに対するマッピングを使う。
vi.mock("next/dynamic", async () => {
  // AnimalPersonalityContent と MusicPersonalityContent を事前にインポートして同期キャッシュ
  const animal =
    await import("@/play/quiz/_components/AnimalPersonalityContent");
  const music = await import("@/play/quiz/_components/MusicPersonalityContent");

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
vi.mock("@/play/quiz/_components/ShareButtons", () => ({
  default: ({ shareText }: { shareText: string }) => (
    <div data-testid="share-buttons">
      <span>{shareText}</span>
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
// referrerTypeIdを受け取り、相性セクション・招待ボタンを内部で生成する新しい設計に対応
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

  test("accentColorが指定された場合、セクション見出しにCSS変数が使われること（inline style非使用）", () => {
    const { container } = render(
      <ResultCard {...animalProps} accentColor="#15803d" />,
    );
    // detailedHeadingのcolorはCSS変数 var(--animal-accent-color) を使う
    // inline styleで直接 #15803d が設定されていないことを確認
    const headings = container.querySelectorAll("h3");
    headings.forEach((heading) => {
      // inline styleのcolorに直接カラーコードが設定されていないこと
      expect(heading.style.color).not.toBe("#15803d");
    });
  });

  test("accentColorが指定された場合、todayActionCardにCSS変数が使われること（inline style非使用）", () => {
    const { container } = render(
      <ResultCard {...animalProps} accentColor="#15803d" />,
    );
    // todayActionCardのbackgroundColorはCSS変数 var(--animal-accent-bg) を使う
    // inline styleで直接 #15803d の透過色が設定されていないことを確認
    const todayActionCards = container.querySelectorAll(
      "[class*='todayActionCard']",
    );
    todayActionCards.forEach((card) => {
      const el = card as HTMLElement;
      // inline styleのbackgroundColorに直接透過色が設定されていないこと
      expect(el.style.backgroundColor).not.toContain("#15803d");
    });
  });

  test("AnimalPersonalityContent の wrapper クラスが存在すること", () => {
    const { container } = render(
      <ResultCard {...animalProps} accentColor="#15803d" />,
    );
    // AnimalPersonalityContent コンポーネントのwrapperクラスを持つ要素が存在すること
    // CSS変数はCSSファイルで管理するためinline styleではなくクラスの存在を確認
    // 共通コンポーネント化により animalPersonalityWrapper → wrapper に変更
    const wrapper = container.querySelector("[class*='wrapper']");
    expect(wrapper).not.toBeNull();
  });

  test("catchphraseBeforeDescription に inline style が設定されないこと（CSS変数はCSSファイルのフォールバック値で制御）", () => {
    const { container } = render(
      <ResultCard {...animalProps} accentColor="#15803d" />,
    );
    // catchphraseBeforeDescriptionクラスを持つ要素が存在すること
    const catchphraseEl = container.querySelector(
      "[class*='catchphraseBeforeDescription']",
    );
    expect(catchphraseEl).not.toBeNull();
    if (catchphraseEl) {
      const el = catchphraseEl as HTMLElement;
      // inline style で CSS変数が渡されていないこと
      // ResultCard.module.css にフォールバック値（#15803d / #4ade80）が定義されているため
      // inline style は不要
      expect(el.style.getPropertyValue("--catchphrase-accent-color")).toBe("");
      expect(el.style.getPropertyValue("--catchphrase-accent-color-dark")).toBe(
        "",
      );
    }
  });
});

describe("ResultCard - catchphrase装飾線のCSS変数（variant別色出し分け）", () => {
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

  test("animal-personality: catchphraseBeforeDescription に --catchphrase-accent-color が設定されていないこと（CSSファイルのフォールバック値で緑色を使用）", () => {
    const { container } = render(
      <ResultCard
        result={animalResult}
        quizType="personality"
        quizTitle="動物診断"
        quizSlug="animal-personality"
        onRetry={vi.fn()}
        detailedContent={animalContent}
        accentColor="#15803d"
      />,
    );
    const catchphraseEl = container.querySelector(
      "[class*='catchphraseBeforeDescription']",
    );
    expect(catchphraseEl).not.toBeNull();
    if (catchphraseEl) {
      const el = catchphraseEl as HTMLElement;
      // animal-personalityではCSS変数は設定しない（CSSファイルの緑色フォールバックを使用）
      expect(el.style.getPropertyValue("--catchphrase-accent-color")).toBe("");
    }
  });

  test("music-personality: catchphraseBeforeDescription に --catchphrase-accent-color が紫色で設定されること", () => {
    const { container } = render(
      <ResultCard
        result={musicResult}
        quizType="personality"
        quizTitle="音楽性格診断"
        quizSlug="music-personality"
        onRetry={vi.fn()}
        detailedContent={musicContent}
        accentColor="#7c3aed"
      />,
    );
    const catchphraseEl = container.querySelector(
      "[class*='catchphraseBeforeDescription']",
    );
    expect(catchphraseEl).not.toBeNull();
    if (catchphraseEl) {
      const el = catchphraseEl as HTMLElement;
      // music-personalityでは紫色のCSS変数が設定されること
      expect(el.style.getPropertyValue("--catchphrase-accent-color")).toBe(
        "#7c3aed",
      );
    }
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
