import type { ReactNode } from "react";
import styles from "./ErrorMessage.module.css";

/** props 未指定・空文字のときに表示する既定の日本語フォールバック文言。
 * 各ツールが個別文言を渡さなくても英語生エラーが露出しないようにする（M-4）。 */
const DEFAULT_MESSAGE = "エラーが発生しました。入力内容を確認してください。";

interface ErrorMessageProps {
  /** 表示するエラー文言。未指定・空文字の場合は既定の日本語フォールバックを表示。 */
  message?: string;
  /** message の代替として JSX を渡せる。children が優先される。未指定・空の場合は既定フォールバックを使用。 */
  children?: ReactNode;
}

/**
 * ErrorMessage — エラー表示の単一窓口。
 *
 * - `role="alert"` によりスクリーンリーダーが即読み上げる（ARIA assertive の暗黙付与）。
 *   `aria-live` は role=alert が暗黙的に assertive を指定するため二重指定しない。
 * - `children` または `message` でエラー文言を渡す。`children` が優先される。
 * - 未指定・空文字の場合は内蔵の既定日本語フォールバック文言を表示し、
 *   英語生エラーが来訪者に露出することを防ぐ（M-4）。
 *
 * デザイン:
 * - DESIGN.md §2: `--paper-2` 背景 + `--rule` ボーダー、文字色は `--accent` の作法
 * - DESIGN.md §5: `--radius` (0px) — インタラクティブ要素ではないため
 *
 * @example
 * // 既定フォールバック（ツールが文言を渡さなくても日本語が出る）
 * <ErrorMessage />
 *
 * @example
 * // 文言指定
 * <ErrorMessage message="ファイル形式が正しくありません。" />
 *
 * @example
 * // JSX を渡す
 * <ErrorMessage>変換に失敗しました。<a href="/help">ヘルプ</a>を参照してください。</ErrorMessage>
 */
function ErrorMessage({ message, children }: ErrorMessageProps) {
  // children が優先。children も message もないか空の場合は既定フォールバックを使用。
  const content =
    children !== undefined && children !== "" && children !== null
      ? children
      : message || DEFAULT_MESSAGE;

  return (
    <p role="alert" className={styles.errorMessage}>
      {content}
    </p>
  );
}

export default ErrorMessage;
