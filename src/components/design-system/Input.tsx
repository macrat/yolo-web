/**
 * Input — テキスト系の一行入力フィールド
 *
 * ## 使う場面
 * - 名前・メールアドレス・URL・パスワード等の一行入力
 * - 検索ボックス（type="search"）
 * - 数値入力（type="number"）
 *
 * ## 使わない場面
 * - 複数行のテキスト入力 → `Textarea` を使う
 * - 選択肢から選ぶ入力 → `Select` を使う
 * - チェックボックス・ラジオ → `Checkbox` を使う
 *
 * ## アクセシビリティの根拠
 * - label は常に必須（スクリーンリーダーが入力欄の用途を読み上げるため）
 * - error がある場合は aria-invalid="true" + aria-describedby でエラー文と紐づける
 * - hint がある場合は aria-describedby でヒント文と紐づける（error がある場合は error 優先）
 *
 * ## スタイルの根拠
 * - フォーカスリングは --accent の 2px outline（philosophy.md 規約）
 * - border は --border（明度差のみ）。hover で border 色を変えない（NEVER 節）
 * - CSS 変数はすべて globals.css の新変数群のみ参照（`--color-*` 旧変数は参照しない）
 */

import { useId } from "react";
import styles from "./Input.module.css";

/** テキスト入力のサイズ。自由文字列では開放しない。 */
type InputSize = "sm" | "md" | "lg";

interface InputProps {
  /** ラベルテキスト（必須。非表示にする場合は `hideLabel` を使う）。 */
  label: string;
  /**
   * true のときラベルを視覚的に隠す（スクリーンリーダーには読まれる）。
   * placeholder のみで目的が伝わる検索ボックス等にのみ使う。
   */
  hideLabel?: boolean;
  /** 入力フィールドのサイズ。省略時は "md"。 */
  size?: InputSize;
  /** プレースホルダー文字列。ラベルの代替としては使わない。 */
  placeholder?: string;
  /** ヒントテキスト。入力形式の補足説明等。error がある場合は非表示になる。 */
  hint?: string;
  /** エラーメッセージ。存在する場合 aria-invalid="true" が付与される。 */
  error?: string;
  /** input の type 属性。省略時は "text"。 */
  type?: "text" | "email" | "password" | "search" | "url" | "tel" | "number";
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  name?: string;
  readOnly?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  /** input 要素へのフォールバック id。省略時は useId で自動生成。 */
  id?: string;
  className?: string;
}

/**
 * Input コンポーネント本体
 * @see InputProps
 */
export default function Input({
  label,
  hideLabel = false,
  size = "md",
  placeholder,
  hint,
  error,
  type = "text",
  value,
  defaultValue,
  disabled = false,
  required = false,
  autoComplete,
  autoFocus,
  maxLength,
  minLength,
  name,
  readOnly = false,
  onChange,
  onBlur,
  onFocus,
  id: idProp,
  className,
}: InputProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const descId = `${inputId}-desc`;

  // aria-describedby: error があれば error メッセージ、なければ hint を参照
  const descText = error ?? hint;
  const ariaDescribedBy = descText ? descId : undefined;

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      data-size={size}
    >
      <label
        htmlFor={inputId}
        className={hideLabel ? styles.labelHidden : styles.label}
      >
        {label}
        {required && (
          <span aria-hidden="true" className={styles.required}>
            {" "}
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        type={type}
        className={[styles.input, error ? styles.inputError : null]
          .filter(Boolean)
          .join(" ")}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        maxLength={maxLength}
        minLength={minLength}
        name={name}
        readOnly={readOnly}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={ariaDescribedBy}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {descText && (
        <span
          id={descId}
          className={error ? styles.errorText : styles.hintText}
          role={error ? "alert" : undefined}
        >
          {descText}
        </span>
      )}
    </div>
  );
}
