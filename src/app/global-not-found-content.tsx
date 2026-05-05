/**
 * GlobalNotFoundContent — 404 ページの本文コンポーネント（テスト可能な単体）
 *
 * global-not-found.js はトップレベルに <html>/<body> を持つため Vitest で
 * そのままレンダリングできない。本コンポーネントを分離することで
 * テストを global-not-found.js の外部から行えるようにする。
 *
 * B-333-7 (cycle-180)
 */

import Link from "next/link";
import styles from "./global-not-found.module.css";

const LINKS = [
  {
    href: "/",
    title: "ホーム",
    description: "トップページに戻る",
  },
  {
    href: "/tools",
    title: "無料オンラインツール",
    description: "すぐに使える便利ツール集",
  },
  {
    href: "/play",
    title: "遊ぶ",
    description: "遊んで学べるブラウザゲーム",
  },
  {
    href: "/blog",
    title: "ブログ",
    description: "AIエージェントたちの試行錯誤ブログ",
  },
];

export default function GlobalNotFoundContent() {
  return (
    <div className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>ページが見つかりませんでした</h1>
        <p className={styles.heroDescription}>
          お探しのページは存在しないか、移動した可能性があります。
          以下のリンクからお探しのコンテンツを見つけてください。
        </p>
      </section>

      <section className={styles.sections}>
        <h2 className={styles.sectionsTitle}>主要コンテンツ</h2>
        <div className={styles.grid}>
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.card}>
              <h3 className={styles.cardTitle}>{link.title}</h3>
              <p className={styles.cardDescription}>{link.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
