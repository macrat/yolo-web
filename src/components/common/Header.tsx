import Link from "next/link";
import styles from "./Header.module.css";
import MobileNav from "./MobileNav";

const NAV_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/tools", label: "ツール" },
  { href: "/cheatsheets", label: "チートシート" },
  { href: "/games", label: "ゲーム" },
  { href: "/dictionary", label: "辞典" },
  { href: "/blog", label: "ブログ" },
  { href: "/memos", label: "メモ" },
  { href: "/about", label: "About" },
] as const;

export default function Header() {
  return (
    <header className={styles.header} role="banner">
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.logo}>
          yolos.net
        </Link>
        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <MobileNav links={NAV_LINKS} />
      </nav>
    </header>
  );
}
