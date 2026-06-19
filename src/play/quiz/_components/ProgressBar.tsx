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
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
