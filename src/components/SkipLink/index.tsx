import { MAIN_CONTENT_ID } from "@/lib/site-frame";
import styles from "./SkipLink.module.css";

/**
 * SkipLink — 本文へのスキップリンク（WCAG 2.4.1 Bypass Blocks(A)）。
 * SiteFrame が上端より前に、最初の focusable 要素として置く。
 */
export default function SkipLink() {
  return (
    <a href={`#${MAIN_CONTENT_ID}`} className={styles.skipLink}>
      メインコンテンツへスキップ
    </a>
  );
}
