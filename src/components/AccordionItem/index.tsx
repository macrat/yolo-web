import type { ReactNode } from "react";
import styles from "./AccordionItem.module.css";

interface AccordionItemProps {
  /** 折りたたみ見出し（summary に相当） */
  heading: string;
  /** 展開時に表示するコンテンツ */
  children: ReactNode;
  /** 初期状態で展開するか（デフォルト: false） */
  defaultOpen?: boolean;
  /** 追加クラス */
  className?: string;
}

/**
 * AccordionItem — 単一の折りたたみ可能なコンテンツ項目。
 *
 * `<details>/<summary>` ベースの薄いラッパー。
 * Q&A / 使い方説明 / その他コンテキストで汎用的に使えるプリミティブ。
 *
 * 設計:
 * - 責務: 1 項目の折りたたみ UI のみ。複数アイテム管理は呼び出し元の責務。
 * - Q./A. プレフィックス等の書式を強制しない汎用設計。
 * - DESIGN.md §3: アイコンには Lucide スタイルの線画を使用（summary の矢印のみ）
 */
function AccordionItem({
  heading,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const classes = [styles.details, className].filter(Boolean).join(" ");

  return (
    <details className={classes} open={defaultOpen}>
      <summary className={styles.summary}>
        <span className={styles.summaryText}>{heading}</span>
        {/* CSS で回転アニメーションするシェブロン */}
        <span className={styles.icon} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}

export default AccordionItem;
