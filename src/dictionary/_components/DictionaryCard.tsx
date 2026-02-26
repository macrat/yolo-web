import Link from "next/link";
import styles from "./DictionaryCard.module.css";

interface KanjiCardProps {
  type: "kanji";
  character: string;
  readings: string[];
  meanings: string[];
  category: string;
}

interface YojiCardProps {
  type: "yoji";
  yoji: string;
  reading: string;
  meaning: string;
  category: string;
  difficultyLabel?: string;
}

type DictionaryCardProps = KanjiCardProps | YojiCardProps;

export default function DictionaryCard(props: DictionaryCardProps) {
  if (props.type === "kanji") {
    return (
      <Link
        href={`/dictionary/kanji/${encodeURIComponent(props.character)}`}
        className={`${styles.card} ${styles.kanjiCard}`}
        data-testid="dictionary-card"
      >
        <span className={styles.character}>{props.character}</span>
        <span className={styles.reading}>{props.readings.join("・")}</span>
        <span className={styles.meaning}>{props.meanings.join(", ")}</span>
        <div className={styles.meta}>
          <span className={styles.badge}>{props.category}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/dictionary/yoji/${encodeURIComponent(props.yoji)}`}
      className={`${styles.card} ${styles.yojiCard}`}
      data-testid="dictionary-card"
    >
      <span className={styles.character}>{props.yoji}</span>
      <span className={styles.reading}>{props.reading}</span>
      <span className={styles.meaning}>{props.meaning}</span>
      <div className={styles.meta}>
        <span className={styles.badge}>{props.category}</span>
        {props.difficultyLabel && (
          <span className={styles.badge}>{props.difficultyLabel}</span>
        )}
      </div>
    </Link>
  );
}
