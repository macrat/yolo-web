import styles from "./GameContainer.module.css";

interface Props {
  currentRound: number;
  totalRounds: number;
  completedRounds: number;
}

/**
 * Shows the current round progress (e.g., 1/5, 2/5...).
 */
export default function ProgressBar({
  currentRound,
  totalRounds,
  completedRounds,
}: Props) {
  return (
    <div
      className={styles.progressBar}
      role="progressbar"
      aria-valuenow={completedRounds}
      aria-valuemin={0}
      aria-valuemax={totalRounds}
    >
      <div className={styles.progressDots}>
        {Array.from({ length: totalRounds }, (_, i) => (
          <span
            key={i}
            className={`${styles.progressDot} ${i < completedRounds ? styles.progressDotCompleted : ""} ${i === currentRound && completedRounds < totalRounds ? styles.progressDotCurrent : ""}`}
          />
        ))}
      </div>
      <span className={styles.progressText}>
        {completedRounds < totalRounds
          ? `${currentRound + 1}/${totalRounds}`
          : `${totalRounds}/${totalRounds}`}
      </span>
    </div>
  );
}
