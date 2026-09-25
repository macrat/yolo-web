import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import styles from "./ChoiceRow.module.css";

interface ChoiceRowOwnProps {
  type: "checkbox" | "radio";
  /** 行に置くラベル。形の右に本文の大きさで組む。 */
  label: ReactNode;
  /**
   * 無効のときに、なぜ選べないかを言う文（§6 無効）。disabled のときだけ、行の横に出して
   * 入力の説明として読ませる。
   */
  disabledReason?: string;
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
 * 無効の理由は、押せる範囲に含めないよう行の外に置く。
 */
export default function ChoiceRow({
  type,
  label,
  disabledReason,
  className,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: ChoiceRowProps) {
  const reasonId = useId();
  const showReason = Boolean(disabled && disabledReason);
  const describedBy =
    [ariaDescribedBy, showReason ? reasonId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  const row = (
    <label
      className={[styles.row, className].filter(Boolean).join(" ")}
      data-text-box="inline"
    >
      <input
        type={type}
        className={styles.input}
        disabled={disabled}
        aria-describedby={describedBy}
        {...rest}
      />
      <span
        className={`${styles.mark} ${type === "radio" ? styles.radio : ""}`}
        aria-hidden="true"
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
  if (disabledReason === undefined) return row;
  // 無効と有効が切り替わっても入力の要素を作り直さないよう、理由を持つ行はいつも包む。
  return (
    <span className={styles.withReason}>
      {row}
      {showReason && (
        <span id={reasonId} className={styles.reason}>
          {disabledReason}
        </span>
      )}
    </span>
  );
}
