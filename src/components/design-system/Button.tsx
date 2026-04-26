/**
 * Button — 操作可能な汎用ボタン
 *
 * ## 使う場面
 * - フォームの送信（type="submit"）
 * - アクション実行（削除・保存・キャンセル等）
 * - ページ遷移を伴わない操作のトリガー
 *
 * ## 使わない場面
 * - ページ遷移が目的の場合 → Next.js の `<Link>` を使う
 * - テキストリンク的な用途 → `<a>` タグを使う
 *
 * ## variant の選び方
 * - `primary`  : 1 画面に 1 つ。最も重要なアクション（フォーム送信など）
 * - `ghost`    : 補助的なアクション。cancel・戻るなど主役の隣に置く
 * - `danger`   : 取り消しできない破壊的操作（削除・リセット等）にのみ使う
 *
 * ## スタイルの根拠
 * - hover は明度差のみで表現（philosophy.md NEVER 節: opacity/scale 変化は使わない）
 * - フォーカスリングは `--accent` の 2px outline（philosophy.md 規約）
 * - shadow は `--elev-button` のみ使用（ダイアログ・カードには影を使わない）
 * - CSS 変数はすべて globals.css の新変数群のみ参照（`--color-*` 旧変数は参照しない）
 */

import styles from "./Button.module.css";

/** ボタンの視覚的役割。自由文字列では開放しない。 */
type ButtonVariant = "primary" | "ghost" | "danger";

/** ボタンのサイズ。自由文字列では開放しない。 */
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  /** ボタンの視覚的役割。省略時は "primary"。 */
  variant?: ButtonVariant;
  /** ボタンのサイズ。省略時は "md"。 */
  size?: ButtonSize;
  /** true のとき操作不能・視覚的に無効化。disabled と loading は排他的に扱う。 */
  disabled?: boolean;
  /**
   * true のときローディング中。ボタンは無効化され aria-busy="true" が付与される。
   * ローディング中はスピナーが表示され、子要素は視覚的に隠れる（aria-hidden）。
   */
  loading?: boolean;
  /** true のとき幅 100% で表示。フォーム内の縦並びボタン等に使う。 */
  fullWidth?: boolean;
  /** ボタンのタイプ。省略時は "button"（フォーム誤送信防止のためデフォルトは button）。 */
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  /** スクリーンリーダー向けの追加ラベル（children が SVG アイコンのみの場合等） */
  "aria-label"?: string;
  className?: string;
}

/**
 * ローディング中に表示するスピナー（SVG、aria-hidden で読み飛ばし）
 */
function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className={styles.spinner}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="12"
      />
    </svg>
  );
}

/**
 * Button コンポーネント本体
 * @see ButtonProps
 */
export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
  onClick,
  children,
  "aria-label": ariaLabel,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(" ")}
      disabled={isDisabled}
      aria-busy={loading ? "true" : undefined}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth ? "true" : undefined}
      aria-label={ariaLabel}
      onClick={isDisabled ? undefined : onClick}
    >
      {loading && <Spinner />}
      <span className={loading ? styles.labelHidden : undefined}>
        {children}
      </span>
    </button>
  );
}
