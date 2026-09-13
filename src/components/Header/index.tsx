"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";
import styles from "./Header.module.css";

/** サイト全体で固定のナビゲーション項目。
 * 全ページ共通とし、ページごとに差し替える要件はない。
 * 追加・削除は本ファイルを編集する形で行う。
 * 「遊び」を先頭に（cycle-277 決定(a)＝診断中心への統一。サイトの主軸＝
 * 自分を知り、楽しむ体験〔/play〕をナビ先頭で表現する。旧「ツール」先頭は
 * 撤回した道具箱-as-core〔cycle-167〕の名残だった）。
 * 「サイト紹介」は信頼形成のため Header に動線を確保。 */
const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "遊び", href: "/play" },
  { label: "ツール", href: "/tools" },
  { label: "ブログ", href: "/blog" },
  { label: "サイト紹介", href: "/about" },
];

/** ハンバーガーアイコン（Lucide スタイル線画）。
 * 3本の横線。stroke-width 1.5px、24px サイズ。 */
function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

interface HeaderProps {
  /** テーマトグル等を後から挿入できるスロット。
   * Header の責務に具体的な操作要素を持たせず、外部から注入する設計。 */
  actions?: React.ReactNode;
}

/**
 * Header — サイトヘッダー。
 *
 * - 左: ロゴ「yolos.net」（dot のみ `--accent` カラー、クリックでトップへ）
 * - デスクトップ（min-width: 721px）: 中央〜右に横並びナビ + 右端 actions スロット
 * - モバイル（max-width: 720px）: ハンバーガーボタン → タップでパネル展開
 *
 * ナビゲーション項目はサイト全体で共通とするため `NAV_ITEMS` 定数で内部固定。
 * 一貫性確保と layout 側の boilerplate 回避のため props では受け取らない。
 *
 * デザイン（DESIGN.md §4「のれん」）:
 * - 店号（サイト名・明朝）+ 下辺に一本の `--rule-strong` 罫。背景色・影は付けない（地は紙）。
 * - ナビは文字のみ・現在地は朱（`aria-current="page"` を CSS で `--accent` 着色）。
 *
 * アクセシビリティ:
 * - aria-expanded / aria-controls / aria-label でハンバーガーの状態を通知
 * - Escape キーでメニューを閉じる
 * - リンクをクリックしたら自動的にメニューを閉じる
 */
export default function Header({ actions }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  /** Escape キーでモバイルメニューを閉じる */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  /** menuOpen 中はボディスクロールをロックして背景がスクロールしないようにする。
   * scroll-lock.ts の参照カウンタ式ヘルパを使用。
   * 別コンポーネントと同居しても scroll-locked クラスを奪い合わない。
   * AP-I07 準拠: body.style.overflow の直書き禁止。 */
  useEffect(() => {
    if (menuOpen) {
      acquireScrollLock();
    }
    return () => {
      if (menuOpen) {
        releaseScrollLock();
      }
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* ロゴ: テキストロゴ。ドット（"."）のみ --accent カラー */}
        <Link href="/" className={styles.logo} aria-label="yolos.net">
          yolos<span className={styles.dot}>.</span>net
        </Link>

        {/* デスクトップ専用: 横並びナビゲーション */}
        <nav
          aria-label="メインナビゲーション（デスクトップ）"
          className={styles.desktopNav}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* デスクトップ専用: アクションスロット（テーマトグル等） */}
        {actions != null && (
          <div className={styles.desktopActions}>{actions}</div>
        )}

        {/* モバイル専用: ハンバーガーボタン */}
        <button
          type="button"
          className={styles.hamburger}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
          aria-controls="header-mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* モバイルオーバーレイ: メニュー展開時に背面を覆う半透明レイヤー。
       * クリックでメニューを閉じる。デスクトップでは CSS で非表示。 */}
      {menuOpen && (
        <div
          aria-hidden="true"
          className={styles.mobileOverlay}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* モバイルメニュー（menuOpen 時のみレンダリング）
       * aria-controls の id と一致させる */}
      {menuOpen && (
        <div id="header-mobile-menu" className={styles.mobileMenu}>
          <nav aria-label="メインナビゲーション">
            <ul className={styles.mobileNavList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.mobileNavLink}
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* actions（テーマトグル等）もモバイルメニュー内に表示 */}
          {actions != null && (
            <div className={styles.mobileActions}>{actions}</div>
          )}
        </div>
      )}
    </header>
  );
}
