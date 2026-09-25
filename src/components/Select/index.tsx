import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import ChevronDown from "@/components/icons/ChevronDown";
import styles from "./Select.module.css";

interface SelectOwnProps {
  /** エラーのとき true。太い線で囲み、aria-invalid で支援技術にも伝える（§8）。 */
  error?: boolean;
}

type SelectProps = SelectOwnProps &
  Omit<ComponentPropsWithoutRef<"select">, keyof SelectOwnProps>;

/**
 * 選ぶ欄（DESIGN.md §8）。枠・エラー・無効・フォーカスの見え方は globals.css の [data-field] が持ち、
 * 開いたときの候補は同じ細い線の中に並ぶ。ラベルと、エラーの理由の文は Field が付ける。
 *
 * 候補は children の `<option>` で渡す。`error` を除く属性は、そのまま `<select>` に渡る。
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { error = false, className, children, ...rest },
  ref,
) {
  const selectClassName = [styles.select, className].filter(Boolean).join(" ");

  return (
    <div className={styles.wrapper}>
      <select
        ref={ref}
        className={selectClassName}
        data-field=""
        aria-invalid={error ? true : undefined}
        {...rest}
      >
        {children}
      </select>
      <span className={styles.icon} aria-hidden="true">
        <ChevronDown />
      </span>
    </div>
  );
});

export default Select;
