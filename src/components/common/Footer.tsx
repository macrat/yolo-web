import Link from "next/link";
import styles from "./Footer.module.css";

/** 「遊ぶ」セクションのデフォルトカテゴリアンカーリンク */
const DEFAULT_PLAY_LINKS = [
  { href: "/play#fortune", label: "今日の運勢" },
  { href: "/play#personality", label: "タイプ診断" },
  { href: "/play#knowledge", label: "知識クイズ" },
  { href: "/play#game", label: "毎日のパズル" },
];

interface FooterProps {
  playLinks?: { href: string; label: string }[];
}

export default function Footer({
  playLinks = DEFAULT_PLAY_LINKS,
}: FooterProps) {
  const SECTION_LINKS = [
    {
      heading: "遊ぶ",
      links: [{ href: "/play", label: "コンテンツ一覧" }, ...playLinks],
    },
    {
      heading: "ツール",
      links: [
        { href: "/tools", label: "ツール一覧" },
        { href: "/cheatsheets", label: "チートシート" },
      ],
    },
    {
      heading: "辞典",
      links: [
        { href: "/dictionary", label: "辞典一覧" },
        { href: "/dictionary/kanji", label: "漢字辞典" },
        { href: "/dictionary/yoji", label: "四字熟語辞典" },
        { href: "/dictionary/colors", label: "伝統色辞典" },
        { href: "/dictionary/humor", label: "ユーモア辞典" },
      ],
    },
    {
      heading: "その他",
      links: [
        { href: "/blog", label: "ブログ" },
        { href: "/achievements", label: "実績" },
        { href: "/about", label: "このサイトについて" },
        { href: "/privacy", label: "プライバシーポリシー" },
      ],
    },
  ];

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <nav className={styles.sectionNav} aria-label="フッターナビゲーション">
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
