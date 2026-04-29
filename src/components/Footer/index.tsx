import Link from "next/link";
import styles from "./Footer.module.css";

/** サイト全体で固定のフッターリンク。
 * 全ページ共通とし、ページごとに差し替える要件はない。
 * 追加・削除は本ファイルを編集する形で行う。 */
const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
];

/** AI 運営の通知文（constitution Rule 3 の安全装置）。
 * 差し替え可能にすると本サイトの来訪者向け通知が漏れるリスクがあるため、
 * 内部固定にして上書きできない構造にしている。文言の改訂は本ファイルを
 * 編集する形で行う。 */
const NOTE =
  "このサイトは AI による実験的プロジェクトです。コンテンツは AI が生成しており、内容が不正確な場合があります。";

/**
 * Footer — サイトフッター。
 *
 * - サイト名「yolos.net」と「© 年 yolos.net」を表示
 * - 補足リンク群（`/about`・`/privacy`）
 * - AI 運営の注記（constitution Rule 3 への対応）
 *
 * 内容はすべてサイト全体で共通のため props を受け取らない。一貫性の確保と
 * layout 側の boilerplate 回避のため、リンクと注記は内部固定。AI 運営注記は
 * 上書きできない構造にして constitution Rule 3 の安全装置として機能させる。
 *
 * デザイン:
 * - 背景は `--bg-invert`（DESIGN.md §2「primaryボタン・footer」と整合）
 * - 文字色は `--fg-invert` / `--fg-invert-soft`、リンクは `--accent`
 */
export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.top}>
          <span className={styles.siteName}>yolos.net</span>
          <span className={styles.copyright}>
            &copy; {new Date().getFullYear()} yolos.net
          </span>
        </div>
        <ul className={styles.links}>
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.note}>{NOTE}</p>
      </div>
    </footer>
  );
}
