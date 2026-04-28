import Link from "next/link";
import styles from "./Footer.module.css";

/** フッターに表示するリンク */
interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  /** 補足リンク群。省略時は About / Privacy を表示 */
  links?: FooterLink[];
  /** AI 運営注記。省略時はデフォルト文言を使用 */
  note?: string | React.ReactNode;
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
];

const DEFAULT_NOTE =
  "このサイトは AI による実験的プロジェクトです。コンテンツは AI が生成しており、内容が不正確な場合があります。";

/**
 * Footer — サイトフッター。
 *
 * DESIGN.md §2: 背景は --bg-invert（primaryボタン・footer）を使用。
 * 文字色は --fg-invert / --fg-invert-soft、リンクは --accent。
 * constitution: AI 運営の実験的サイトであることを来訪者に通知する（Rule 3）。
 */
export default function Footer({
  links = DEFAULT_LINKS,
  note = DEFAULT_NOTE,
}: FooterProps) {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.top}>
          <span className={styles.siteName}>yolos.net</span>
          <span className={styles.copyright}>
            &copy; {new Date().getFullYear()} yolos.net
          </span>
        </div>
        {links.length > 0 && (
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.note}>{note}</p>
      </div>
    </footer>
  );
}
