import { TRUST_LEVEL_META, type TrustLevel } from "@/lib/trust-levels";
import styles from "./TrustLevelBadge.module.css";

interface TrustLevelBadgeProps {
  /** 信頼レベル */
  level: TrustLevel;
  /** 補足注記テキスト（混在ケース用） */
  note?: string;
  /** details を展開状態で描画するか（storybook のサンプル表示用） */
  open?: boolean;
}

/**
 * コンテンツの信頼レベルを表示するバッジコンポーネント（新版）。
 * HTML <details>/<summary> パターンでクリック時に説明文を展開表示する。
 * サーバーコンポーネントとして実装（"use client" 不要）。
 *
 * 旧版（src/components/common/TrustLevelBadge）との差分:
 * - CSS 変数を新トークン（DESIGN.md §2）に置換
 * - アイコン枠を撤去（DESIGN.md §3「絵文字禁止・アイコン原則使わない」に従い
 *   curated/generated の絵文字と一貫性確保のため 3 種すべて撤去）
 * - <summary> の :focus-visible スタイルを追加（DESIGN.md §2）
 * - open prop を追加（storybook での展開状態サンプル表示用）
 */
export default function TrustLevelBadge({
  level,
  note,
  open,
}: TrustLevelBadgeProps) {
  const meta = TRUST_LEVEL_META[level];

  return (
    <div className={styles.wrapper}>
      <details className={styles.details} open={open}>
        <summary className={styles.summary}>
          <span className={`${styles.badge} ${styles[level]}`}>
            {meta.label}
          </span>
        </summary>
        <span className={styles.description}>{meta.description}</span>
      </details>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  );
}
