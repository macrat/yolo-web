"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";
import styles from "./MobileNav.module.css";

interface NavLink {
  readonly href: string;
  readonly label: string;
}

interface MobileNavProps {
  links: readonly NavLink[];
}

/**
 * ホームは完全一致、その他は前方一致でアクティブ状態を判定する。
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export default function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  /** isOpen 中はボディスクロールをロックして背景がスクロールしないようにする。
   * scroll-lock.ts の参照カウンタ式ヘルパを使用。
   * Header と同居しても scroll-locked クラスを奪い合わない。
   * AP-I07 準拠: body.style.overflow の直書き禁止。
   * mount 時に isOpen=false の場合は acquire していないため release しない（二重解放防止）。 */
  useEffect(() => {
    if (isOpen) {
      acquireScrollLock();
    }
    return () => {
      if (isOpen) {
        releaseScrollLock();
      }
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className={styles.mobileNav}>
      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
        type="button"
      >
        <span className={`${styles.bar} ${isOpen ? styles.barOpen1 : ""}`} />
        <span className={`${styles.bar} ${isOpen ? styles.barOpen2 : ""}`} />
        <span className={`${styles.bar} ${isOpen ? styles.barOpen3 : ""}`} />
      </button>

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* role="menu" はデスクトップアプリのコンテキストメニュー用ロールであり、
          ナビゲーションリンクには不適切なため使用しない。
          aria-hidden でメニューが閉じているときに支援技術から隠す。
          aria-hidden={false} は誤解釈される可能性があるため属性自体を省略する。 */}
      <ul
        id="mobile-menu"
        className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}
        aria-label="モバイルメニュー"
        aria-hidden={isOpen ? undefined : "true"}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`${styles.menuLink}${isActive(pathname, link.href) ? ` ${styles.activeLink}` : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
