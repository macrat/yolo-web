import Link from "next/link";
import styles from "./Header.module.css";
import MobileNav from "./MobileNav";
import SearchTrigger from "../search/SearchTrigger";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/tools", label: "ツール" },
  { href: "/cheatsheets", label: "チートシート" },
  { href: "/games", label: "ゲーム" },
  { href: "/quiz", label: "クイズ" },
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
        <div className={styles.actions}>
          <SearchTrigger />
          <ThemeToggle />
          <MobileNav links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  );
}
