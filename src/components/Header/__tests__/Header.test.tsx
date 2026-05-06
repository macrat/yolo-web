/**
 * Header コンポーネントのテスト。
 * CSS のメディアクエリは JSDOM では効かないため、ロジック挙動のみを検証する。
 * - ハンバーガーボタンの描画
 * - aria-expanded の初期値と開閉状態
 * - モバイルメニューの開閉
 * - Escape キーで閉じる
 * - メニュー内リンクをクリックしたら閉じる
 * - NAV_ITEMS 全リンクがモバイルメニューに表示される
 * - アクティブ状態（aria-current="page"）
 * - オーバーレイクリックでメニューが閉じる
 * - ボディスクロールロック
 * - role="banner"
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Header from "../index";

// next/link をシンプルな <a> タグにモック
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    className,
    "aria-current": ariaCurrent,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    "aria-current"?: React.AriaAttributes["aria-current"];
  }) => (
    <a
      href={href}
      onClick={onClick}
      className={className}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  ),
}));

// next/navigation をモック（usePathname）
let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("Header", () => {
  describe("ハンバーガーボタン", () => {
    it("ハンバーガーボタンが描画される", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      expect(btn).toBeInTheDocument();
    });

    it("初期状態で aria-expanded が false", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });

    it("ハンバーガークリックでモバイルメニューが開く", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      fireEvent.click(btn);

      expect(btn).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByRole("button", { name: /メニューを閉じる/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("navigation", { name: "メインナビゲーション" }),
      ).toBeInTheDocument();
    });

    it("ハンバーガーを再クリックでメニューが閉じる", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      fireEvent.click(btn);
      const closeBtn = screen.getByRole("button", { name: /メニューを閉じる/ });
      fireEvent.click(closeBtn);

      expect(
        screen.getByRole("button", { name: /メニューを開く/ }),
      ).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByRole("navigation", { name: "メインナビゲーション" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Escape キー", () => {
    it("メニュー開放中に Escape で閉じる", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      fireEvent.click(btn);

      // メニューが開いていること
      expect(btn).toHaveAttribute("aria-expanded", "true");

      fireEvent.keyDown(document, { key: "Escape" });

      expect(
        screen.getByRole("button", { name: /メニューを開く/ }),
      ).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("メニュー内リンク", () => {
    it("リンクをクリックするとメニューが閉じる", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      fireEvent.click(btn);

      // "ツール" リンクをクリック
      const toolsLinks = screen.getAllByRole("link", { name: "ツール" });
      // モバイルメニュー内のリンクをクリック（開いているので DOM にある）
      fireEvent.click(toolsLinks[toolsLinks.length - 1]);

      expect(
        screen.getByRole("button", { name: /メニューを開く/ }),
      ).toHaveAttribute("aria-expanded", "false");
    });

    it("モバイルメニュー開放時に NAV_ITEMS 全リンクが表示される", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      fireEvent.click(btn);

      const nav = screen.getByRole("navigation", {
        name: "メインナビゲーション",
      });
      expect(nav).toBeInTheDocument();

      // 4 項目すべてが含まれている
      const navItems = ["ツール", "遊び", "ブログ", "サイト紹介"];
      for (const label of navItems) {
        // nav 内のリンクを確認
        const links = nav.querySelectorAll("a");
        const found = Array.from(links).some((a) => a.textContent === label);
        expect(found, `"${label}" がモバイルメニュー内に見つからない`).toBe(
          true,
        );
      }
    });
  });

  describe("actions スロット", () => {
    it("actions が渡されたときモバイルメニュー内に表示される", () => {
      render(<Header actions={<button type="button">テーマ切替</button>} />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      fireEvent.click(btn);

      // actions はデスクトップとモバイルの両方の DOM 位置に挿入される。
      // CSS のメディアクエリで片方だけが表示される設計なので、
      // モバイルメニュー内に actions が含まれていることを id で限定して確認する。
      const mobileMenu = document.getElementById("header-mobile-menu");
      expect(mobileMenu).not.toBeNull();
      const themeBtnInMobile = mobileMenu?.querySelector(
        'button[type="button"]',
      );
      expect(themeBtnInMobile?.textContent).toBe("テーマ切替");
    });
  });

  describe("role='banner'", () => {
    it("header 要素が role='banner' を持つ", () => {
      render(<Header />);
      const banner = screen.getByRole("banner");
      expect(banner).toBeInTheDocument();
    });
  });

  describe("アクティブ状態", () => {
    beforeEach(() => {
      mockPathname = "/tools";
    });

    afterEach(() => {
      mockPathname = "/";
    });

    it("/tools にいるとき、ツールリンクが aria-current='page' を持つ", () => {
      render(<Header />);
      // デスクトップナビ内のリンクを確認（CSS で表示切替されるが DOM には存在する）
      const links = screen.getAllByRole("link", { name: "ツール" });
      const activeLinks = links.filter(
        (link) => link.getAttribute("aria-current") === "page",
      );
      expect(activeLinks.length).toBeGreaterThan(0);
    });

    it("/tools にいるとき、ブログリンクは aria-current を持たない", () => {
      render(<Header />);
      const links = screen.getAllByRole("link", { name: "ブログ" });
      for (const link of links) {
        expect(link).not.toHaveAttribute("aria-current", "page");
      }
    });
  });

  describe("オーバーレイクリックでメニューを閉じる", () => {
    it("オーバーレイをクリックするとメニューが閉じる", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      fireEvent.click(btn);

      // メニューが開いていることを確認
      expect(btn).toHaveAttribute("aria-expanded", "true");

      // オーバーレイ（aria-hidden="true" の div）をクリック
      // CSS モジュールのクラス名はハッシュ化されるため、aria-hidden かつ header 直下の div で取得する
      const overlay = document.querySelector(
        "header > div[aria-hidden='true']",
      );

      // オーバーレイが DOM に存在することを確認（存在しない場合はここで失敗する）
      expect(overlay).not.toBeNull();
      fireEvent.click(overlay!);
      expect(
        screen.getByRole("button", { name: /メニューを開く/ }),
      ).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("ボディスクロールロック", () => {
    it("メニューを開くと body に scroll-locked クラスが付く", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      fireEvent.click(btn);
      expect(document.body.classList.contains("scroll-locked")).toBe(true);
    });

    it("メニューを閉じると body から scroll-locked クラスが外れる", () => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: /メニューを開く/ });
      fireEvent.click(btn);
      const closeBtn = screen.getByRole("button", { name: /メニューを閉じる/ });
      fireEvent.click(closeBtn);
      expect(document.body.classList.contains("scroll-locked")).toBe(false);
    });
  });

  describe("検索トリガー (onSearchOpen)", () => {
    it("onSearchOpen を渡さない場合、検索ボタンが描画されない", () => {
      render(<Header />);
      const searchBtn = screen.queryByRole("button", { name: "検索" });
      expect(searchBtn).not.toBeInTheDocument();
    });

    it("onSearchOpen を渡した場合、検索ボタンが描画される", () => {
      const onSearchOpen = vi.fn();
      render(<Header onSearchOpen={onSearchOpen} />);
      // デスクトップ用とモバイル用の2つが DOM に存在する（CSS で片方を非表示）
      const searchBtns = screen.getAllByRole("button", { name: "検索" });
      expect(searchBtns.length).toBeGreaterThan(0);
    });

    it("検索ボタンをクリックすると onSearchOpen が呼ばれる", () => {
      const onSearchOpen = vi.fn();
      render(<Header onSearchOpen={onSearchOpen} />);
      // デスクトップ用とモバイル用の2つが DOM に存在する（CSS で片方を非表示）
      const searchBtns = screen.getAllByRole("button", { name: "検索" });
      fireEvent.click(searchBtns[0]);
      expect(onSearchOpen).toHaveBeenCalledTimes(1);
    });

    it("Ctrl+K キーで onSearchOpen が呼ばれる", () => {
      const onSearchOpen = vi.fn();
      render(<Header onSearchOpen={onSearchOpen} />);
      fireEvent.keyDown(document, { key: "k", ctrlKey: true });
      expect(onSearchOpen).toHaveBeenCalledTimes(1);
    });

    it("Meta+K キー（Mac）で onSearchOpen が呼ばれる", () => {
      const onSearchOpen = vi.fn();
      render(<Header onSearchOpen={onSearchOpen} />);
      fireEvent.keyDown(document, { key: "k", metaKey: true });
      expect(onSearchOpen).toHaveBeenCalledTimes(1);
    });

    it("onSearchOpen が渡されていない場合、Ctrl+K でエラーが起きない", () => {
      render(<Header />);
      expect(() => {
        fireEvent.keyDown(document, { key: "k", ctrlKey: true });
      }).not.toThrow();
    });

    it("アンマウント後は keydown リスナーが解除される", () => {
      const onSearchOpen = vi.fn();
      const { unmount } = render(<Header onSearchOpen={onSearchOpen} />);
      unmount();
      fireEvent.keyDown(document, { key: "k", ctrlKey: true });
      expect(onSearchOpen).not.toHaveBeenCalled();
    });
  });
});
