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
 * 標準の `<input>` 要素を薄くラップしたコンポーネント。`type` と `error` を
 * 除く HTML 属性はすべて素の `<input>` に透過するため、振る舞いはネイティブ
 * `<input>` と完全に同一。
 *
 * - **controlled / uncontrolled の両対応**: `value`（controlled）でも
 *   `defaultValue`（uncontrolled）でも使える。両方を同時に指定した場合は
 *   React 標準の挙動どおり `value` が優先され、開発モードでは警告が出る
 *   ので、どちらか一方を選んで使うこと。
 * - **`type`**: デフォルト `"text"`。サポートする値は text/email/number/
 *   password/search/tel/url の 7 種。
 * - **`error`**: true のとき border を `--danger` に変えてエラー表示にし、
 *   `aria-invalid="true"` を付与してスクリーンリーダーにも伝える。
 * - **読み取り専用**: `readOnly` または `disabled` を渡すと、`onChange`
 *   なしでも React の controlled 警告は出ない（ネイティブ `<input>` と同じ）。
 *
 * デザイン:
 * - DESIGN.md §5: インタラクティブ要素には `--r-interactive` を使う
 * - DESIGN.md §2: フォーカスは `outline: 2px solid var(--accent); outline-offset: 2px;`
 *
 * @example
 * // controlled
 * <Input value={text} onChange={(e) => setText(e.target.value)} />
 *
 * @example
 * // uncontrolled
 * <Input defaultValue="初期値" name="title" />
 *
 * @example
 * // 読み取り専用（onChange 不要）
 * <Input value="表示専用" readOnly />
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
