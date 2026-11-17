import type { FeedbackLevel } from "@/play/games/kanji-kanaru/_lib/types";
import { FEEDBACK_MARKS } from "@/play/games/kanji-kanaru/_lib/marks";
import styles from "./styles/KanjiKanaru.module.css";

interface FeedbackCellProps {
  feedback: FeedbackLevel;
  /** 列の名前（読み上げで言う。「部首」「音読み」など） */
  label: string;
  /** 学年の列で、答えの学年が上か下かを示す矢印（見た目だけ）。 */
  direction?: string;
  /** direction を読み上げで言う語。矢印は読み上げで一定に読まれないので、語で言う。 */
  directionLabel?: string;
}

/**
 * 推測の1つの項目への判定のマス。判定は凡例と同じ印（◯・△・×）で示し、読み上げは凡例の意味の語で言う
 * （DESIGN.md §8）。
 */
export default function FeedbackCell({
  feedback,
  label,
  direction,
  directionLabel,
}: FeedbackCellProps) {
  const { mark, meaning } = FEEDBACK_MARKS[feedback];
  return (
    <div
      className={`${styles.square} ${feedback === "wrong" ? styles.miss : styles.hit}`}
      role="cell"
      aria-label={`${label}: ${meaning}${directionLabel ?? ""}`}
    >
      <span className={styles.mark} aria-hidden="true">
        {mark}
      </span>
      {direction && (
        <span className={styles.direction} aria-hidden="true">
          {direction}
        </span>
      )}
    </div>
  );
}
