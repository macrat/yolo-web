import { useId, type ComponentPropsWithoutRef } from "react";
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
  /** ボタンに表示する内容 */
  children: React.ReactNode;
}

type ButtonProps = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ButtonOwnProps>;

const variantClassMap: Record<ButtonVariant, string> = {
  default: styles.variantDefault,
  primary: styles.variantPrimary,
};

/** ボタン（DESIGN.md §6）。見え方は Button.module.css が持つ。 */
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
      {...rest}
    >
      {children}
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
