import type { ComponentPropsWithoutRef } from "react";
import styles from "./Input.module.css";

type InputType =
  | "text"
  | "email"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "url";

interface InputOwnProps {
  /** input の type 属性（デフォルト: "text"） */
  type?: InputType;
  /** エラー状態。true のとき border を --danger にして aria-invalid を付与 */
  error?: boolean;
}

type InputProps = InputOwnProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof InputOwnProps>;

/**
 * Input — テキスト入力コンポーネント。
 *
 * DESIGN.md §5: インタラクティブ要素には --r-interactive を使う。
 * DESIGN.md §2: フォーカスは outline: 2px solid var(--accent); outline-offset: 2px;
 * error prop が true のとき border を --danger に変えてエラーを示し、
 * aria-invalid="true" を付与してスクリーンリーダーにも伝える。
 */
function Input({
  type = "text",
  error = false,
  className,
  ...rest
}: InputProps) {
  const classNames = [styles.input, error && styles.error, className]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      type={type}
      className={classNames}
      aria-invalid={error ? true : undefined}
      {...rest}
    />
  );
}

export default Input;
