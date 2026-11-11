import { MAIN_CONTENT_ID } from "@/lib/site-frame";
import styles from "./SkipLink.module.css";

/**
 * 本文へのスキップのリンク（WCAG 2.4.1）。SiteFrame が上端より前に、最初にフォーカスが入る要素として置く。
 * フォーカスが入ったときだけ、上端の上に1行として出る。
 */
export default function SkipLink() {
  return (
    <div className={styles.row}>
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className={styles.link}
        data-text-box="inline"
      >
        メインコンテンツへスキップ
      </a>
    </div>
  );
}
