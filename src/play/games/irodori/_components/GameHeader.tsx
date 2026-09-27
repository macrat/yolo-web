import styles from "./GameHeader.module.css";

interface Props {
  puzzleNumber: number;
  dateString: string;
}

/**
 * 問題の番号と日付。ゲーム名の h1 はページ（GameLayout）が持つ。
 */
export default function GameHeader({ puzzleNumber, dateString }: Props) {
  return (
    <header className={styles.header}>
      <p className={styles.date}>
        #{puzzleNumber} - {dateString}
      </p>
    </header>
  );
}
