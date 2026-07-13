import styles from "./SegmentedControl.module.css";

interface SegmentedControlOption {
  /** 選択肢の表示ラベル */
  label: React.ReactNode;
  /** 選択肢を一意に識別する値 */
  value: string;
}

interface SegmentedControlProps {
  /** 選択肢の配列 */
  options: SegmentedControlOption[];
  /** 現在選択されている値（制御コンポーネント） */
  value: string;
  /** 値が変化したときのコールバック */
  onChange: (value: string) => void;
  /** radiogroup のアクセシブル名。aria-label または aria-labelledby のいずれかが必須。 */
  "aria-label"?: string;
  /** radiogroup のアクセシブル名の参照先 ID */
  "aria-labelledby"?: string;
  /** 追加の className */
  className?: string;
}

/**
 * SegmentedControl — radiogroup 型のモード切替コンポーネント。
 *
 * WAI-ARIA radiogroup パターンに完全準拠:
 * - コンテナ: role="radiogroup"（aria-label か aria-labelledby が必須）
 * - 各選択肢: role="radio" + aria-checked
 * - ロービング tabindex: 選択中のみ tabindex=0、他は tabindex=-1
 * - キーボード: ←→↑↓ で選択移動（端で折り返し）、Enter/Space で確定
 *
 * デザイン (DESIGN.md):
 * - 選択中塗り: --accent-weak 背景 + --accent 文字・枠（状態ハイライトとして gate 許容）。
 *   --accent をベタ塗りの地には使わない（①-16 を部品レベルで根絶）。
 * - フォーカス: outline: 2px solid var(--accent); outline-offset: 2px;
 * - 角丸: --radius（0px 基調・操作可能要素だが値札/入力欄の例外には当たらない）
 *
 * @example
 * <SegmentedControl
 *   options={[
 *     { label: "削除", value: "remove" },
 *     { label: "スペースに置換", value: "replace-space" },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 *   aria-label="改行処理モード"
 * />
 */
function SegmentedControl({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
}: SegmentedControlProps) {
  /**
   * キーボード操作ハンドラ。
   * ロービング tabindex パターンでは矢印キーでフォーカスを移動しながら選択を変更する。
   */
  function handleKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void {
    const length = options.length;
    let nextIndex: number | null = null;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + length) % length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = length - 1;
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(options[index].value);
      return;
    }

    if (nextIndex !== null) {
      onChange(options[nextIndex].value);
      // ロービング tabindex: DOM 上の次の要素にフォーカスを移動する。
      // nextIndex は null チェック済みなので非 null アサーションで閉じる。
      const groupEl = e.currentTarget.closest('[role="radiogroup"]');
      const nextBtn =
        groupEl?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[
          nextIndex
        ];
      nextBtn?.focus();
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={[styles.root, className].filter(Boolean).join(" ")}
    >
      {options.map((opt, index) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={styles.option}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
