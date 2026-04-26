/**
 * SiteHeader — ページ上部の共通ヘッダー（design-system 版）
 *
 * ## 用途
 * サイト全体のブランド名とメインナビゲーションを提供する構造部品。
 * ページのどこにいても「ここは yolos.net だ」と分かるアンカーとして機能する。
 *
 * ## 使う場面
 * - アプリのルートレイアウトで 1 度だけレンダリングする
 * - ナビ項目が変わるページ（例: ツール詳細で独自ナビを持つ）でも、
 *   navLinks を差し替えることで対応できる
 *
 * ## 使わない場面
 * - モーダル・ドロワー内のサブヘッダーには使わない（別途 SectionHead を使う）
 * - position: sticky / fixed が必要な場面には使わない（philosophy.md NEVER 節：
 *   「ヘッダーを固定する」は functional-quiet に反する）
 *
 * ## 2 系統併存に関する注記
 * 現在の本番実装は `src/components/common/Header.tsx` にあります。
 * このファイルは次サイクルで差し替え候補となる design-system 版です。
 * 本番への差し替えは cycle-170 完了後に行われます。それまでは接続しないでください。
 */

import Link from "next/link";
import styles from "./SiteHeader.module.css";

/** ナビゲーションリンク 1 件の型 */
export interface NavLink {
  /** リンク先 URL */
  href: string;
  /** ラベルテキスト（日本語可） */
  label: string;
}

export interface SiteHeaderProps {
  /**
   * メインナビゲーションに表示するリンクの配列。
   * 順番通りに左から右へ並ぶ。
   */
  navLinks: NavLink[];
  /**
   * ブランド名として左端に表示するテキスト。
   * ルートページへのリンクになる。
   * @default "yolos.net"
   */
  siteName?: string;
}

/**
 * サイト共通ヘッダー。
 * philosophy.md の `functional-quiet` トーンに基づき、ページに溶け込む静かな存在感にする。
 * ヘッダーは fixed / sticky にしない。
 */
export default function SiteHeader({
  navLinks,
  siteName = "yolos.net",
}: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="メインナビゲーション">
        <Link href="/" className={styles.brand}>
          {siteName}
        </Link>
        <ul className={styles.navList} role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
