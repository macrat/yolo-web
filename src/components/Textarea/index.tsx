import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./Textarea.module.css";

/** font バリアント: "default" = システムフォント（通常テキスト）, "mono" = 等幅（コード・技術系） */
type TextareaVariant = "default" | "mono";

interface TextareaOwnProps {
  /**
   * font バリアント（デフォルト: "default"）
   * - "default": システムフォントを継承（通常テキスト用）
   * - "mono": 等幅フォント（コード・技術系テキスト用）
   */
  variant?: TextareaVariant;
}

type TextareaProps = TextareaOwnProps &
  Omit<ComponentPropsWithoutRef<"textarea">, keyof TextareaOwnProps>;

/**
 * Textarea — テキストエリアコンポーネント。
 *
 * 標準の `<textarea>` 要素を薄くラップしたコンポーネント。`variant` を除く
 * HTML 属性はすべて素の `<textarea>` に透過するため、振る舞いはネイティブ
 * `<textarea>` と完全に同一。
 *
 * - **controlled / uncontrolled の両対応**: `value`（controlled）でも
 *   `defaultValue`（uncontrolled）でも使える。
 * - **readOnly 出力用**: `readOnly` を渡すと読み取り専用の出力欄として使える。
 *   多くのツールが入力欄と並べて出力を表示するパターンで使用する。
 * - **rows**: デフォルトはブラウザ依存（通常 2 行）。必要に応じて指定する。
 * - **spellCheck**: 呼び出し側で `spellCheck={false}` を指定することで無効化できる。
 * - **variant**: "default"（システムフォント継承）または "mono"（等幅フォント）。
 *   コード・技術系テキストには "mono" を使う。デフォルトは "default"。
 *
 * デザイン:
 * - DESIGN.md §5: インタラクティブ要素には `--r-interactive` を使う
 * - DESIGN.md §2: フォーカスは `outline: 2px solid var(--accent); outline-offset: 2px;`
 * - DESIGN.md §3: 行間は原則 1.7
 * - 影なし（DESIGN.md §4 パネルには影をつけない・フォーム要素も同様）
 * - resize: vertical（垂直方向のリサイズを許容）
 *
 * @example
 * // 入力用（controlled）
 * <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} />
 *
 * @example
 * // 出力用（readOnly）
 * <Textarea value={result} readOnly rows={6} />
 *
 * @example
 * // コード系（等幅フォント）
 * <Textarea variant="mono" value={code} rows={10} spellCheck={false} />
 *
 * @example
 * // uncontrolled
 * <Textarea defaultValue="初期テキスト" name="body" />
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ variant = "default", className, ...rest }, ref) {
    const classNames = [
      styles.textarea,
      variant === "mono" && styles.mono,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <textarea ref={ref} className={classNames} {...rest} />;
  },
);

export default Textarea;
