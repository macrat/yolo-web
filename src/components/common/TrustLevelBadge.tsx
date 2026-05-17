import { TRUST_LEVEL_META, type TrustLevel } from "@/lib/trust-levels";
import styles from "./TrustLevelBadge.module.css";

interface TrustLevelBadgeProps {
  /** 信頼レベル */
  level: TrustLevel;
  /** 補足注記テキスト（混在ケース用） */
  note?: string;
}

/**
 * コンテンツの信頼レベルを表示するバッジコンポーネント。
 * HTML <details>/<summary> パターンでクリック時に説明文を展開表示する。
 * サーバーコンポーネントとして実装（"use client" 不要）。
 */
export default function TrustLevelBadge({ level, note }: TrustLevelBadgeProps) {
  const meta = TRUST_LEVEL_META[level];

  return (
    <div className={styles.wrapper}>
      <details className={styles.details}>
        <summary className={styles.summary}>
          <span className={`${styles.badge} ${styles[level]}`}>
            <span className={styles.icon} aria-hidden="true">
              {meta.icon}
            </span>
            {meta.label}
          </span>
        </summary>
        <span className={styles.description}>{meta.description}</span>
      </details>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  );
}
