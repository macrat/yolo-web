import type { GuessFeedback } from "@/play/games/kanji-kanaru/_lib/types";
import FeedbackCell from "./FeedbackCell";
import styles from "./styles/KanjiKanaru.module.css";

/** 判定の列。見出し（盤の上の字）と、マスの読み上げで言う名前。 */
export const FEEDBACK_COLUMNS = [
  { key: "radical", heading: "部首", label: "部首" },
  { key: "strokeCount", heading: "画数", label: "画数" },
  { key: "grade", heading: "学年", label: "学年" },
  { key: "onYomi", heading: "音", label: "音読み" },
  { key: "category", heading: "意味", label: "意味" },
  { key: "kunYomiCount", heading: "訓", label: "訓読み" },
] as const;

/** 学年の列の矢印（見た目だけ）。 */
const GRADE_DIRECTION_ARROWS: Record<GuessFeedback["gradeDirection"], string> =
  {
    up: "↑",
    down: "↓",
    equal: "",
  };

/** 学年の向きを読み上げで言う語。矢印は読み上げで一定に読まれないので、語で言う。 */
const GRADE_DIRECTION_LABELS: Record<GuessFeedback["gradeDirection"], string> =
  {
    up: "（対象はより上の学年）",
    down: "（対象はより下の学年）",
    equal: "",
  };

interface GuessRowProps {
  /** 推測への判定。null なら、次に入れる空の行。 */
  feedback: GuessFeedback | null;
  /** 推測を送った応えとして、いま現れた行か。印が現れる動きを持つ。 */
  appear?: boolean;
  /** 空の行の判定の列に言う文（読み込みのあいだの「読み込んでいます」）。 */
  pendingText?: string;
  /** pendingText の要素の id。 */
  pendingTextId?: string;
}

/**
 * 盤の1行。推測した漢字と、6つの項目への判定を並べる。
 */
export default function GuessRow({
  feedback,
  appear = false,
  pendingText,
  pendingTextId,
}: GuessRowProps) {
  if (!feedback) {
    return (
      <div className={styles.boardRow} role="row">
        <div className={styles.square} role="cell" aria-label="次の推測" />
        {pendingText ? (
          <div id={pendingTextId} className={styles.loadingText} role="cell">
            {pendingText}
          </div>
        ) : (
          FEEDBACK_COLUMNS.map(({ key, label }) => (
            <div
              key={key}
              className={styles.square}
              role="cell"
              aria-label={`${label}: 未回答`}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div
      className={
        appear ? `${styles.boardRow} ${styles.appears}` : styles.boardRow
      }
      role="row"
    >
      <div
        className={`${styles.square} ${styles.guessKanji}`}
        role="cell"
        aria-label={`推測した漢字 ${feedback.guess}`}
      >
        {feedback.guess}
      </div>
      {FEEDBACK_COLUMNS.map(({ key, label }) => (
        <FeedbackCell
          key={key}
          feedback={feedback[key]}
          label={label}
          direction={
            key === "grade"
              ? GRADE_DIRECTION_ARROWS[feedback.gradeDirection]
              : undefined
          }
          directionLabel={
            key === "grade"
              ? GRADE_DIRECTION_LABELS[feedback.gradeDirection]
              : undefined
          }
        />
      ))}
    </div>
  );
}
