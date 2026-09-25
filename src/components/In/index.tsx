import type { ReactElement } from "react";
import styles from "./In.module.css";

/** 回転の許容範囲（±8° 以内）。 */
const MAX_ROTATE_DEG = 8;

export interface InProps {
  /**
   * 印の一文字（見出しの書体で組む）。印は1字なので、
   * 2 文字以上が渡っても最初の 1 文字だけを捺す（呼び出し側の誤用を器の側で吸収する）。
   */
  char: string;
  /**
   * 傾き（度）。回転は ±8° 以内で、範囲外は ±8° にクランプする（逸脱を作らせない）。
   * 既定 -4°（わずかな手捺しの気配・かすれ等の質感演出はしない）。
   */
  rotateDeg?: number;
  /**
   * 表示サイズ（CSS 長さ・幅=高さ）。大きさは包み幅の 1/5 以下。
   * 包み（{@link Tsutsumi}）が 1/5 以下の値を渡して制約を担保する。既定は単独表示用の 48px。
   */
  size?: string;
  /**
   * スクリーンリーダ向けの説明（任意）。印は装飾ではなく「店の印」なので、
   * 与えられれば role="img" のラベルにする。無ければ装飾として aria-hidden にする。
   */
  label?: string;
}

/**
 * 印（In）— 成果物に捺す店の印。
 *
 * 仕様:
 * - 文字 1 字（見出しの書体）＋細い円環（2px 以内）・**`--accent` 一色**・回転 ±8° 以内・
 *   大きさは包み幅の 1/5 以下。
 * - かすれ・にじみ・グラデーション・影などの「捺印質感の演出」はしない（偽物の手仕事＝キッチュ）。
 * - 円環（枠）は SVG の `<circle>` 一本ストロークで描く（角丸を持たないため `border-radius: 50%` を使わない）。
 * - 器（ページ UI・のれん・品書き）には決して使わない——成果物（包み/札）専用。
 */
export default function In({
  char,
  rotateDeg = -4,
  size = "48px",
  label,
}: InProps): ReactElement {
  // 文字は 1 字——複数文字は先頭 1 文字に切り詰める（サロゲートペア対応で 1 書記素）
  const glyph = [...char][0] ?? "";
  // ±8° 以内——範囲外をクランプ
  const rotate = Math.max(-MAX_ROTATE_DEG, Math.min(MAX_ROTATE_DEG, rotateDeg));

  const accessibility = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };

  return (
    <span
      className={styles.in}
      // サイズと傾きは呼び出しごとに変わる幾何情報のためカスタムプロパティで渡す
      // （色は一切インラインに書かない——色は module.css の var(--accent) 経由）。
      style={
        {
          "--in-size": size,
          "--in-rotate": `${rotate}deg`,
        } as React.CSSProperties
      }
      {...accessibility}
    >
      <svg className={styles.ring} viewBox="0 0 40 40" aria-hidden="true">
        {/* 細い円環（2px 以内）。vector-effect で拡大時もストロークを太らせない。 */}
        <circle
          className={styles.ringLine}
          cx="20"
          cy="20"
          r="18.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className={styles.char} aria-hidden="true">
        {glyph}
      </span>
    </span>
  );
}
