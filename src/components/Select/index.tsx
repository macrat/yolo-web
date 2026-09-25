import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import ChevronDown from "@/components/icons/ChevronDown";
import styles from "./Select.module.css";

type SelectProps = ComponentPropsWithoutRef<"select">;

/**
 * Select — セレクトボックスコンポーネント。
 *
 * 標準の `<select>` 要素を薄くラップしたコンポーネント。HTML 属性はすべて
 * 素の `<select>` に透過するため、振る舞いはネイティブ `<select>` と完全に同一。
 *
 * - **controlled / uncontrolled の両対応**: `value`（controlled）でも
 *   `defaultValue`（uncontrolled）でも使える。
 * - **children で option を受ける**: `<Select><option value="a">A</option></Select>`
 *   の形で使う。
 * - **forwardRef 対応**: ref が必要な場合は親から渡すことができる。
 *
 * デザイン:
 * - 入力欄の角丸は `--radius-sm`
 * - 影なし（DESIGN.md §5）
 *
 * @example
 * // controlled
 * <Select value={lang} onChange={(e) => setLang(e.target.value)}>
 *   <option value="ja">日本語</option>
 *   <option value="en">英語</option>
 * </Select>
 *
 * @example
 * // uncontrolled
 * <Select defaultValue="ja" name="language">
 *   <option value="ja">日本語</option>
 *   <option value="en">英語</option>
 * </Select>
 *
 * @example
 * // 幅を親に合わせたい場合は className で上書き
 * <Select className={styles.mySelect}>...</Select>
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...rest },
  ref,
) {
  const selectClassName = [styles.select, className].filter(Boolean).join(" ");

  return (
    <div className={styles.wrapper}>
      <select ref={ref} className={selectClassName} {...rest}>
        {children}
      </select>
      <span className={styles.icon} aria-hidden="true">
        <ChevronDown />
      </span>
    </div>
  );
});

export default Select;
