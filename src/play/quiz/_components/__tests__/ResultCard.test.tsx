import { expect, test, vi, describe } from "vitest";
import { render, screen, within } from "@testing-library/react";
import React, { type ComponentProps } from "react";
import ResultCardComponent from "../ResultCard";
import { followsPhraseRules } from "@/lib/phrase-breaks";
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

// next/dynamic は、loader の文字列表現から読み込む部品を見分け、同期的に描く部品を返す。
// AnimalPersonalityContent・TraditionalColorContent は実物を、MusicPersonalityContent は下の vi.mock のモックを、
// ファクトリの中で先に読み込んで返す。YojiPersonalityContent・UnexpectedCompatibilityContent・
// ImpossibleAdviceContent・ContrarianFortuneContent は data-testid を持つスタブを返し、そのほかの部品
// （CharacterPersonalityContent など）は何も描かない部品を返す。
vi.mock("next/dynamic", async () => {
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
        // persona / thirdPartyNote を表示して実装通りの動作を検証できるようにする
        cachedComp = (props: Record<string, unknown>) => {
          const dc = props.detailedContent as Record<string, unknown>;
          return React.createElement(
            "div",
            { "data-testid": "contrarian-fortune-content" },
            React.createElement("div", null, String(dc?.persona ?? "")),
            React.createElement("div", null, String(dc?.thirdPartyNote ?? "")),
          );
        };
      } else {
        // そのほかの部品は何も描かない
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
  default: ({ text, notice }: { text: string; notice?: string[] }) => (
    <div data-testid="share-buttons" data-notice={JSON.stringify(notice)}>
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
      },
      {
        id: "kurenai",
        title: "紅色",
        color: "#c0392b",
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
      questionCount: 10,
    },
    results: [
      {
        id: "nihon-zaru",
        title: "ニホンザル",
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
      questionCount: 7,
    },
    results: [
      {
        id: "timemagician",
        title: "時間魔術師見習い",
        description: "説明1",
      },
      {
        id: "gravityfighter",
        title: "重力と戦う者",
        description: "説明2",
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
      questionCount: 8,
    },
    results: [
      {
        id: "vendingmachine",
        title: "自動販売機",
        description: "説明1",
      },
      {
        id: "oldclock",
        title: "古い掛け時計",
        description: "説明2",
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

/**
 * 見出しの区切りはサーバーで作って渡すものなので、テストでは結果の名前を1つの区切りとして渡し、読みものの
 * 小見出しの区切りは渡さない（受け取っていない小見出しは1つの文節として組まれる）。診断の名前を渡さないテストは、
 * 題をそのまま名前にする。診断の全タイプを渡さないテストは、結果のタイプだけを持つ診断にする。
 */
function ResultCard(
  props: Omit<
    ComponentProps<typeof ResultCardComponent>,
    "heading" | "readingHeadings" | "tableCells" | "quizName" | "allResults"
  > & { quizName?: string; allResults?: QuizResult[] },
) {
  return (
    <ResultCardComponent
      heading={{
        phrases: [props.result.nameParts?.name ?? props.result.title],
      }}
      readingHeadings={{}}
      tableCells={{}}
      {...props}
      quizName={props.quizName ?? props.quizTitle}
      allResults={props.allResults ?? [props.result]}
    />
  );
}

const baseResult: QuizResult = {
  id: "type-a",
  title: "テスト結果",
  description: "テスト用の結果説明です。",
};

/**
 * 色をインラインスタイルで持つ要素。色見本（主題が色の項目）を除く。
 * タイプやクイズの色は装飾に使わないので、色が結果そのもの（伝統色診断）の色見本のほかに色を入れる要素は無い（DESIGN.md §2）。
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

describe("ResultCard - 結果のボックス", () => {
  const typeResult: QuizResult = {
    id: "type-a",
    title: "炎の詩人",
    description: "炎の詩人の説明です。",
  };

  test("結果は、タイプ名の見出しを名前に持つ region で、補助情報が何の結果かを言う", () => {
    render(<ResultCard {...defaultProps} result={typeResult} />);
    const box = screen.getByRole("region", { name: "炎の詩人" });
    expect(box.tagName).toBe("SECTION");
    expect(
      screen.getByRole("heading", { level: 2, name: "炎の詩人" }),
    ).toBeInTheDocument();
    expect(box).toHaveTextContent("テストクイズの結果");
    expect(box).toHaveTextContent("炎の詩人の説明です。");
  });

  test("補助情報と共有の文は診断の短い名前で言い、ハッシュタグは題から作る", () => {
    render(
      <ResultCard
        {...defaultProps}
        quizTitle="あなたを日本の伝統色に例えると？"
        quizName="日本の伝統色診断"
        result={typeResult}
      />,
    );
    expect(screen.getByRole("region", { name: "炎の詩人" })).toHaveTextContent(
      "日本の伝統色診断の結果",
    );
    expect(screen.getByTestId("share-buttons")).toHaveTextContent(
      /^日本の伝統色診断の結果は「炎の詩人」でした！　#あなたを日本の伝統色に例えると？ #yolosnet$/,
      { normalizeWhitespace: false },
    );
  });

  test("タイプ名はサーバーで作った区切りのあいだに <wbr> を置いて組み、読み上げの名前はタイトルと同じ", () => {
    render(
      <ResultCardComponent
        {...defaultProps}
        result={{ ...typeResult, title: "締切3分前に本気出す炎の司令塔" }}
        quizName={defaultProps.quizTitle}
        heading={{ phrases: ["締切3分前に", "本気出す", "炎の司令塔"] }}
        readingHeadings={{}}
        tableCells={{}}
        allResults={[]}
      />,
    );
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "締切3分前に本気出す炎の司令塔",
    });
    expect(heading.querySelectorAll("wbr")).toHaveLength(2);
    expect(heading).toHaveAccessibleName("締切3分前に本気出す炎の司令塔");
  });

  test("包み・印・記号面・「診断完了」を持たない", () => {
    const { container } = render(
      <ResultCard {...defaultProps} result={typeResult} />,
    );
    expect(container.querySelector("figure")).toBeNull();
    expect(screen.queryByText("診断完了")).not.toBeInTheDocument();
    expect(inlineColoredElements(container)).toEqual([]);
  });

  test("読み方を持つタイプは、見出しを名前だけにし、読み方を名前のすぐ下に添える", () => {
    render(
      <ResultCard
        {...defaultProps}
        result={{
          ...typeResult,
          title: "花鳥風月タイプ",
          reading: { word: "花鳥風月", kana: "かちょうふうげつ" },
        }}
      />,
    );
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "花鳥風月タイプ",
    });
    const reading = screen.getByText("かちょうふうげつ");
    expect(
      heading.compareDocumentPosition(reading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      reading.compareDocumentPosition(
        screen.getByText("炎の詩人の説明です。"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("名前と読みを持つタイプ（伝統色）は、見出しを名前だけにし、読みを名前のすぐ下に添える", () => {
    render(
      <ResultCard
        {...defaultProps}
        result={{
          ...typeResult,
          title: "藍色(あいいろ)",
          nameParts: { name: "藍色", reading: "あいいろ" },
        }}
      />,
    );
    expect(screen.getByRole("region", { name: "藍色" })).toHaveTextContent(
      "あいいろ",
    );
    expect(screen.getByText("あいいろ").tagName).toBe("P");
  });

  test("appear を渡したときだけ、ボックスが登場の動きを持つ", () => {
    const { rerender } = render(
      <ResultCard {...defaultProps} result={typeResult} />,
    );
    const box = screen.getByRole("region", { name: "炎の詩人" });
    expect(box.className).not.toMatch(/appears/);
    rerender(<ResultCard {...defaultProps} result={typeResult} appear />);
    expect(box.className).toMatch(/appears/);
  });

  test("結果のボックスへの参照を渡すと、ボックスがフォーカスを受けられる", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <ResultCard {...defaultProps} result={typeResult} resultBoxRef={ref} />,
    );
    expect(ref.current).toBe(screen.getByRole("region", { name: "炎の詩人" }));
    expect(ref.current).toHaveAttribute("tabindex", "-1");
  });

  test("知識クイズは、段位の名前の見出しと、単位を書いた正解の数を出す", () => {
    render(
      <ResultCard
        {...defaultProps}
        quizType="knowledge"
        quizTitle="漢字力診断"
        result={{ ...typeResult, title: "漢字マスター" }}
        score={8}
        totalQuestions={10}
      />,
    );
    const box = screen.getByRole("region", { name: "漢字マスター" });
    expect(box).toHaveTextContent("漢字力診断の結果");
    expect(screen.getByText("10問中8問正解")).toBeInTheDocument();
  });
});

describe("ResultCard - 結果を共有する区画", () => {
  const characterContent = {
    variant: "character-personality",
    catchphrase: "キャッチコピー",
  } as unknown as ComponentProps<typeof ResultCard>["detailedContent"];

  test("ボックスのすぐ後ろに「この結果を共有」の区画が1つだけあり、共有のボタンを持つ", () => {
    render(<ResultCard {...defaultProps} />);
    const box = screen.getByRole("region", { name: "テスト結果" });
    const share = screen.getByRole("region", { name: "この結果を共有" });
    expect(box.nextElementSibling).toBe(share);
    expect(share).toContainElement(screen.getByTestId("share-buttons"));
    expect(screen.getAllByTestId("share-buttons")).toHaveLength(1);
  });

  test("「この結果を共有」は文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
    render(<ResultCard {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "この結果を共有" }).innerHTML,
    ).toBe("この<wbr>結果を<wbr>共有");
  });

  test("札の画像の知らせも、区画の知らせの行1つに出す", () => {
    render(
      <ResultCard
        {...defaultProps}
        quizSlug="character-personality"
        detailedContent={characterContent}
      />,
    );
    const share = screen.getByRole("region", { name: "この結果を共有" });
    expect(share.querySelectorAll("[role=status]")).toHaveLength(0);
    expect(screen.getByTestId("share-buttons")).toHaveAttribute(
      "data-notice",
      "[]",
    );
  });

  test("character-personality では、札の画像の保存と共有も同じ区画に置く", () => {
    render(
      <ResultCard
        {...defaultProps}
        quizSlug="character-personality"
        detailedContent={characterContent}
      />,
    );
    const share = screen.getByRole("region", { name: "この結果を共有" });
    expect(
      screen.getByRole("button", { name: "画像を保存" }),
    ).toBeInTheDocument();
    expect(share).toContainElement(
      screen.getByRole("button", { name: "画像を保存" }),
    );
  });

  test("ほかの診断では、札の画像のボタンを置かない", () => {
    render(<ResultCard {...defaultProps} />);
    expect(
      screen.queryByRole("button", { name: "画像を保存" }),
    ).not.toBeInTheDocument();
  });
});

describe("ResultCard - detailedContent未設定", () => {
  test("detailedContentがundefinedの場合、詳しい読みものの小見出しを持たないこと（小見出しは「この結果を共有」だけ）", () => {
    render(<ResultCard {...defaultProps} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
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
  };
  const allTypes: QuizResult[] = [
    {
      id: "type-a",
      title: "タイプA",
      description: "タイプAの説明",
    },
    {
      id: "type-b",
      title: "タイプB",
      description: "タイプBの説明",
    },
    {
      id: "type-c",
      title: "タイプC",
      description: "タイプCの説明",
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
      screen.getByRole("heading", { level: 2, name: "すべてのタイプ（3）" }),
    ).toBeInTheDocument();
  });

  test("読みものはセクション「このタイプについて」（h2）にまとめ、その中の小見出しは h3。すべてのタイプはそのあとに置く", () => {
    render(
      <ResultCard
        {...defaultProps}
        result={currentResult}
        detailedContent={standardContent}
        allResults={allTypes}
      />,
    );
    const section = screen.getByRole("region", { name: "このタイプについて" });
    expect(
      within(section).getByRole("heading", {
        level: 2,
        name: "このタイプについて",
      }),
    ).toBeInTheDocument();
    expect(
      within(section)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual([
      "このタイプの特徴",
      "このタイプのあるある",
      "このタイプの人へのアドバイス",
    ]);
    const allTypesHeading = screen.getByRole("heading", {
      name: "すべてのタイプ（3）",
    });
    expect(section).not.toContainElement(allTypesHeading);
    expect(
      section.compareDocumentPosition(allTypesHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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

  test("ContrarianFortuneContent に persona / thirdPartyNote が渡されること", () => {
    render(
      <ResultCard
        {...defaultProps}
        detailedContent={contrarianContent}
        allResults={[]}
      />,
    );
    // スタブコンポーネントがこれらのフィールドを表示する
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

describe("ResultCard - セクションの並び", () => {
  const content: QuizResultDetailedContent = {
    traits: ["特徴1"],
    behaviors: ["あるある1"],
    advice: "アドバイス",
  };
  const allTypes: QuizResult[] = [
    { id: "test-result", title: "テスト結果", description: "説明" },
    { id: "type-b", title: "タイプB", description: "タイプBの説明" },
  ];

  /** ページの直下のセクション（全幅の罫線で分かれる単位）を上から並べる。 */
  function pageSections(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(":scope > section"));
  }

  test("ページの頭と結果と共有・このタイプについて・次はこれを試してみよう・すべてのタイプを、この順の兄弟のセクションにする", () => {
    const { container } = render(
      <ResultCard
        {...defaultProps}
        head={<h1>診断の名前</h1>}
        detailedContent={content}
        allResults={allTypes}
        nextItems={[{ name: "次の遊び", href: "/play/next" }]}
      />,
    );
    const sections = pageSections(container);
    expect(sections).toHaveLength(4);
    const [first, about, next, all] = sections;

    const firstOrder = [
      within(first).getByRole("heading", { level: 1, name: "診断の名前" }),
      within(first).getByRole("region", { name: "テスト結果" }),
      within(first).getByRole("heading", { name: "この結果を共有" }),
      within(first).getByTestId("share-buttons"),
    ];
    for (let i = 1; i < firstOrder.length; i++) {
      expect(
        firstOrder[i - 1].compareDocumentPosition(firstOrder[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(
      within(about).getByRole("heading", {
        level: 2,
        name: "このタイプについて",
      }),
    ).toBeInTheDocument();
    expect(within(about).getByText("あるある1")).toBeInTheDocument();
    expect(
      within(next).getByRole("heading", {
        level: 2,
        name: "次はこれを試してみよう",
      }),
    ).toBeInTheDocument();
    expect(
      within(next).getByRole("button", { name: "もう一度挑戦する" }),
    ).toBeInTheDocument();
    expect(
      within(next).getByRole("link", { name: "次の遊び" }),
    ).toBeInTheDocument();
    expect(
      within(all).getByRole("heading", {
        level: 2,
        name: "すべてのタイプ（2）",
      }),
    ).toBeInTheDocument();
  });

  test("「もう一度挑戦する」は「次はこれを試してみよう」の見出しのすぐ下、次の遊びの一覧の上に置く", () => {
    render(
      <ResultCard
        {...defaultProps}
        nextItems={[{ name: "次の遊び", href: "/play/next" }]}
      />,
    );
    const order = [
      screen.getByRole("heading", { name: "次はこれを試してみよう" }),
      screen.getByRole("button", { name: "もう一度挑戦する" }),
      screen.getByRole("list", { name: "次はこれを試してみよう" }),
    ];
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  test("「もう一度挑戦する」は書き手が分けた文節の切れ目でだけ折れ、読み上げの名前は元の文のまま（DESIGN.md §4）", () => {
    render(<ResultCard {...defaultProps} />);
    const face = screen.getByRole("button", {
      name: "もう一度挑戦する",
    }).firstElementChild!;
    const phrases = face.innerHTML.split("<wbr>");
    expect(phrases).toEqual(["もう一度", "挑戦する"]);
    expect(followsPhraseRules(phrases)).toBe(true);
  });

  test("詳しい読みものを持たないクイズは、結果と共有・次はこれを試してみようの2つのセクションで、結果ごとのおすすめは「もう一度挑戦する」の下に置く", () => {
    const { container } = render(
      <ResultCard
        {...defaultProps}
        result={{
          ...defaultProps.result,
          recommendation: "漢字辞典で漢字の世界を探検しよう",
          recommendationLink: "/dictionary/kanji",
        }}
      />,
    );
    const sections = pageSections(container);
    expect(sections).toHaveLength(2);
    const retry = within(sections[1]).getByRole("button", {
      name: "もう一度挑戦する",
    });
    const recommendation = within(sections[1]).getByRole("link", {
      name: "漢字辞典で漢字の世界を探検しよう",
    });
    expect(
      retry.compareDocumentPosition(recommendation) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "このタイプについて" }),
    ).not.toBeInTheDocument();
  });

  test("その結果の辞典の項目へのリンクは、「このタイプについて」の読みもののすぐ後ろに置き、「次はこれを試してみよう」には置かない", () => {
    const { container } = render(
      <ResultCard
        {...defaultProps}
        result={{
          ...defaultProps.result,
          recommendation: "藍色の詳しい解説を見る",
          recommendationLink: "/dictionary/colors/ai",
        }}
        detailedContent={content}
        allResults={allTypes}
        extra={<p>相性と招待</p>}
      />,
    );
    const [, about, next] = pageSections(container);
    const link = within(about).getByRole("link", {
      name: "藍色の詳しい解説を見る",
    });
    expect(link).toHaveAttribute("href", "/dictionary/colors/ai");
    const order = [
      within(about).getByText("アドバイス"),
      link,
      within(about).getByText("相性と招待"),
    ];
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(within(next).queryByRole("link", { name: /藍色/ })).toBeNull();
  });

  test("追加の読みものは「このタイプについて」の最後、詳しい読みもののあとに置く", () => {
    const { container } = render(
      <ResultCard
        {...defaultProps}
        detailedContent={content}
        allResults={allTypes}
        extra={<p>追加の読みもの</p>}
      />,
    );
    const about = pageSections(container)[1];
    const extra = within(about).getByText("追加の読みもの");
    expect(about.lastElementChild?.lastElementChild).toBe(extra);
    expect(
      within(about).getByText("アドバイス").compareDocumentPosition(extra) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("詳しい読みものを持たない診断でも、追加の読みものがあれば「このタイプについて」のセクションに置き、すべてのタイプは置かない", () => {
    const { container } = render(
      <ResultCard
        {...defaultProps}
        allResults={allTypes}
        extra={<p>相性と招待</p>}
      />,
    );
    const sections = pageSections(container);
    expect(sections).toHaveLength(3);
    expect(
      within(sections[1]).getByRole("heading", { name: "このタイプについて" }),
    ).toBeInTheDocument();
    expect(within(sections[1]).getByText("相性と招待")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /すべてのタイプ/ }),
    ).not.toBeInTheDocument();
  });

  test("読みものの小見出しは、受け取った文節の区切りのあいだに <wbr> を置いた h3 で組む", () => {
    const content: QuizResultDetailedContent = {
      traits: ["特徴1"],
      behaviors: ["あるある1"],
      advice: "アドバイス",
    };
    render(
      <ResultCardComponent
        {...defaultProps}
        quizName={defaultProps.quizTitle}
        heading={{ phrases: ["テスト結果"] }}
        readingHeadings={{
          このタイプのあるある: ["この", "タイプの", "あるある"],
        }}
        tableCells={{}}
        detailedContent={content}
        allResults={[]}
      />,
    );
    const heading = screen.getByRole("heading", {
      level: 3,
      name: "このタイプのあるある",
    });
    expect(heading.querySelectorAll("wbr")).toHaveLength(2);
  });

  test("詳しい読みものは、あるあるを箇条書き、アドバイスを段落で組み、地や枠のカードを持たない", () => {
    const content: QuizResultDetailedContent = {
      traits: ["特徴1"],
      behaviors: ["あるある1", "あるある2"],
      advice: "アドバイス",
    };
    render(<ResultCard {...defaultProps} detailedContent={content} />);
    expect(screen.getByText("あるある1").tagName).toBe("LI");
    expect(screen.getByText("アドバイス").tagName).toBe("P");
    for (const element of [
      screen.getByText("あるある1"),
      screen.getByText("アドバイス"),
    ]) {
      expect(element.className).not.toMatch(/card|item/i);
    }
  });
});

describe("ResultCard - humorMetrics省略時", () => {
  test("humorMetricsがundefinedの場合、テーブルが表示されないこと", () => {
    const contrarianContentNoMetrics: ContrarianFortuneDetailedContent = {
      variant: "contrarian-fortune",
      catchphrase: "キャッチフレーズ",
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
    title: "ニホンザル——温泉を発明した革命児",
    description: "あなたはニホンザルタイプです。",
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
    render(
      <ResultCard
        {...animalProps}
        allResults={[
          { id: "nihon-zaru", title: "ニホンザル", description: "" },
          { id: "hondo-tanuki", title: "ホンドタヌキ", description: "" },
        ]}
      />,
    );
    expect(
      screen.getByRole("link", { name: "ニホンザル" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "ホンドタヌキ" }),
    ).toBeInTheDocument();
  });

  test("タイプやクイズの色を、どの要素にもインラインスタイルで入れないこと", () => {
    const { container } = render(<ResultCard {...animalProps} />);
    expect(inlineColoredElements(container)).toEqual([]);
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
  };

  test("animal-personality: キャッチコピーがインラインスタイルを持たないこと", () => {
    render(
      <ResultCard
        result={animalResult}
        quizType="personality"
        quizTitle="動物診断"
        quizSlug="animal-personality"
        onRetry={vi.fn()}
        detailedContent={animalContent}
      />,
    );
    expect(
      screen.getByText("動物キャッチコピー").getAttribute("style"),
    ).toBeNull();
  });

  test("music-personality: キャッチコピーがインラインスタイルを持たないこと", () => {
    render(
      <ResultCard
        result={musicResult}
        quizType="personality"
        quizTitle="音楽性格診断"
        quizSlug="music-personality"
        onRetry={vi.fn()}
        detailedContent={musicContent}
      />,
    );
    expect(
      screen.getByText("音楽キャッチコピー").getAttribute("style"),
    ).toBeNull();
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

  test("結果の色を、結果のボックスの中の色見本で見せ、ほかの要素には色を入れないこと", () => {
    const { container } = render(<ResultCard {...traditionalColorProps} />);
    const box = screen.getByRole("region", {
      name: traditionalColorProps.result.title,
    });
    const swatches = Array.from(
      box.querySelectorAll<HTMLElement>("[style]"),
    ).filter((el) => el.style.backgroundColor !== "");
    expect(swatches).toHaveLength(1);
    expect(swatches[0]).toHaveStyle({
      backgroundColor: traditionalColorProps.result.color,
    });
    expect(swatches[0]).toBeEmptyDOMElement();
    expect(inlineColoredElements(container)).toEqual([]);
  });

  test("全タイプ一覧が表示され、伝統色はタイプの中身なので、どの行も色見本を持つこと", () => {
    render(
      <ResultCard
        {...traditionalColorProps}
        allResults={[
          { id: "ai-iro", title: "藍色", description: "", color: "#165e83" },
          { id: "kurenai", title: "紅色", description: "", color: "#d7003a" },
        ]}
      />,
    );
    const list = screen.getByRole("heading", { name: "すべてのタイプ（2）" })
      .parentElement as HTMLElement;
    expect(
      within(list).getByRole("link", { name: "藍色" }),
    ).toBeInTheDocument();
    expect(
      within(list).getByRole("link", { name: "紅色" }),
    ).toBeInTheDocument();
    expect(list.querySelectorAll("[style*='background']").length).toBe(2);
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

  test("タイプの色を、色見本にもどの要素のインラインスタイルにも入れないこと", () => {
    const { container } = render(<ResultCard {...yojiProps} />);
    expect(container.querySelector("[style]")).toBeNull();
    expect(inlineColoredElements(container)).toEqual([]);
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

  test("タイプの色を、色見本にもどの要素のインラインスタイルにも入れないこと", () => {
    const { container } = render(<ResultCard {...unexpectedProps} />);
    expect(container.querySelector("[style]")).toBeNull();
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

  test("タイプの色を、色見本にもどの要素のインラインスタイルにも入れないこと", () => {
    const { container } = render(<ResultCard {...impossibleProps} />);
    expect(container.querySelector("[style]")).toBeNull();
    expect(inlineColoredElements(container)).toEqual([]);
  });
});

describe("ResultCard - 真の残余同点の開示ブロック", () => {
  // word-sense-personality の同点時のみ QuizContainer が coTypes を渡す。
  // 主タイプ（result）は determineResult の決定的勝者、coTypes は同点を分け合う副タイプ。
  const wordSenseResult: QuizResult = {
    id: "elegant-precise",
    title: "一字千金タイプ",
    reading: { word: "一字千金", kana: "いちじせんきん" },
    description: "あなたは一字千金タイプです。",
  };
  const wordSenseProps = {
    result: wordSenseResult,
    quizType: "personality" as const,
    quizTitle: "言葉の感覚診断",
    quizSlug: "word-sense-personality",
    onRetry: vi.fn(),
  };

  test("共有の文は、読みにくい語の後ろに読みを添えたタイプ名で言う", () => {
    render(<ResultCard {...wordSenseProps} />);
    expect(screen.getByTestId("share-buttons")).toHaveTextContent(
      /^言葉の感覚診断の結果は「一字千金（いちじせんきん）タイプ」でした！　#言葉の感覚診断 #yolosnet$/,
      { normalizeWhitespace: false },
    );
  });

  test("読みを持たないタイプの共有の文は、title のまま", () => {
    render(
      <ResultCard
        {...wordSenseProps}
        result={{ ...wordSenseResult, reading: undefined }}
      />,
    );
    expect(screen.getByTestId("share-buttons")).toHaveTextContent(
      /^言葉の感覚診断の結果は「一字千金タイプ」でした！　#言葉の感覚診断 #yolosnet$/,
      { normalizeWhitespace: false },
    );
  });

  test("coTypes が未指定のときは同点を言わない（単独勝者）", () => {
    render(<ResultCard {...wordSenseProps} />);
    expect(
      screen.queryByText(/同じくらい強く出ています/),
    ).not.toBeInTheDocument();
  });

  test("coTypes が空配列のときも同点を言わない", () => {
    render(<ResultCard {...wordSenseProps} coTypes={[]} />);
    expect(
      screen.queryByText(/同じくらい強く出ています/),
    ).not.toBeInTheDocument();
  });

  test("2 型同点（coTypes 1 件）: 主タイプと副タイプを同格に列挙し、副タイプの結果解説へリンクする", () => {
    const coTypes: QuizResult[] = [
      {
        id: "poetic-sensory",
        title: "花鳥風月タイプ",
        reading: { word: "花鳥風月", kana: "かちょうふうげつ" },
        description: "花鳥風月タイプの説明。",
      },
    ];
    render(<ResultCard {...wordSenseProps} coTypes={coTypes} />);

    // 同点は、結果のボックスの中で言う
    const region = screen.getByText(/同じくらい強く出ています/);
    expect(
      screen.getByRole("region", { name: "一字千金タイプ" }),
    ).toContainElement(region);

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
        title: "花鳥風月タイプ",
        reading: { word: "花鳥風月", kana: "かちょうふうげつ" },
        description: "花鳥風月タイプの説明。",
      },
      {
        id: "logical-clear",
        title: "理路整然タイプ",
        reading: { word: "理路整然", kana: "りろせいぜん" },
        description: "理路整然タイプの説明。",
      },
    ];
    render(<ResultCard {...wordSenseProps} coTypes={coTypes} />);

    const region = screen.getByText(/同じくらい強く出ています/);
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
