"use client";

import { usePathname } from "next/navigation";
import FrameLink from "@/components/FrameLink";
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
        <FrameLink
          href="/"
          label={SITE_NAME}
          current={pathname === "/"}
          className={styles.siteName}
        />
        <nav aria-label="メインナビゲーション">
          <ul className={styles.navList}>
            {HEADER_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <FrameLink
                  href={item.href}
                  label={item.label}
                  current={pathname === item.href}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
