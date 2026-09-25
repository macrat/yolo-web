"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import { HEADER_NAV_ITEMS } from "@/lib/site-frame";
import styles from "./Header.module.css";

/**
 * 上端（DESIGN.md §5 レイアウト）。サイト名とナビを並べ、下に全幅の罫線を引く。
 * 1行に収まらない幅では折り返し、項目を隠さない。
 * 現在地は usePathname で決めるのでクライアントで描く。
 */
export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          className={`${styles.link} ${styles.siteName}`}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          {SITE_NAME}
        </Link>
        <nav aria-label="メインナビゲーション">
          <ul className={styles.navList}>
            {HEADER_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
