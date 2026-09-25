import Button from "@/components/Button";
import styles from "./GameHeader.module.css";

interface Props {
  puzzleNumber: number;
  dateString: string;
  onHelpClick: () => void;
  onStatsClick: () => void;
  /**
   * Ref to the game title <h1>. Used as the focus-restore anchor when an
   * auto-opened modal (first-visit HowToPlay / game-end Result) closes, so
   * keyboard/SR focus is not lost to <body>. See useDialog / GameContainer.
   */
  titleRef?: React.Ref<HTMLHeadingElement>;
}

/**
 * Game header showing title, puzzle number, date, and the buttons that open
 * the help and stats dialogs.
 */
export default function GameHeader({
  puzzleNumber,
  dateString,
  onHelpClick,
  onStatsClick,
  titleRef,
}: Props) {
  return (
    <header className={styles.header}>
      <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
        {"イロドリ"} <span className={styles.number}>#{puzzleNumber}</span>
      </h1>
      <p className={styles.date}>{dateString}</p>
      <div className={styles.buttons}>
        <Button onClick={onHelpClick}>遊び方</Button>
        <Button onClick={onStatsClick}>統計</Button>
      </div>
    </header>
  );
}
