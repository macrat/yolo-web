/**
 * SiteFooter — ページ下部の共通フッター（design-system 版）
 *
 * ## 用途
 * サイト全体のフッターナビゲーションと法的免責文を提供する構造部品。
 * philosophy.md の指針「フッターは細い罫線一本＋小さなテキストのみ」に従い、
 * 存在を最小限に抑えた静かな末尾として機能する。
 *
 * ## 使う場面
 * - アプリのルートレイアウトで 1 度だけレンダリングする
 * - linkGroups props でナビ項目を渡すことで、セクションごとのリンク群を表示できる
 * - disclaimer props で免責文をカスタマイズできる
 *
 * ## 使わない場面
 * - ページ内のセクション区切りには使わない（SectionHead を使う）
 * - 見出し・画像・CTAボタンを含むリッチなフッターには使わない
 *   （functional-quiet の規範に反する）
 *
 * ## 2 系統併存に関する注記
 * 現在の本番実装は `src/components/common/Footer.tsx` にあります。
 * このファイルは次サイクルで差し替え候補となる design-system 版です。
 * 本番への差し替えは cycle-170 完了後に行われます。それまでは接続しないでください。
 */

import Link from "next/link";
import styles from "./SiteFooter.module.css";

/** フッターナビゲーションのリンク 1 件の型 */
export interface FooterLink {
  href: string;
  label: string;
}

/** フッターナビゲーションのグループ 1 件の型 */
export interface FooterLinkGroup {
  /** グループの見出しテキスト */
  heading: string;
  /** グループ内のリンク一覧 */
  links: FooterLink[];
}

export interface SiteFooterProps {
  /**
   * フッターナビゲーションに表示するリンクグループの配列。
   * グループ単位で見出しを持ち、複数のリンクをまとめる。
   */
  linkGroups: FooterLinkGroup[];
  /**
   * フッター下部に表示する免責文。
   * AI 実験プロジェクトである旨を伝えるテキストを想定。
   * @default "このサイトはAIによる実験的プロジェクトです..."
   */
  disclaimer?: string;
}

const DEFAULT_DISCLAIMER =
  "このサイトはAIによる実験的プロジェクトです。コンテンツはAIが生成しており、内容が壊れていたり不正確な場合があります。";

/**
 * サイト共通フッター。
 * 細い罫線一本と小さなテキストのみで構成する（philosophy.md 指針）。
 * グラデーション・影・装飾的要素は一切使わない。
 */
export default function SiteFooter({
  linkGroups,
  disclaimer = DEFAULT_DISCLAIMER,
}: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="フッターナビゲーション">
          {linkGroups.map((group) => (
            <div key={group.heading} className={styles.group}>
              <h3 className={styles.groupHeading}>{group.heading}</h3>
              <ul className={styles.groupList} role="list">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {disclaimer && <p className={styles.disclaimer}>{disclaimer}</p>}
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} yolos.net
        </p>
      </div>
    </footer>
  );
}
