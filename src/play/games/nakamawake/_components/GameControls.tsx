import Button from "@/components/Button";
import styles from "./GameControls.module.css";

interface Props {
  onCheck: () => void;
  onShuffle: () => void;
  onDeselectAll: () => void;
  disabled: boolean;
  canCheck: boolean;
  /** disabled のとき、なぜ操作できないかを言う文（§6 無効）。 */
  disabledReason?: string;
  /** disabledReason を置く要素の id。言葉の盤面もこの文を説明として読ませる。 */
  disabledReasonId?: string;
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
  disabledReason,
  disabledReasonId,
}: Props) {
  const describedBy = disabled && disabledReason ? disabledReasonId : undefined;
  return (
    <div className={styles.area}>
      <div className={styles.controls}>
        <Button
          onClick={onShuffle}
          disabled={disabled}
          aria-describedby={describedBy}
        >
          {"シャッフル"}
        </Button>
        <Button
          onClick={onDeselectAll}
          disabled={disabled}
          aria-describedby={describedBy}
        >
          {"選択解除"}
        </Button>
        <Button
          variant="primary"
          onClick={onCheck}
          disabled={disabled || !canCheck}
          aria-describedby={describedBy}
          disabledReason={
            disabled ? undefined : "言葉を4つ選ぶとチェックできます"
          }
        >
          {"チェック"}
        </Button>
      </div>
      {describedBy && (
        <p id={describedBy} className={styles.reason}>
          {disabledReason}
        </p>
      )}
    </div>
  );
}
