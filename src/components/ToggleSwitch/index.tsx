import styles from "./ToggleSwitch.module.css";

interface ToggleSwitchProps {
  /** ON/OFF の状態（controlled component） */
  checked: boolean;
  /** 状態が変わるときに呼ばれるコールバック。新しい checked 値を受け取る */
  onChange: (checked: boolean) => void;
  /**
   * アクセシブル名。スクリーンリーダーに読み上げられる。
   * button の aria-label として設定する。
   */
  label: string;
  /** 無効状態。true のとき onChange を発火しない */
  disabled?: boolean;
  /** 外部 label との関連付け用 id */
  id?: string;
}

/**
 * ToggleSwitch — ON/OFF を切り替えるフォーム要素。
 *
 * DESIGN.md §5: 原則としてチェックボックスではなくトグルスイッチを使う。
 * ARIA: role="switch" と aria-checked で状態をスクリーンリーダーに伝える。
 *
 * 実装上の注意: button 要素ベースのため、スペース・Enter キーは
 * ブラウザのデフォルト動作でクリックイベントを発火する。
 */
function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}: ToggleSwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      disabled={disabled}
      onClick={handleClick}
      className={styles.toggle}
    >
      {/* トラック: 横長楕円の背景。ON/OFF で色が変わる */}
      <span className={styles.track} aria-hidden="true">
        {/* サム: 丸いつまみ。ON/OFF で左右に移動する */}
        <span className={styles.thumb} />
      </span>
    </button>
  );
}

export default ToggleSwitch;
