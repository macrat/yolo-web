"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AI_NOTICE, FOOTER_LINKS } from "@/lib/site-frame";
import styles from "./Footer.module.css";

/**
 * 下端（DESIGN.md §5 レイアウト）。上に全幅の罫線を引き、その下に告知とリンクを置く。
 * 現在地は usePathname で決めるのでクライアントで描く。
 */
export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.notice}>{AI_NOTICE}</p>
        <nav aria-label="サイトの案内">
          <ul className={styles.links}>
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={styles.link}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
