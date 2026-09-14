import type { ComponentPropsWithoutRef } from "react";
import styles from "./Input.module.css";

type InputType =
  "text" | "email" | "number" | "password" | "search" | "tel" | "url" | "date";

interface InputOwnProps {
  /** input の type 属性（デフォルト: "text"） */
  type?: InputType;
  /** エラー状態。true のとき border を --accent（朱）にして aria-invalid を付与 */
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
 *   password/search/tel/url/date の 8 種。
 * - **`error`**: true のとき border を `--accent`（朱・専用の danger トークンは無い）に変えてエラー表示にし、
 *   `aria-invalid="true"` を付与してスクリーンリーダーにも伝える。
 * - **`readOnly` と `disabled` の使い分け**: 判断の芯は「打てるように見せてよいか」。
 *   値を見せるだけで操作させない意図なら `readOnly`。見た目は通常の入力欄のままで、
 *   フォーカスもタブ移動もでき、フォーカスリングも出る。機能そのものが使えない状態
 *   なら `disabled`。フォーカスもタブ移動もできなくなり、支援技術にも無効として
 *   伝わる。ただし見た目はほとんど変わらない。地が `--paper` から `--paper-2` へ
 *   一段沈むだけで、ページの地との対比はライト 1.06:1・ダーク 1.08:1、枠線は同じ。
 *   入力済みの値は `--ink-2` に沈むので薄くなったと分かるが、値が空の欄では
 *   `cursor: not-allowed` 以外に見て取れる差がない。**使えない理由は欄の見た目に
 *   任せず、欄のそばに文字で置くこと。** どちらも `onChange` なしで React の
 *   controlled 警告は出ない（ネイティブ `<input>` と同じ）。
 *
 * デザイン:
 * - DESIGN.md §4: 入力欄は角丸 `--radius-sm` (2px) の例外を適用
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
 * // 値を見せるだけで編集させない（フォーカスはできる）
 * <Input value="表示専用" readOnly />
 *
 * @example
 * // 機能そのものが使えない（フォーカスもタブ移動もできない）
 * <Input value="表示専用" disabled />
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
