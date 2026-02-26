import Link from "next/link";
import type { IrodoriRound } from "@/games/irodori/_lib/types";
import { hslToHex } from "@/games/irodori/_lib/color-utils";
import styles from "./RoundResult.module.css";

interface Props {
  round: IrodoriRound;
}

/**
 * Displays the result of a single round: target vs answer comparison.
 */
export default function RoundResult({ round }: Props) {
  const answerHex = round.answer
    ? hslToHex(round.answer.h, round.answer.s, round.answer.l)
    : "#333333";

  return (
    <div className={styles.resultArea}>
      <div className={styles.colorComparison}>
        <div className={styles.colorColumn}>
          <span className={styles.columnLabel}>{"\u304A\u984C"}</span>
          <div
            className={styles.colorPatch}
            style={{ backgroundColor: round.target.hex }}
            role="img"
            aria-label={"\u30BF\u30FC\u30B2\u30C3\u30C8\u30AB\u30E9\u30FC"}
          />
        </div>
        <div className={styles.colorColumn}>
          <span className={styles.columnLabel}>
            {"\u3042\u306A\u305F\u306E\u56DE\u7B54"}
          </span>
          <div
            className={styles.colorPatch}
            style={{ backgroundColor: answerHex }}
            role="img"
            aria-label={"\u3042\u306A\u305F\u306E\u56DE\u7B54\u8272"}
          />
        </div>
      </div>
      <div className={styles.scoreInfo}>
        <div className={styles.scoreLine}>
          {round.score ?? 0}
          {"\u70B9"}
        </div>
        <div className={styles.deltaLine}>
          {"\u8272\u5DEE"} (Delta E):{" "}
          {round.deltaE !== null ? round.deltaE.toFixed(1) : "-"}
        </div>
      </div>
      {round.target.name && (
        <div className={styles.colorName}>
          {"\u3053\u306E\u8272\u306F\u300E"}
          {round.target.slug ? (
            <Link
              href={`/dictionary/traditional-colors/${round.target.slug}`}
              className={styles.colorNameLink}
            >
              {round.target.name}
            </Link>
          ) : (
            round.target.name
          )}
          {"\u300F\u3067\u3057\u305F"}
        </div>
      )}
    </div>
  );
}
