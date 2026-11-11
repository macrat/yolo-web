"use client";

import type { YojiGuessFeedback } from "@/play/games/yoji-kimeru/_lib/types";
import CharFeedbackCell from "./CharFeedbackCell";
import styles from "./styles/YojiKimeru.module.css";

/** 盤の1行の中身。判定の付いた推測・答え合わせを待つ推測・次の推測を入れる空の行のどれか。 */
export type BoardRow =
  | { kind: "judged"; feedback: YojiGuessFeedback }
  | { kind: "pending"; guess: string }
  | { kind: "empty" };

interface GuessRowProps {
  row: BoardRow;
  /** 判定が現れる動きを持つか。来訪者の推測でいま判定が付いた行だけが持つ。 */
  appears: boolean;
}

const EMPTY_CHARS = ["", "", "", ""];

/**
 * 判定の付いていないマス。字（空の行では見えない字）の下に、見えない印を置き、判定の付いたマスと同じ高さを
 * 持つ。
 */
function UnjudgedCell({ character }: { character: string }) {
  return (
    <div
      className={styles.cellEmpty}
      role="cell"
      aria-label={character ? `${character}: 答え合わせ中` : "空欄"}
    >
      <span className={styles.char} aria-hidden="true">
        {character || " "}
      </span>
      <span className={styles.mark} aria-hidden="true">
        {" "}
      </span>
    </div>
  );
}

/** 盤の1行。推測した4つの字と、その判定。 */
export default function GuessRow({ row, appears }: GuessRowProps) {
  if (row.kind !== "judged") {
    const characters = row.kind === "pending" ? [...row.guess] : EMPTY_CHARS;
    return (
      <div className={styles.row} role="row">
        {characters.map((character, i) => (
          <UnjudgedCell key={i} character={character} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={appears ? `${styles.row} ${styles.rowAppears}` : styles.row}
      role="row"
    >
      {[...row.feedback.guess].map((character, i) => (
        <CharFeedbackCell
          key={i}
          character={character}
          feedback={row.feedback.charFeedbacks[i]}
        />
      ))}
    </div>
  );
}
