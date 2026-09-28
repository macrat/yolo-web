import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import PhrasedText from "@/components/PhrasedText";
import styles from "./Button.module.css";

/**
 * ボタンの種類（DESIGN.md §6）。どちらも、押すとそのページで何かが実行されるものに使う。
 * - "primary": プライマリボタン。反転で示す。1ページに1つまで。
 * - "default": プライマリでないボタン。下線で示す。
 * その場で状態を変えるもの（選ぶ・開閉する）は、ボタンではなくラジオボタン・チェックボックス・
 * アコーディオンで組む。
 */
type ButtonVariant = "primary" | "default";

interface ButtonOwnProps {
  /** ボタンの種類（既定: "default"） */
  variant?: ButtonVariant;
  /**
   * 無効のときに、なぜ押せないかを言う文（§6 無効）。disabled のときだけ、ボタンの横に出して
   * ボタンの説明として読ませる。
   */
  disabledReason?: string;
  /**
   * ボタンの面。字だけの面（「計算」「{n}件を表示」）は1つの文節として、見出しと同じく語の中で折らずに組む
   * （PhrasedText）。要素を含む面は、その要素が折り方を持つ。
   */
  children: ReactNode;
}

type ButtonProps = ButtonOwnProps &
  Omit<ComponentPropsWithRef<"button">, keyof ButtonOwnProps>;

/** 面が字だけなら、その字を1続きの文にしたもの。JSX で字と値を並べた面（配列）も1つの文にする。 */
function faceText(children: ReactNode): string | undefined {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (
    Array.isArray(children) &&
    children.every(
      (child) => typeof child === "string" || typeof child === "number",
    )
  ) {
    return children.join("");
  }
  return undefined;
}

const variantClassMap: Record<ButtonVariant, string> = {
  default: styles.variantDefault,
  primary: styles.variantPrimary,
};

/**
 * ボタン（DESIGN.md §6）。見え方は Button.module.css が持つ。ref は button 要素に渡るので、呼び出し側が
 * フォーカスを移せる。
 */
function Button({
  variant = "default",
  disabledReason,
  children,
  className,
  disabled,
  onClick,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: ButtonProps) {
  const reasonId = useId();
  const text = faceText(children);
  const showReason = Boolean(disabled && disabledReason);

  const classes = [styles.button, variantClassMap[variant], className]
    .filter(Boolean)
    .join(" ");

  /**
   * disabled 時に onClick を呼ばないようにラップする。
   * <button disabled> は natively click を防ぐが、
   * fireEvent などのテスト環境では disabled でも click イベントが発火するため
   * 明示的にガードする。
   */
  function handleClick(e: React.MouseEvent<HTMLButtonElement>): void {
    if (disabled) return;
    onClick?.(e);
  }

  const describedBy =
    [ariaDescribedBy, showReason ? reasonId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  const button = (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      onClick={handleClick}
      aria-describedby={describedBy}
      /* data 属性で種類を公開し、テストから検証可能にする */
      data-variant={variant}
      /* プライマリでないボタンは縁が見えないので、字を並びの左端に置く箱で組む（§5）。 */
      data-text-box={variant === "default" ? "inline" : undefined}
      /* プライマリボタンは反転の地で示し、hover の線とフォーカスのリングもその地に合わせる（§6）。 */
      data-inverted={variant === "primary" ? "" : undefined}
      {...rest}
    >
      {text === undefined ? (
        children
      ) : (
        <PhrasedText as="span" phrases={[text]} />
      )}
    </button>
  );

  if (disabledReason === undefined) return button;

  // 無効と有効が切り替わってもボタンの要素を作り直さないよう、理由を持つボタンはいつも包む。
  return (
    <span className={styles.withReason}>
      {button}
      {showReason && (
        <span id={reasonId} className={styles.reason}>
          {disabledReason}
        </span>
      )}
    </span>
  );
}

export default Button;
