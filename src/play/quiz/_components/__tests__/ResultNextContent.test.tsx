import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultNextContent from "../ResultNextContent";
import type { ResultNextContentItem } from "../ResultNextContent";

// テスト用コンテンツデータ（事前計算済みの ResultNextContentItem 形式）
const mockItems: ResultNextContentItem[] = [
  {
    slug: "animal-personality",
    title: "動物性格診断",
    shortTitle: "動物診断",
    icon: "🐻",
    category: "personality",
    contentPath: "/play/animal-personality",
    metaText: "全12問",
    categoryLabel: "診断",
  },
  {
    slug: "kanji-level",
    title: "漢字レベル診断",
    icon: "📝",
    category: "knowledge",
    contentPath: "/play/kanji-level",
    metaText: "全10問",
    categoryLabel: "知識テスト",
  },
  {
    slug: "kanji-kanaru",
    title: "漢字カナール",
    icon: "🀄",
    category: "game",
    contentPath: "/play/kanji-kanaru",
    metaText: "毎日更新",
    categoryLabel: "パズル",
  },
];

describe("ResultNextContent — 基本レンダリング", () => {
  test("2件のコンテンツで正しくレンダリングされること（section, h3, リンク）", () => {
    render(<ResultNextContent contents={mockItems.slice(0, 2)} />);

    // section 要素が存在する
    const section = screen.getByRole("region", { name: "次のおすすめ" });
    expect(section).toBeInTheDocument();

    // h3 が表示される
    expect(screen.getByText("次はこれを試してみよう")).toBeInTheDocument();

    // リンクが2件表示される
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });

  test("3件のコンテンツで正しくレンダリングされること", () => {
    render(<ResultNextContent contents={mockItems} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  test("空配列の場合にnullが返ること", () => {
    const { container } = render(<ResultNextContent contents={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("ResultNextContent — カード内容", () => {
  test("各カードにアイコンが表示されること", () => {
    render(<ResultNextContent contents={mockItems} />);

    expect(screen.getByText("🐻")).toBeInTheDocument();
    expect(screen.getByText("📝")).toBeInTheDocument();
    expect(screen.getByText("🀄")).toBeInTheDocument();
  });

  test("shortTitleがある場合はshortTitleが表示されること", () => {
    render(<ResultNextContent contents={mockItems} />);

    // animal-personality は shortTitle: "動物診断" があるのでそちらが表示される
    expect(screen.getByText("動物診断")).toBeInTheDocument();
    expect(screen.queryByText("動物性格診断")).not.toBeInTheDocument();
  });

  test("shortTitleがない場合はtitleが表示されること", () => {
    render(<ResultNextContent contents={mockItems} />);

    // kanji-level は shortTitle なし
    expect(screen.getByText("漢字レベル診断")).toBeInTheDocument();
  });

  test("metaTextが正しく表示されること", () => {
    render(<ResultNextContent contents={mockItems} />);

    // 事前計算されたmetaTextをそのまま表示する
    expect(screen.getByText("全12問")).toBeInTheDocument();
    expect(screen.getByText("全10問")).toBeInTheDocument();
    expect(screen.getByText("毎日更新")).toBeInTheDocument();
  });

  test("カテゴリバッジが表示されること", () => {
    render(<ResultNextContent contents={mockItems} />);

    // 事前計算されたcategoryLabelをそのまま表示する
    expect(screen.getByText("診断")).toBeInTheDocument();
    expect(screen.getByText("知識テスト")).toBeInTheDocument();
    expect(screen.getByText("パズル")).toBeInTheDocument();
  });

  test("data-category属性がカテゴリバッジに設定されていること", () => {
    render(<ResultNextContent contents={mockItems} />);

    // バッジ要素に data-category 属性が設定される
    const diagnosisBadge = screen.getByText("診断");
    expect(diagnosisBadge).toHaveAttribute("data-category", "personality");

    const knowledgeBadge = screen.getByText("知識テスト");
    expect(knowledgeBadge).toHaveAttribute("data-category", "knowledge");

    const gameBadge = screen.getByText("パズル");
    expect(gameBadge).toHaveAttribute("data-category", "game");
  });
});

describe("ResultNextContent — リンクとアクセシビリティ", () => {
  test("リンク先がcontentPathと一致すること", () => {
    render(<ResultNextContent contents={mockItems.slice(0, 2)} />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/play/animal-personality");
    expect(links[1]).toHaveAttribute("href", "/play/kanji-level");
  });

  test("aria-labelが設定されていること", () => {
    render(<ResultNextContent contents={mockItems} />);

    const section = screen.getByRole("region", { name: "次のおすすめ" });
    expect(section).toHaveAttribute("aria-label", "次のおすすめ");
  });

  test("アイコン絵文字にaria-hidden=trueが設定されていること", () => {
    render(<ResultNextContent contents={mockItems} />);

    const bearIcon = screen.getByText("🐻");
    expect(bearIcon).toHaveAttribute("aria-hidden", "true");
  });
});

describe("ResultNextContent — fortuneコンテンツ", () => {
  test("fortune（占い）コンテンツが正しく表示されること", () => {
    const fortuneItem: ResultNextContentItem = {
      slug: "daily",
      title: "今日のユーモア運勢",
      icon: "🔮",
      category: "fortune",
      contentPath: "/play/daily",
      metaText: "毎日更新",
      categoryLabel: "運勢",
    };

    render(<ResultNextContent contents={[fortuneItem]} />);

    expect(screen.getByText("今日のユーモア運勢")).toBeInTheDocument();
    expect(screen.getByText("毎日更新")).toBeInTheDocument();
    const badge = screen.getByText("運勢");
    expect(badge).toHaveAttribute("data-category", "fortune");
  });
});
