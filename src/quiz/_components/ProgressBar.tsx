import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
  current: number;
  total: number;
  accentColor: string;
};

export default function ProgressBar({
  current,
  total,
  accentColor,
}: ProgressBarProps) {
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
        <div
          className={styles.fill}
          style={{
            width: `${percentage}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
    </div>
  );
}
