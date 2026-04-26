/**
 * Textarea — 複数行テキスト入力フィールド
 *
 * ## 使う場面
 * - 複数行の自由記述（コメント・本文・説明文等）
 * - 貼り付け操作が主体の長文入力（文字数カウントのような用途）
 *
 * ## 使わない場面
 * - 一行の入力 → `Input` を使う
 * - 選択肢から選ぶ入力 → `Select` を使う
 * - コードエディタの用途 → 専用のエディタコンポーネントを使う
 *
 * ## アクセシビリティの根拠
 * - label は常に必須（スクリーンリーダーが入力欄の用途を読み上げるため）
 * - error がある場合は aria-invalid="true" + aria-describedby でエラー文と紐づける
 *
 * ## スタイルの根拠
 * - フォーカスリングは --accent の 2px outline（philosophy.md 規約）
 * - border は --border。hover で border 色を変えない（NEVER 節）
 * - resize は vertical のみ許可（horizontal resize は崩れの原因になる）
 * - CSS 変数はすべて globals.css の新変数群のみ参照（`--color-*` 旧変数は参照しない）
 */

import { useId } from "react";
import styles from "./Textarea.module.css";

interface TextareaProps {
  /** ラベルテキスト（必須）。 */
  label: string;
  /**
   * true のときラベルを視覚的に隠す（スクリーンリーダーには読まれる）。
   * placeholder のみで目的が伝わる場合にのみ使う。
   */
  hideLabel?: boolean;
  /** プレースホルダー文字列。ラベルの代替としては使わない。 */
  placeholder?: string;
  /** ヒントテキスト。入力形式の補足説明等。error がある場合は非表示になる。 */
  hint?: string;
  /** エラーメッセージ。存在する場合 aria-invalid="true" が付与される。 */
  error?: string;
  /** 初期の表示行数。省略時は 4。 */
  rows?: number;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  name?: string;
  readOnly?: boolean;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** textarea 要素へのフォールバック id。省略時は useId で自動生成。 */
  id?: string;
  className?: string;
}

/**
 * Textarea コンポーネント本体
 * @see TextareaProps
 */
export default function Textarea({
  label,
  hideLabel = false,
  placeholder,
  hint,
  error,
  rows = 4,
  value,
  defaultValue,
  disabled = false,
  required = false,
  maxLength,
  name,
  readOnly = false,
  onChange,
  onBlur,
  onFocus,
  id: idProp,
  className,
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = idProp ?? generatedId;
  const descId = `${textareaId}-desc`;

  const descText = error ?? hint;
  const ariaDescribedBy = descText ? descId : undefined;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <label
        htmlFor={textareaId}
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
      <textarea
        id={textareaId}
        className={[styles.textarea, error ? styles.textareaError : null]
          .filter(Boolean)
          .join(" ")}
        rows={rows}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
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
