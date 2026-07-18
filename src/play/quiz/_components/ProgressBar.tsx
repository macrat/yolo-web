import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
  current: number;
  total: number;
};

/**
 * クイズ設問の進捗バー。
 *
 * 新デザイン体系（DESIGN.md）。塗りの色はクイズごとの派手色ではなく、
 * サイト共通の抑制された藍アクセント（--accent）に統一する。
 */
export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>
        {current} / {total}
      </span>
      <div
        className={styles.track}
        role="progressbar"
        // F3（WCAG 4.1.2）: progressbar に安定したアクセシブル名を付与。
        // aria-valuenow/min/max だけでは無名の progressbar になり、SR が用途を
        // 伝えられない。可視の "current / total" ラベルは残しつつ、名前と
        // 「○問中○問目」の読み上げ値（aria-valuetext）を補う。
        aria-label="設問の進捗"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuetext={`${total}問中${current}問目`}
      >
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
