import { MAIN_CONTENT_ID } from "@/lib/site-frame";
import styles from "./SkipLink.module.css";

/**
 * 本文へのスキップのリンク（WCAG 2.4.1）。SiteFrame が上端より前に、最初にフォーカスが入る要素として置く。
 */
export default function SkipLink() {
  return (
    <a href={`#${MAIN_CONTENT_ID}`} className={styles.skipLink}>
      メインコンテンツへスキップ
    </a>
  );
}
