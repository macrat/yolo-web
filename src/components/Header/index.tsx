import Link from "next/link";
import styles from "./Header.module.css";

/** サイト全体で固定のナビゲーション項目。
 * 全ページ共通とし、ページごとに差し替える要件はない。
 * 追加・削除は本ファイルを編集する形で行う。
 * 「ツール」を先頭に（cycle-167 コンセプト「日常の傍にある道具」の主軸を視覚的に表現）。
 * 「サイト紹介」は信頼形成のため Header に動線を確保。 */
const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "ツール", href: "/tools" },
  { label: "遊び", href: "/play" },
  { label: "ブログ", href: "/blog" },
  { label: "サイト紹介", href: "/about" },
];

interface HeaderProps {
  /** テーマトグル等を後から挿入できるスロット。
   * Header の責務に具体的な操作要素を持たせず、外部から注入する設計。 */
  actions?: React.ReactNode;
}

/**
 * Header — サイトヘッダー。
 *
 * - 左: ロゴ「yolos.net」（dot のみ `--accent` カラー、クリックでトップへ）
 * - 中央〜右: 固定ナビゲーション（`/play`・`/tools`・`/blog`）
 * - 右端: `actions` スロット（テーマトグル等の差し込み口）
 *
 * ナビゲーション項目はサイト全体で共通とするため `NAV_ITEMS` 定数で内部固定。
 * 一貫性確保と layout 側の boilerplate 回避のため props では受け取らない。
 *
 * デザイン:
 * - 背景は `--bg`（パネルと同じ）、下辺に `--border` の区切り線
 * - ロゴデザインの参考: `docs/design-system-by-claude-design/preview/logo.html`
 */
export default function Header({ actions }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* ロゴ: テキストロゴ。ドット（"."）のみ --accent カラー */}
        <Link href="/" className={styles.logo} aria-label="yolos.net">
          yolos<span className={styles.dot}>.</span>net
        </Link>

        {/* ナビゲーション */}
        <nav aria-label="メインナビゲーション" className={styles.nav}>
          {NAV_ITEMS.map((item) => (
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
