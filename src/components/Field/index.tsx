import { useId, type ReactNode } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import PhrasedText, {
  renderPhrasedName,
  type PhrasedName,
} from "@/components/PhrasedText";
import styles from "./Field.module.css";

/** Field が中の入力欄に渡す属性。そのまま Input・Select・Textarea に広げる。 */
export interface FieldControlProps {
  id: string;
  error: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: true;
}

/**
 * 欄の名前（何を書く欄・選ぶ欄かを言う文）と必須の印。名前は欄の上に置き、文字列と区切りの並び（文字列の配列）は
 * 見出しと同じく文節で折る（PhrasedText）。必須の欄は「（必須）」を名前の後ろの1つの文節として添える（§8）ので、
 * 名前を字か区切りの並びで渡す。
 */
type FieldLabelProps =
  | { label: PhrasedName; required?: boolean }
  | { label: ReactNode; required?: false };

type FieldProps = FieldLabelProps & {
  /** 何が問題でどう直すかを言う文。あるあいだ、欄を太い線で囲み、この文を欄の直下に置く（§8）。 */
  error?: string;
  /** 無効のとき true。欄に disabled を渡す。 */
  disabled?: boolean;
  /**
   * 無効のときに、なぜ使えないかを言う文（§6 無効）。disabled のときだけ、欄の直下に出して
   * 欄の説明として読ませる。
   */
  disabledReason?: string;
  /** 欄に渡す属性を受け取り、欄を返す。 */
  children: (control: FieldControlProps) => ReactNode;
  className?: string;
};

const REQUIRED = "（必須）";

/**
 * 入力欄とそのラベル・エラーの理由・無効の理由の組（DESIGN.md §5・§6・§8）。ラベルは行を分けて欄の上に置き、
 * 理由の文は欄の直下に置いて、欄の説明として読ませる。欄を無効にするときは、理由を添えられるよう
 * 欄ではなく Field に disabled を渡す。
 *
 * @example
 * <Field label="生年月日" required error={error}>
 *   {(control) => <Input {...control} type="date" value={v} onChange={onChange} />}
 * </Field>
 */
function Field({
  label,
  required,
  error,
  disabled,
  disabledReason,
  children,
  className,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const reasonId = `${id}-disabled-reason`;
  const showReason = Boolean(disabled && disabledReason);
  const describedBy =
    [error ? errorId : undefined, showReason ? reasonId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={styles.label}>
        {required ? (
          <PhrasedText
            as="span"
            phrases={[
              ...(typeof label === "string" ? [label] : label),
              REQUIRED,
            ]}
          />
        ) : (
          renderPhrasedName(label)
        )}
      </label>
      {children({
        id,
        error: Boolean(error),
        disabled: disabled || undefined,
        "aria-describedby": describedBy,
        "aria-required": required ? true : undefined,
      })}
      {error && <ErrorMessage id={errorId} message={error} />}
      {showReason && (
        <p id={reasonId} className={styles.reason}>
          {disabledReason}
        </p>
      )}
    </div>
  );
}

export default Field;
