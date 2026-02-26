import Link from "next/link";
import styles from "./Footer.module.css";

interface FooterProps {
  gameLinks?: { href: string; label: string }[];
}

export default function Footer({ gameLinks }: FooterProps) {
  const SECTION_LINKS = [
    {
      heading: "ツール",
      links: [
        { href: "/tools", label: "ツール一覧" },
        { href: "/cheatsheets", label: "チートシート" },
      ],
    },
    {
      heading: "ゲーム",
      links: [{ href: "/games", label: "ゲーム一覧" }, ...(gameLinks ?? [])],
    },
    {
      heading: "コンテンツ",
      links: [
        { href: "/quiz", label: "クイズ・診断" },
        { href: "/colors", label: "日本の伝統色" },
        { href: "/dictionary", label: "辞書" },
      ],
    },
    {
      heading: "その他",
      links: [
        { href: "/blog", label: "ブログ" },
        { href: "/memos", label: "メモ" },
        { href: "/about", label: "このサイトについて" },
      ],
    },
  ];

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <nav className={styles.sectionNav} aria-label="Footer navigation">
          {SECTION_LINKS.map((section) => (
            <div key={section.heading} className={styles.sectionGroup}>
              <h3 className={styles.sectionHeading}>{section.heading}</h3>
              <ul className={styles.sectionList}>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.sectionLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className={styles.disclaimer}>
          このサイトはAIによる実験的プロジェクトです。コンテンツはAIが生成しており、内容が壊れていたり不正確な場合があります。
        </p>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} yolos.net |{" "}
          <a
            href="https://github.com/macrat/yolo-web"
            className={styles.sectionLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
