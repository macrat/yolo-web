"use client";

import type { YojiGuessFeedback } from "@/play/games/yoji-kimeru/_lib/types";
import GuessRow from "./GuessRow";
import styles from "./styles/YojiKimeru.module.css";

interface GameBoardProps {
  guesses: YojiGuessFeedback[];
  /** 送って答え合わせを待っている推測。判定が返るまで、字だけの行で場所を取っておく。 */
  pendingGuess: string | null;
  /** 次の推測を入れる空の行を見せるか（遊んでいて、まだ推測を入れられるあいだだけ）。 */
  showNextRow: boolean;
  /** 来訪者の推測で、いま判定が付いた行の番号。その行の判定だけが現れる動きを持つ。 */
  addedRow: number | null;
}

/**
 * 盤。使った行と、次の推測を入れる1行だけを並べ、残りの空の行は見せない。1行は推測した4つの字で、
 * 字の下に判定の印を置く。
 *
 * 送った推測は、判定を待たずにその場で行になる。判定が遅く返っても、盤の高さは送ったときに決まっていて、
 * 判定が付くときに盤の下が動かない。
 */
export default function GameBoard({
  guesses,
  pendingGuess,
  showNextRow,
  addedRow,
}: GameBoardProps) {
  return (
    <div className={styles.board} role="table" aria-label="推測した四字熟語">
      {guesses.map((feedback, i) => (
        <GuessRow
          key={i}
          row={{ kind: "judged", feedback }}
          appears={i === addedRow}
        />
      ))}
      {pendingGuess !== null && (
        <GuessRow
          key={guesses.length}
          row={{ kind: "pending", guess: pendingGuess }}
          appears={false}
        />
      )}
      {showNextRow && <GuessRow row={{ kind: "empty" }} appears={false} />}
    </div>
  );
}
