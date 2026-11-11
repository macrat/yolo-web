import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
  /** いまの問の番号（1から数える） */
  current: number;
  /** 全体の問の数 */
  total: number;
  /** 帯の名前（「設問の進捗」など）。読み上げで、何の進み具合かを言う */
  label: string;
};

/**
 * 進み具合の帯（DESIGN.md §5）。いまの問が全体の何番目かを、左の「2 / 5」・塗りの割合・読み上げの
 * 「5問中2問目」の3つで同じ数として言う。UI の部品なので、塗りは --ink で塗る（§2）。
 */
export default function ProgressBar({
  current,
  total,
  label,
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={styles.wrapper}>
      <span className={styles.label} aria-hidden="true">
        {current} / {total}
      </span>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
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
