import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MusicPersonalityContent from "../MusicPersonalityContent";
import type { MusicPersonalityDetailedContent } from "../../types";

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
        icon: "📢",
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
        placement="resultPage"
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
        placement="resultPage"
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
        placement="resultPage"
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
        placement="resultPage"
      />,
    );
    expect(screen.getByText("今日の音楽ライフのヒント")).toBeInTheDocument();
    expect(
      screen.getByText("今日の音楽ライフのヒントテキスト"),
    ).toBeInTheDocument();
  });

  it("他のタイプが表示され、見出しがタイプの数を言うこと", () => {
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        placement="resultPage"
      />,
    );
    expect(
      screen.getByRole("heading", { name: /^他のタイプ（\d+）$/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("フェス一番乗り族")).toBeInTheDocument();
    expect(screen.getByText("プレイリスト伝道師")).toBeInTheDocument();
  });
});

describe("MusicPersonalityContent - placement による見出しの階層", () => {
  it("結果のページ（placement=resultPage）では、セクション見出しがh2タグでレンダリングされること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        placement="resultPage"
      />,
    );
    const h2s = container.querySelectorAll("h2");
    // 強み・弱み・行動・アクション・全タイプのh2が存在する
    expect(h2s.length).toBeGreaterThanOrEqual(5);
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBe(0);
  });

  it("解き終えた画面（placement=solvedScreen）では、セクション見出しがh3タグでレンダリングされること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        placement="solvedScreen"
      />,
    );
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBeGreaterThanOrEqual(5);
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBe(0);
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
        placement="resultPage"
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
          placement="resultPage"
        />,
      );
    }).not.toThrow();
  });
});

describe("MusicPersonalityContent - wrapper クラス", () => {
  it("wrapperクラスを持つ最外層要素が存在すること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        placement="resultPage"
      />,
    );
    const wrapper = container.querySelector("[class*='wrapper']");
    expect(wrapper).not.toBeNull();
  });
});

// タイプごとの色をインラインスタイルで入れない（DESIGN.md §2）。
describe("MusicPersonalityContent - インラインスタイル不使用", () => {
  it("sectionHeadingにインラインスタイルが設定されていないこと", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        placement="resultPage"
      />,
    );
    const headings = container.querySelectorAll("[class*='sectionHeading']");
    headings.forEach((heading) => {
      expect((heading as HTMLElement).style.color).toBe("");
    });
  });

  it("todayActionCardにインラインスタイルが設定されていないこと", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        placement="resultPage"
      />,
    );
    const card = container.querySelector("[class*='todayActionCard']");
    expect(card).not.toBeNull();
    expect((card as HTMLElement).style.backgroundColor).toBe("");
  });
});

describe("MusicPersonalityContent - 全タイプリンク", () => {
  it("全タイプへのリンクが /play/music-personality/result/{id} 形式であること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        placement="resultPage"
      />,
    );
    const links = container.querySelectorAll(
      "a[href*='/play/music-personality/result/']",
    );
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it("他のタイプの絵文字アイコン（r.icon）が描画されないこと", () => {
    // 絵文字を置かない（DESIGN.md §5）。各タイプはタイトルの文言で見分ける。
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        placement="resultPage"
      />,
    );
    // モックデータの icon: "🎪" / "📢" がリスト中に出ないこと
    expect(screen.queryByText("🎪")).toBeNull();
    expect(screen.queryByText("📢")).toBeNull();
  });
});
