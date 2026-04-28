import Link from "next/link";
import styles from "./Header.module.css";

/** ナビゲーション項目の型 */
export interface NavItem {
  label: string;
  href: string;
}

/** デフォルトのナビゲーション項目 */
const DEFAULT_NAV: NavItem[] = [
  { label: "遊ぶ", href: "/play" },
  { label: "ツール", href: "/tools" },
  { label: "ブログ", href: "/blog" },
];

interface HeaderProps {
  /** ナビゲーション項目。省略時はデフォルトの項目を表示する。 */
  nav?: NavItem[];
  /** テーマトグル等を後から挿入できるスロット */
  actions?: React.ReactNode;
}

/**
 * サイトヘッダー。
 *
 * - 左: ロゴ + サイト名（クリックでトップページへ）
 * - 中央〜右: ナビゲーションリンク（nav prop 経由で渡す）
 * - 右端: actions prop でテーマトグル等を後付け可能
 *
 * ロゴデザインは docs/design-system-by-claude-design/preview/logo.html を参照。
 * 背景は --bg（パネルと同じ白）、下辺に --border の区切り線を引く。
 */
export default function Header({ nav = DEFAULT_NAV, actions }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* ロゴ: テキストロゴ。ドット（"."）のみ --accent カラー */}
        <Link href="/" className={styles.logo} aria-label="yolos.net">
          yolos<span className={styles.dot}>.</span>net
        </Link>

        {/* ナビゲーション */}
        <nav aria-label="メインナビゲーション" className={styles.nav}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* アクションスロット（テーマトグル等） */}
        {actions != null && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
