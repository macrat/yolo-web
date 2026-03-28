"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

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
