import type { ReactNode, SyntheticEvent } from "react";
import styles from "./Accordion.module.css";

interface AccordionProps {
  /** 開閉の行に置くラベル。三角の右に本文の大きさで組む。 */
  summary: ReactNode;
  /** 開いたときに出る中身。 */
  children: ReactNode;
  /** 開いているか。渡すと onToggle と組んで開閉を親が持つ。 */
  open?: boolean;
  onToggle?: (event: SyntheticEvent<HTMLDetailsElement>) => void;
  className?: string;
  summaryClassName?: string;
}

/**
 * アコーディオン（DESIGN.md §6）。太い線で描く三角が、閉じているあいだは右を、開いているあいだは下を向く。
 *
 * `<details>`・`<summary>` で組み、開閉をキーボードと支援技術への伝わり方ごとブラウザの標準に任せる。
 * 縁が見えないコントロールなので、三角を並びの左端に揃え、その左右 8px を押せる範囲に含める
 * （data-text-box="inline"）。hover の線とフォーカスのリングは globals.css が summary に出す。
 */
export default function Accordion({
  summary,
  children,
  open,
  onToggle,
  className,
  summaryClassName,
}: AccordionProps) {
  return (
    <details
      className={[styles.accordion, className].filter(Boolean).join(" ")}
      open={open}
      onToggle={onToggle}
    >
      <summary
        className={[styles.summary, summaryClassName].filter(Boolean).join(" ")}
        data-text-box="inline"
      >
        <svg
          className={styles.triangle}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M1.5 3.5 11.5 10 1.5 16.5Z" />
        </svg>
        <span className={styles.label}>{summary}</span>
      </summary>
      {children}
    </details>
  );
}
