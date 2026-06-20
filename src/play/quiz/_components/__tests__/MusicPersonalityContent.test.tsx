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

// cycle-254 で新デザインへ移行: 旧版にあった絵文字マーカー（🎵/🎧/🎤/🎶/🎹）と
// 紫/クリームの色ティント差別化は撤去された。テスト側も絵文字なしの見出し文言と、
// 新クラス名（allTypesGrid / itemList）に追従させる。
describe("MusicPersonalityContent - 基本レンダリング", () => {
  it("strengthsセクションが表示されること（絵文字なし見出し）", () => {
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={2}
        allTypesLayout="pill"
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
        headingLevel={2}
        allTypesLayout="pill"
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
        headingLevel={2}
        allTypesLayout="pill"
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
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("今日の音楽ライフのヒント")).toBeInTheDocument();
    expect(
      screen.getByText("今日の音楽ライフのヒントテキスト"),
    ).toBeInTheDocument();
  });

  it("全タイプ一覧が表示されること（絵文字なし見出し）", () => {
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    expect(screen.getByText("他のタイプも見てみよう")).toBeInTheDocument();
    expect(screen.getByText("フェス一番乗り族")).toBeInTheDocument();
    expect(screen.getByText("プレイリスト伝道師")).toBeInTheDocument();
  });
});

describe("MusicPersonalityContent - headingLevel prop", () => {
  it("headingLevel=2 の場合、セクション見出しがh2タグでレンダリングされること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const h2s = container.querySelectorAll("h2");
    // 強み・弱み・行動・アクション・全タイプのh2が存在する
    expect(h2s.length).toBeGreaterThanOrEqual(5);
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBe(0);
  });

  it("headingLevel=3 の場合、セクション見出しがh3タグでレンダリングされること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={3}
        allTypesLayout="list"
      />,
    );
    const h3s = container.querySelectorAll("h3");
    expect(h3s.length).toBeGreaterThanOrEqual(5);
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBe(0);
  });
});

// 新デザインでは旧 "pill"（横wrap・999px 角丸）を廃止し、内部で allTypesGrid に
// マップしている。public props 型 "list" | "pill" は caller 互換のため維持する。
// テストでは「"pill" で grid 系クラスが付く」「"list" で別系クラスが付く」「両者は別物」を担保する。
describe("MusicPersonalityContent - allTypesLayout prop", () => {
  it("allTypesLayout='pill' の場合、グリッド型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const gridList = container.querySelector("[class*='allTypesGrid']");
    expect(gridList).not.toBeNull();
    // 縦並びリストクラスは "pill" のときは存在しない
    const listEl = container.querySelector("[class*='allTypesListVertical']");
    expect(listEl).toBeNull();
  });

  it("allTypesLayout='list' の場合、リスト型レイアウトクラスが適用されること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={3}
        allTypesLayout="list"
      />,
    );
    const listEl = container.querySelector("[class*='allTypesListVertical']");
    expect(listEl).not.toBeNull();
    // グリッドクラスは "list" のときは存在しない
    const gridList = container.querySelector("[class*='allTypesGrid']");
    expect(gridList).toBeNull();
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
        headingLevel={2}
        allTypesLayout="pill"
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
          headingLevel={2}
          allTypesLayout="pill"
        />,
      );
    }).not.toThrow();
  });
});

describe("MusicPersonalityContent - 現在のタイプのハイライト", () => {
  it("resultIdと一致するタイプにカレントスタイルが適用されること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const currentItems = container.querySelectorAll(
      "[class*='allTypesItemCurrent']",
    );
    expect(currentItems.length).toBe(1);
  });
});

describe("MusicPersonalityContent - wrapper クラス", () => {
  it("wrapperクラスを持つ最外層要素が存在すること", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const wrapper = container.querySelector("[class*='wrapper']");
    expect(wrapper).not.toBeNull();
  });
});

// 新デザインでは独自トークン --music-accent-color / --music-accent-bg を全廃し、
// インラインスタイルでの色注入も行わない。CSS は共通 --accent 系のみを参照する。
describe("MusicPersonalityContent - インラインスタイル不使用", () => {
  it("sectionHeadingにインラインスタイルが設定されていないこと", () => {
    const { container } = render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={2}
        allTypesLayout="pill"
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
        headingLevel={2}
        allTypesLayout="pill"
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
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    const links = container.querySelectorAll(
      "a[href*='/play/music-personality/result/']",
    );
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it("全タイプ一覧の絵文字アイコン（r.icon）が描画されないこと", () => {
    // 新デザインでは r.icon の描画を撤去。各タイプの区別はタイトル文言で行う。
    render(
      <MusicPersonalityContent
        content={sampleContent}
        resultId="festival-pioneer"
        headingLevel={2}
        allTypesLayout="pill"
      />,
    );
    // モックデータの icon: "🎪" / "📢" がリスト中に出ないこと
    expect(screen.queryByText("🎪")).toBeNull();
    expect(screen.queryByText("📢")).toBeNull();
  });
});
