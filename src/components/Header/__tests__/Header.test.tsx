/**
 * Header コンポーネントのテスト。
 * CSS のメディアクエリは JSDOM では効かないため、ロジック挙動のみを検証する。
 * - ハンバーガーボタンの描画
 * - aria-expanded の初期値と開閉状態
 * - モバイルメニューの開閉
 * - Escape キーで閉じる
 * - メニュー内リンクをクリックしたら閉じる
 * - NAV_ITEMS 全リンクがモバイルメニューに表示される
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
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
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
});
