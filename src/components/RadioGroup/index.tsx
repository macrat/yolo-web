import { useId, type ReactNode } from "react";
import { renderPhrasedName } from "@/components/PhrasedText";
import Radio from "@/components/Radio";
import styles from "./RadioGroup.module.css";

export interface RadioGroupOption {
  /** 円の右に本文の大きさで組むラベル。区切りの並び（文字列の配列）を渡すと文節で折る（PhrasedText）。 */
  label: ReactNode | readonly string[];
  /** 選択肢を一意に識別する値。 */
  value: string;
}

interface RadioGroupProps {
  /**
   * 組の名前。選択肢の上に見出しとして見せ、読み上げでも組の名前になる。区切りの並び（文字列の配列）を渡すと
   * 文節で折る（PhrasedText）。
   */
  legend: ReactNode | readonly string[];
  options: RadioGroupOption[];
  /** 選ばれている選択肢の値。 */
  value: string;
  /** 選択肢が選ばれたときに、その値を受け取る。 */
  onChange: (value: string) => void;
  className?: string;
}

/**
 * ラジオボタンの組（DESIGN.md §5・§6）。`<fieldset>` の中に同じ `name` の Radio を並べる。
 *
 * 選択肢は押せる範囲を接して横に並べ、幅が足りなければ折り返す。本物の `<input type="radio">` なので、
 * 矢印キーで選択肢を移ると同時に選ばれ、Tab では組に一度だけ入る。
 *
 * @example
 * <RadioGroup
 *   legend="変換の向き"
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
      aria-labelledby={legendId}
      className={[styles.group, className].filter(Boolean).join(" ")}
    >
      <legend id={legendId} className={styles.legend}>
        {renderPhrasedName(legend)}
      </legend>
      <div className={styles.options}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={id}
            value={option.value}
            label={renderPhrasedName(option.label)}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}
