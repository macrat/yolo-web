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
    // 対象スラグ: daily, kanji-kanaru, yoji-kimeru, nakamawake, irodori の5種
    // 「まずはここから」に character-personality が入りirodoriは重複しないため合計5件
    // ※ daily は「まずはここから」から除外（FortunePreview セクションで表示）
    expect(badges.length).toBe(5);
  });

  it("does not render '毎日更新' badge on non-daily content cards", () => {
    render(<PlayPage />);
    // カテゴリセクションのリストに限定して確認
    const allLinks = screen
      .getAllByRole("list", { name: /カテゴリ/ })
      .flatMap((list) => within(list).getAllByRole("link"));
    // カテゴリセクション内のバッジありのカード数は5件のみ
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

  // ===== タスク12: /play一覧ページUX改善 =====

  // A.1: 「今日のピックアップ」セクション
  it("renders 'today's pickup' section in hero area", () => {
    render(<PlayPage />);
    const pickupSection = screen.getByTestId("pickup-section");
    expect(pickupSection).toBeInTheDocument();
  });

  it("renders pickup section with a title", () => {
    render(<PlayPage />);
    const pickupSection = screen.getByTestId("pickup-section");
    // ピックアップされたコンテンツのタイトルが存在すること
    const heading = within(pickupSection).getByRole("heading");
    expect(heading).toBeInTheDocument();
  });

  it("renders pickup section with a CTA link to /play/", () => {
    render(<PlayPage />);
    const pickupSection = screen.getByTestId("pickup-section");
    const ctaLink = within(pickupSection).getByRole("link");
    expect(ctaLink.getAttribute("href")).toMatch(/^\/play\//);
  });

  it("renders pickup section label text", () => {
    render(<PlayPage />);
    expect(screen.getByText("今日のピックアップ")).toBeInTheDocument();
  });

  // B.3: 「まずはここから」セクション
  it("renders 'start here' featured section before category sections", () => {
    render(<PlayPage />);
    const featuredSection = screen.getByTestId("featured-section");
    expect(featuredSection).toBeInTheDocument();
  });

  it("renders 'まずはここから' heading in featured section", () => {
    render(<PlayPage />);
    const featuredSection = screen.getByTestId("featured-section");
    expect(
      within(featuredSection).getByRole("heading", { name: "まずはここから" }),
    ).toBeInTheDocument();
  });

  it("renders exactly 3 featured cards in the featured section", () => {
    // 占いカテゴリは FortunePreview セクションで表示するため除外し、3件に変更
    render(<PlayPage />);
    const featuredSection = screen.getByTestId("featured-section");
    const featuredLinks = within(featuredSection).getAllByRole("link");
    expect(featuredLinks.length).toBe(3);
  });

  it("featured section cards link to /play/ paths", () => {
    render(<PlayPage />);
    const featuredSection = screen.getByTestId("featured-section");
    const featuredLinks = within(featuredSection).getAllByRole("link");
    featuredLinks.forEach((link) => {
      expect(link.getAttribute("href")).toMatch(/^\/play\//);
    });
  });

  it("featured section appears before category sections in the DOM", () => {
    render(<PlayPage />);
    const featuredSection = screen.getByTestId("featured-section");
    const fortuneSection = document.getElementById("fortune");
    expect(featuredSection).toBeInTheDocument();
    expect(fortuneSection).toBeInTheDocument();
    // document order: featuredSection は fortune セクションより前に出現すること
    const allSections = document.querySelectorAll(
      "[data-testid='featured-section'], #fortune",
    );
    expect(allSections[0]).toBe(featuredSection);
  });

  // C.4: カードのグラデーション背景
  it("renders cards with gradient background data attribute", () => {
    render(<PlayPage />);
    // グラデーション背景を持つカードが存在すること（data-testid で確認）
    const gradientCards = document.querySelectorAll(
      "[data-testid='card-with-gradient']",
    );
    expect(gradientCards.length).toBeGreaterThan(0);
  });

  // D.7: カテゴリナビのsticky化
  it("category nav has sticky class for scroll tracking", () => {
    render(<PlayPage />);
    const categoryNav = screen.getByRole("navigation", {
      name: "カテゴリナビゲーション",
    });
    // stickyクラスが付与されていることを確認（CSSモジュールクラス名は変換されるためdata属性で確認）
    expect(categoryNav).toHaveAttribute("data-sticky", "true");
  });

  // ===== レビュー指摘修正 =====

  // S-1: 「まずはここから」セクションのaria-label
  it("featured section has aria-label for accessibility", () => {
    render(<PlayPage />);
    const featuredSection = screen.getByTestId("featured-section");
    // <section> 自体が aria-label または aria-labelledby を持つこと
    const ariaLabel = featuredSection.getAttribute("aria-label");
    const ariaLabelledby = featuredSection.getAttribute("aria-labelledby");
    expect(ariaLabel || ariaLabelledby).toBeTruthy();
  });

  // S-2: heroSubtext の「全N種」が動的に生成されること
  it("renders dynamic content count in hero subtext", () => {
    render(<PlayPage />);
    // 「全19種」のような動的テキストが存在すること（数値はallPlayContents.lengthに基づく）
    const heroSubtext = document.querySelector("[data-testid='hero-subtext']");
    expect(heroSubtext).toBeInTheDocument();
    expect(heroSubtext?.textContent).toMatch(/全\d+種/);
  });

  // S-2: metadata の description が動的であることはサーバーサイドのためここではスキップ
  // （metadataはNext.jsのサーバー処理のためレンダーテストでは検証不可）

  // ===== レビュー12人目指摘修正 =====

  // M-1: カテゴリ別セクションで shortTitle を優先表示すること
  it("category section cards use shortTitle when available", () => {
    render(<PlayPage />);
    // /play/registry でquizMetaのshortTitleが設定されているコンテンツのカード
    // "japanese-culture" の shortTitle が "日本文化適性診断" であることを確認
    // shortTitleが設定されているコンテンツのタイトルがカードに表示されること
    const categoryLists = screen.getAllByRole("list", { name: /カテゴリ/ });
    const allLinks = categoryLists.flatMap((list) =>
      within(list).getAllByRole("link"),
    );
    // shortTitle "日本文化適性診断" が表示されていること（full title "あなたが極めるべき日本文化診断" ではなく）
    const hasShortTitle = allLinks.some((link) =>
      link.textContent?.includes("日本文化適性診断"),
    );
    expect(hasShortTitle).toBe(true);
  });
});
