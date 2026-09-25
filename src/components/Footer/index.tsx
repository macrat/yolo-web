"use client";

import { usePathname } from "next/navigation";
import FrameLink from "@/components/FrameLink";
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
                <FrameLink
                  href={link.href}
                  label={link.label}
                  current={pathname === link.href}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
