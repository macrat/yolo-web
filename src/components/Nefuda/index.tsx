import type { ReactElement } from "react";
import styles from "./Nefuda.module.css";

export interface NefudaProps {
  /**
   * 値札の文言。例「3分」「印刷できます」「診断」。
   * DESIGN.md §4「値札は情報であって装飾ではない——中身の無いラベルを貼らない」に従い、
   * 空文字・空白のみのときは何も描画しない（null を返す）。呼び出し側で空判定を書かせない。
   */
  label: string;
}

/**
 * 値札（Nefuda）— メタ情報の小ラベル（DESIGN.md §4「値札」）。
 *
 * 仕様（§4/§3 対応）:
 * - 12–13px・`--ink-2`・角丸 `--radius-sm`(2px)・`--rule` の罫囲み（背景・影を持たない静かな器）。
 * - 種別・所要時間などの「情報のあるラベル」だけを表示する。装飾ではない。
 * - 単一ラベルを表す最小部品。複数を横に並べるのは呼び出し側 or {@link NefudaGroup}。
 */
export default function Nefuda({ label }: NefudaProps): ReactElement | null {
  // §4: 中身の無いラベルを貼らない——空値は構造ごと省く
  if (label.trim() === "") {
    return null;
  }
  return <span className={styles.nefuda}>{label}</span>;
}

export interface NefudaGroupProps {
  /**
   * 値札の文言配列。各要素が値札 1 枚になる。
   * 空文字・空白のみの要素は間引かれ、全て空なら群ごと描画しない（§4）。
   */
  labels: string[];
  /** スクリーンリーダ向けの群のラベル（任意）。 */
  ariaLabel?: string;
}

/**
 * 値札の軽いラッパ（NefudaGroup）— 複数の値札を横並び（折り返し可）で置く。
 * 並べる責務だけを持ち、値札自体の見た目は {@link Nefuda} に委ねる（関心の分離）。
 */
export function NefudaGroup({
  labels,
  ariaLabel,
}: NefudaGroupProps): ReactElement | null {
  const shown = labels.filter((label) => label.trim() !== "");
  if (shown.length === 0) {
    return null;
  }
  return (
    <span className={styles.group} aria-label={ariaLabel}>
      {shown.map((label, index) => (
        // 同一文言の値札が並びうるため index を key に混ぜて一意性を担保する
        <Nefuda key={`${label}-${index}`} label={label} />
      ))}
    </span>
  );
}
