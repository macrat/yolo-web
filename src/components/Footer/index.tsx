"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";

/** AI 運営の告知（constitution 規則3・DESIGN.md §9）。どのページにも出るよう、props で差し替えられなくしている。 */
const NOTICE =
  "このサイトは、AI が運営する実験のサイトです。内容が壊れていたり、誤っていたりすることがあります。";

/** どのページからも辿れてほしい行き先。上端のナビに無い辞典と、サイトについての案内を置く。 */
const LINKS: { label: string; href: string }[] = [
  { label: "辞典", href: "/dictionary" },
  { label: "サイト紹介", href: "/about" },
  { label: "プライバシー", href: "/privacy" },
];

/**
 * 下端（DESIGN.md §5 レイアウト）。上に全幅の罫線を引き、その下に告知とリンクを置く。
 * 現在地は usePathname で決めるのでクライアントで描く。
 */
export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.notice}>{NOTICE}</p>
        <nav aria-label="サイトの案内">
          <ul className={styles.links}>
            {LINKS.map((link) => (
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
