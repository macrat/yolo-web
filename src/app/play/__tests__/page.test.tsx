import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import PlayPage from "../page";

describe("PlayPage", () => {
  it("renders the page heading", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /遊ぶ/ }),
    ).toBeInTheDocument();
  });

  it("renders all 4 category section headings", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: "占い" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "性格診断" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "知識テスト" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "ゲーム" }),
    ).toBeInTheDocument();
  });

  it("renders all 19 content cards", () => {
    render(<PlayPage />);
    // すべてのカテゴリリストを取得してリンク合計数が19であることを確認
    const links = screen
      .getAllByRole("list", { name: /カテゴリ/ })
      .flatMap((list) => within(list).getAllByRole("link"));
    expect(links.length).toBe(19);
  });

  it("renders links with /play/ path", () => {
    render(<PlayPage />);
    const links = screen
      .getAllByRole("list", { name: /カテゴリ/ })
      .flatMap((list) => within(list).getAllByRole("link"));
    links.forEach((link) => {
      expect(link.getAttribute("href")).toMatch(/^\/play\//);
    });
  });

  it("does not render quiz guidance section linking to /quiz", () => {
    render(<PlayPage />);
    const quizLink = screen.queryByRole("link", { name: /クイズ・診断/ });
    expect(quizLink).toBeNull();
  });

  it("renders breadcrumb navigation", () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("navigation", { name: "パンくずリスト" }),
    ).toBeInTheDocument();
  });

  it("renders hero decorative emoji elements for visual enhancement", () => {
    render(<PlayPage />);
    // ヒーローバナー内に装飾絵文字が存在することを確認
    const heroBanner = document.querySelector("[data-testid='hero-banner']");
    expect(heroBanner).toBeInTheDocument();
    const decorativeEmojis = heroBanner?.querySelectorAll(
      "[aria-hidden='true']",
    );
    expect(decorativeEmojis?.length).toBeGreaterThanOrEqual(4);
  });

  it("renders card icon wrapper with accent background circle", () => {
    render(<PlayPage />);
    // カードアイコンがラッパー要素で包まれていることを確認
    const iconWrappers = document.querySelectorAll(
      "[data-testid='card-icon-wrapper']",
    );
    expect(iconWrappers.length).toBeGreaterThan(0);
  });

  it("renders home link in breadcrumb", () => {
    render(<PlayPage />);
    const breadcrumb = screen.getByRole("navigation", {
      name: "パンくずリスト",
    });
    expect(
      within(breadcrumb).getByRole("link", { name: "ホーム" }),
    ).toBeInTheDocument();
  });

  it("category sections display correct number of items (fortune:1, personality:11, knowledge:3, game:4)", () => {
    render(<PlayPage />);
    const [fortuneList, personalityList, knowledgeList, gameList] =
      screen.getAllByRole("list", { name: /カテゴリ/ });
    expect(within(fortuneList).getAllByRole("link").length).toBe(1);
    expect(within(personalityList).getAllByRole("link").length).toBe(11);
    expect(within(knowledgeList).getAllByRole("link").length).toBe(3);
    expect(within(gameList).getAllByRole("link").length).toBe(4);
  });

  // ===== 3-A: デイリー更新バッジ =====
  it("renders '毎日更新' badge on daily content cards", () => {
    render(<PlayPage />);
    const badges = screen.getAllByText("毎日更新");
    // 対象スラグ: daily, kanji-kanaru, yoji-kimeru, nakamawake, irodori の5件
    expect(badges.length).toBe(5);
  });

  it("does not render '毎日更新' badge on non-daily content cards", () => {
    render(<PlayPage />);
    // 非デイリーカードのうち1枚（性格診断系）にバッジがないことを確認
    const allLinks = screen
      .getAllByRole("list", { name: /カテゴリ/ })
      .flatMap((list) => within(list).getAllByRole("link"));
    // バッジありのカード数は5件のみ
    const cardsWithBadge = allLinks.filter((link) =>
      within(link).queryByText("毎日更新"),
    );
    expect(cardsWithBadge.length).toBe(5);
  });

  // ===== 3-B: カテゴリアンカーリンクタブ =====
  it("renders category navigation tabs below the hero banner", () => {
    render(<PlayPage />);
    const categoryNav = screen.getByRole("navigation", {
      name: "カテゴリナビゲーション",
    });
    expect(categoryNav).toBeInTheDocument();
  });

  it("renders all 4 category tab links in the navigation", () => {
    render(<PlayPage />);
    const categoryNav = screen.getByRole("navigation", {
      name: "カテゴリナビゲーション",
    });
    expect(
      within(categoryNav).getByRole("link", { name: "占い" }),
    ).toBeInTheDocument();
    expect(
      within(categoryNav).getByRole("link", { name: "性格診断" }),
    ).toBeInTheDocument();
    expect(
      within(categoryNav).getByRole("link", { name: "知識テスト" }),
    ).toBeInTheDocument();
    expect(
      within(categoryNav).getByRole("link", { name: "ゲーム" }),
    ).toBeInTheDocument();
  });

  it("category tab links have correct anchor href", () => {
    render(<PlayPage />);
    const categoryNav = screen.getByRole("navigation", {
      name: "カテゴリナビゲーション",
    });
    expect(
      within(categoryNav)
        .getByRole("link", { name: "占い" })
        .getAttribute("href"),
    ).toBe("#fortune");
    expect(
      within(categoryNav)
        .getByRole("link", { name: "性格診断" })
        .getAttribute("href"),
    ).toBe("#personality");
    expect(
      within(categoryNav)
        .getByRole("link", { name: "知識テスト" })
        .getAttribute("href"),
    ).toBe("#knowledge");
    expect(
      within(categoryNav)
        .getByRole("link", { name: "ゲーム" })
        .getAttribute("href"),
    ).toBe("#game");
  });

  it("each category section has the correct id attribute for anchor links", () => {
    render(<PlayPage />);
    expect(document.getElementById("fortune")).toBeInTheDocument();
    expect(document.getElementById("personality")).toBeInTheDocument();
    expect(document.getElementById("knowledge")).toBeInTheDocument();
    expect(document.getElementById("game")).toBeInTheDocument();
  });
});
