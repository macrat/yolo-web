import type { ReactNode } from "react";
import styles from "./ErrorMessage.module.css";

/** 文言が渡らなかったときに出す文。英語の生のエラーを来訪者に見せないため、既定を日本語で持つ。 */
const DEFAULT_MESSAGE = "エラーが発生しました。入力内容を確認してください。";

interface ErrorMessageProps {
  /** 何が問題でどう直すかを言う文。未指定・空文字なら既定の文を出す。 */
  message?: string;
  /** message の代わりに渡す内容。children を優先する。 */
  children?: ReactNode;
  /** 入力欄の aria-describedby から、この文を欄の説明として指すための id。 */
  id?: string;
}

/**
 * エラーの理由を言う文（DESIGN.md §8）。色では示さず、文字で書く。
 *
 * role="alert" で、現れたときにスクリーンリーダーが読み上げる。role="alert" は aria-live の
 * assertive を含むので、aria-live は重ねない。
 */
function ErrorMessage({ message, children, id }: ErrorMessageProps) {
  const content =
    children !== undefined && children !== "" && children !== null
      ? children
      : message || DEFAULT_MESSAGE;

  return (
    <p role="alert" id={id} className={styles.errorMessage}>
      {content}
    </p>
  );
}

export default ErrorMessage;
