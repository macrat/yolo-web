import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header} role="banner">
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.logo}>
          Yolo-Web
        </Link>
        <ul className={styles.links}>
          <li>
            <Link href="/">ホーム</Link>
          </li>
          <li>
            <Link href="/tools">ツール</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
