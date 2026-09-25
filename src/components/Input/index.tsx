import type { ComponentPropsWithoutRef } from "react";

type InputType =
  "text" | "email" | "number" | "password" | "search" | "tel" | "url" | "date";

interface InputOwnProps {
  /** input の type 属性（既定: "text"） */
  type?: InputType;
  /** エラーのとき true。太い線で囲み、aria-invalid で支援技術にも伝える（§8）。 */
  error?: boolean;
}

type InputProps = InputOwnProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof InputOwnProps>;

/**
 * 書き込む欄（DESIGN.md §8）。見え方は globals.css の [data-field] が持つ。
 * ラベルと、エラーの理由の文は Field が付ける。
 *
 * `type` と `error` を除く属性は、そのまま `<input>` に渡る。
 */
function Input({ type = "text", error = false, ...rest }: InputProps) {
  return (
    <input
      type={type}
      data-field=""
      aria-invalid={error ? true : undefined}
      {...rest}
    />
  );
}

export default Input;
