import styles from "./GameHeader.module.css";

interface Props {
  puzzleNumber: number;
  dateString: string;
  onHelpClick: () => void;
  onStatsClick: () => void;
}

/**
 * Game header showing the title, puzzle number, date, and icon buttons.
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
        {"\u30CA\u30AB\u30DE\u30EF\u30B1"}{" "}
        <span className={styles.number}>#{puzzleNumber}</span>
      </h1>
      <p className={styles.date}>{dateString}</p>
      <div className={styles.buttons}>
        <button
          onClick={onHelpClick}
          className={styles.iconButton}
          aria-label={"\u904A\u3073\u65B9"}
          type="button"
        >
          ?
        </button>
        <button
          onClick={onStatsClick}
          className={styles.iconButton}
          aria-label={"\u7D71\u8A08"}
          type="button"
        >
          {"\u{1F4CA}"}
        </button>
      </div>
    </header>
  );
}
