import Link from "next/link";
import styles from "./Header.module.css";
import NavLinks from "./NavLinks";
import MobileNav from "./MobileNav";
import SearchTrigger from "../search/SearchTrigger";
import ThemeToggle from "./ThemeToggle";
import StreakBadge from "@/lib/achievements/StreakBadge";

const NAV_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/play", label: "遊ぶ" },
  { href: "/tools", label: "ツール" },
  { href: "/dictionary", label: "辞典" },
  { href: "/blog", label: "ブログ" },
  { href: "/about", label: "サイト紹介" },
] as const;

export default function Header() {
  return (
    <header className={styles.header} role="banner">
      <nav className={styles.nav} aria-label="メインナビゲーション">
        <Link href="/" className={styles.logo}>
          yolos.net
        </Link>
        <NavLinks links={NAV_LINKS} />
        <div className={styles.actions}>
          <StreakBadge />
          <SearchTrigger />
          <ThemeToggle />
          <MobileNav links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  );
}
