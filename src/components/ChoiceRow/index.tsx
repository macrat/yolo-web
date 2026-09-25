import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./ChoiceRow.module.css";

interface ChoiceRowOwnProps {
  type: "checkbox" | "radio";
  /** 行に置くラベル。形の右に本文の大きさで組む。 */
  label: ReactNode;
}

export type ChoiceRowProps = ChoiceRowOwnProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof ChoiceRowOwnProps | "children">;

/**
 * ラジオボタン・チェックボックスの行（DESIGN.md §5・§6）。Checkbox と Radio が使う。
 *
 * 行全体を `<label>` にして、ラベルを含む行全体を押せる範囲にする。本物の `<input>` は見えないまま
 * 行の中に残し、クリック・キーボード・支援技術への状態の伝わり方をブラウザの標準に任せる。
 * 縁が見えないコントロールなので、円・四角を並びの左端に揃え、その左右 8px を押せる範囲に含める
 * （data-text-box="inline"）。hover の線とフォーカスのリングは globals.css が行に出す。
 */
export default function ChoiceRow({
  type,
  label,
  className,
  ...rest
}: ChoiceRowProps) {
  return (
    <label
      className={[styles.row, className].filter(Boolean).join(" ")}
      data-text-box="inline"
    >
      <input type={type} className={styles.input} {...rest} />
      <span
        className={`${styles.mark} ${type === "radio" ? styles.radio : ""}`}
        aria-hidden="true"
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
}
