import styles from "./GameControls.module.css";

interface Props {
  onCheck: () => void;
  onShuffle: () => void;
  onDeselectAll: () => void;
  disabled: boolean;
  canCheck: boolean;
}

/**
 * Game control buttons: shuffle, deselect all, and check.
 */
export default function GameControls({
  onCheck,
  onShuffle,
  onDeselectAll,
  disabled,
  canCheck,
}: Props) {
  return (
    <div className={styles.controls}>
      <button
        className={styles.secondaryButton}
        onClick={onShuffle}
        disabled={disabled}
        type="button"
      >
        {"\u30B7\u30E3\u30C3\u30D5\u30EB"}
      </button>
      <button
        className={styles.secondaryButton}
        onClick={onDeselectAll}
        disabled={disabled}
        type="button"
      >
        {"\u9078\u629E\u89E3\u9664"}
      </button>
      <button
        className={styles.primaryButton}
        onClick={onCheck}
        disabled={disabled || !canCheck}
        type="button"
      >
        {"\u30C1\u30A7\u30C3\u30AF"}
      </button>
    </div>
  );
}
