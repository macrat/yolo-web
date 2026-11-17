import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./Textarea.module.css";

/** 書体: "default" は本文の書体、"mono" はコードを書く欄の等幅。 */
type TextareaVariant = "default" | "mono";

interface TextareaOwnProps {
  /** 書体（既定: "default"） */
  variant?: TextareaVariant;
  /** エラーのとき true。太い線で囲み、aria-invalid で支援技術にも伝える（§8）。 */
  error?: boolean;
}

type TextareaProps = TextareaOwnProps &
  Omit<ComponentPropsWithoutRef<"textarea">, keyof TextareaOwnProps>;

/**
 * 複数行の書き込む欄（DESIGN.md §8）。枠・エラー・無効・フォーカスの見え方は globals.css の
 * [data-field] が持つ。ラベルと、エラーの理由の文は Field が付ける。
 *
 * `variant` と `error` を除く属性は、そのまま `<textarea>` に渡る。
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { variant = "default", error = false, className, ...rest },
    ref,
  ) {
    const classNames = [
      styles.textarea,
      variant === "mono" && styles.mono,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <textarea
        ref={ref}
        className={classNames}
        data-field=""
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    );
  },
);

export default Textarea;
