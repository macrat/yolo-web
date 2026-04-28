import type { ComponentPropsWithoutRef } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "default" | "ghost";
type ButtonSize = "default" | "small";

interface ButtonOwnProps {
  /** ボタンの見た目バリアント（デフォルト: "default"） */
  variant?: ButtonVariant;
  /** ボタンのサイズ（デフォルト: "default"） */
  size?: ButtonSize;
  /** ボタンに表示する内容 */
  children: React.ReactNode;
}

type ButtonProps = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ButtonOwnProps>;

/** variant → CSS クラス のマッピング */
const variantClassMap: Record<ButtonVariant, string> = {
  default: styles.variantDefault,
  primary: styles.variantPrimary,
  ghost: styles.variantGhost,
};

/** size → CSS クラス のマッピング */
const sizeClassMap: Record<ButtonSize, string | undefined> = {
  default: undefined, // ベーススタイル (.button) で定義済み
  small: styles.sizeSmall,
};

/**
 * Button — クリック操作のボタン。
 *
 * DESIGN.md §5: ボタンやフォームなどの UI コンポーネントは src/components/ のものを使う。
 * DESIGN.md §5: border-radius は var(--r-interactive)、shadow は var(--shadow-button) を使う。
 */
function Button({
  variant = "default",
  size = "default",
  children,
  className,
  disabled,
  onClick,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    variantClassMap[variant],
    sizeClassMap[size],
    className,
  ]
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

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      onClick={handleClick}
      /* data 属性でバリアント/サイズを公開し、テストから検証可能にする */
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
