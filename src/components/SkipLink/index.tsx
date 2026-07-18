import styles from "./SkipLink.module.css";

/**
 * スキップ先となる layout.tsx の <main> の id。
 * リンクの href（#main-content）と main の id を 1 箇所で束ね、両者のズレを防ぐ。
 */
export const MAIN_CONTENT_ID = "main-content";

/**
 * SkipLink — 本文へのスキップリンク（WCAG 2.4.1 Bypass Blocks(A)）。
 * body 直下・Header より前に置く最初の focusable 要素として配置する。
 */
export default function SkipLink() {
  return (
    <a href={`#${MAIN_CONTENT_ID}`} className={styles.skipLink}>
      メインコンテンツへスキップ
    </a>
  );
}
