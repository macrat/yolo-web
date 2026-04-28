import type { ComponentPropsWithoutRef } from "react";
import styles from "./ToggleSwitch.module.css";

interface ToggleSwitchOwnProps {
  /** トグルのアクセシブル名（必須）。視覚的にも label として隣に表示される。 */
  label: React.ReactNode;
}

type ToggleSwitchProps = ToggleSwitchOwnProps &
  Omit<
    ComponentPropsWithoutRef<"input">,
    keyof ToggleSwitchOwnProps | "type" | "role" | "children"
  >;

/**
 * ToggleSwitch — ON/OFF 切替コンポーネント。
 *
 * 内部的に標準の `<input type="checkbox">` を使い、視覚的にトグルスイッチ
 * として見えるよう CSS で状態を切り替えている。`type` と `role` 以外の HTML
 * 属性はすべて素の `<input>` に透過するため、振る舞いはネイティブ checkbox
 * と完全に同一。
 *
 * - **controlled / uncontrolled の両対応**: `checked` でも `defaultChecked`
 *   でも使える。両方を同時に指定した場合は React 標準の挙動どおり `checked`
 *   が優先され、開発モードでは警告が出る。
 * - **a11y**: `<input type="checkbox" role="switch">` のハイブリッドとし、
 *   スクリーンリーダーには「スイッチ」として読み上げられる（WAI-ARIA APG 推奨）。
 *   ラベルは `<label>` でラップしているので `htmlFor` / `id` 連携なしで
 *   クリック領域がラベル全体に広がる。
 * - **キーボード操作**: `<input type="checkbox">` のブラウザ標準挙動でスペース
 *   キーが効く（フォーカス時）。Enter は標準では発火しないので注意。
 * - **JS なしで状態切替**: `:checked ~ .track` などの CSS セレクタで状態を
 *   表現するため、独自の React state を持たず再レンダリングオーバーヘッドが
 *   小さい。
 *
 * デザイン:
 * - DESIGN.md §5: 「ON/OFF を切り替えるフォーム要素は、原則としてチェック
 *   ボックスではなくトグルスイッチを使う」
 * - DESIGN.md §2: フォーカスは `outline: 2px solid var(--accent); outline-offset: 2px;`
 *
 * @example
 * // controlled
 * <ToggleSwitch label="通知を受け取る" checked={on} onChange={(e) => setOn(e.target.checked)} />
 *
 * @example
 * // uncontrolled
 * <ToggleSwitch label="メール配信" defaultChecked name="email-notify" />
 */
function ToggleSwitch({ label, className, ...rest }: ToggleSwitchProps) {
  return (
    <label className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      {/* ネイティブ checkbox を視覚的に隠す。position: absolute + opacity: 0 で
          DOM には残し、<label> クリックでネイティブ機能（クリック・キーボード）が
          そのまま動作する。display: none や visibility: hidden にすると
          フォーカスできなくなるため使わない。 */}
      <input type="checkbox" role="switch" className={styles.input} {...rest} />
      {/* トラック: 横長楕円の背景。:checked ~ でON/OFF を CSS のみで切替 */}
      <span className={styles.track} aria-hidden="true">
        {/* サム: 丸いつまみ。ON 時に transform: translateX で右へ移動 */}
        <span className={styles.thumb} />
      </span>
      {/* ラベルテキスト: <label> 内に配置するのでクリック領域を広げる効果もある */}
      <span className={styles.labelText}>{label}</span>
    </label>
  );
}

export default ToggleSwitch;
