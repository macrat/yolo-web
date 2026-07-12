import BarChart from "@/components/icons/BarChart";
import HelpCircle from "@/components/icons/HelpCircle";
import styles from "./GameHeader.module.css";

interface Props {
  puzzleNumber: number;
  dateString: string;
  onHelpClick: () => void;
  onStatsClick: () => void;
}

/**
 * Game header showing title, puzzle number, date, and icon buttons.
 */
export default function GameHeader({
  puzzleNumber,
  dateString,
  onHelpClick,
  onStatsClick,
}: Props) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        {"イロドリ"} <span className={styles.number}>#{puzzleNumber}</span>
      </h1>
      <p className={styles.date}>{dateString}</p>
      <div className={styles.buttons}>
        <button
          onClick={onHelpClick}
          className={styles.iconButton}
          aria-label={"遊び方"}
          type="button"
        >
          <HelpCircle />
        </button>
        <button
          onClick={onStatsClick}
          className={styles.iconButton}
          aria-label={"統計"}
          type="button"
        >
          <BarChart />
        </button>
      </div>
    </header>
  );
}
