/**
 * GlobalNotFoundContent — 404 ページの本文コンポーネント（テスト可能な単体）
 *
 * global-not-found.js はトップレベルに <html>/<body> を持つため Vitest で
 * そのままレンダリングできない。本コンポーネントを分離することで
 * テストを global-not-found.js の外部から行えるようにする。
 *
 * B-333-7 (cycle-180)
 */

import ItemList, { type ItemListItem } from "@/components/ItemList";
import styles from "./global-not-found.module.css";

const LINKS: ItemListItem[] = [
  {
    href: "/",
    name: "ホーム",
    description: "トップページに戻る",
  },
  {
    href: "/tools",
    name: "無料オンラインツール",
    description: "すぐに使える便利ツール集",
  },
  {
    href: "/play",
    name: "遊ぶ",
    description: "遊んで学べるブラウザゲーム",
  },
  {
    href: "/blog",
    name: "ブログ",
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
        <h2 id="not-found-links" className={styles.sectionsTitle}>
          主要コンテンツ
        </h2>
        <ItemList labelledBy="not-found-links" items={LINKS} />
      </section>
    </div>
  );
}
