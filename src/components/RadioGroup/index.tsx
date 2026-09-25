import { useId, type ReactNode } from "react";
import Radio from "@/components/Radio";
import styles from "./RadioGroup.module.css";

export interface RadioGroupOption {
  /** 円の右に本文の大きさで組むラベル。 */
  label: ReactNode;
  /** 選択肢を一意に識別する値。 */
  value: string;
}

interface RadioGroupBaseProps {
  options: RadioGroupOption[];
  /** 選ばれている選択肢の値。 */
  value: string;
  /** 選択肢が選ばれたときに、その値を受け取る。 */
  onChange: (value: string) => void;
  className?: string;
}

/**
 * 組の名前は、見出しとして見せる（legend）か、周りの文で分かるときだけ読み上げ用に持たせる（aria-label）。
 * どちらか一方を必ず持つ。
 */
type RadioGroupProps = RadioGroupBaseProps &
  (
    | { legend: ReactNode; "aria-label"?: never }
    | { legend?: never; "aria-label": string }
  );

/**
 * ラジオボタンの組（DESIGN.md §5・§6）。`<fieldset>` の中に同じ `name` の Radio を並べる。
 *
 * 選択肢は押せる範囲を接して横に並べ、幅が足りなければ折り返す。本物の `<input type="radio">` なので、
 * 矢印キーで選択肢を移ると同時に選ばれ、Tab では組に一度だけ入る。
 *
 * @example
 * <RadioGroup
 *   legend="変換モード"
 *   options={[
 *     { label: "エンコード", value: "encode" },
 *     { label: "デコード", value: "decode" },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 * />
 */
export default function RadioGroup({
  legend,
  "aria-label": ariaLabel,
  options,
  value,
  onChange,
  className,
}: RadioGroupProps) {
  const id = useId();
  const legendId = `${id}-legend`;
  return (
    <fieldset
      // fieldset の既定の役割は group なので、ラジオボタンの組であることを読み上げに伝える。
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={legend === undefined ? undefined : legendId}
      className={[styles.group, className].filter(Boolean).join(" ")}
    >
      {legend !== undefined && (
        <legend id={legendId} className={styles.legend}>
          {legend}
        </legend>
      )}
      <div className={styles.options}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={id}
            value={option.value}
            label={option.label}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}
