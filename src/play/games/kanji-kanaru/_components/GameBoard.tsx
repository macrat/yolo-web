"use client";

import { useEffect, useRef } from "react";
import type { GuessFeedback } from "@/play/games/kanji-kanaru/_lib/types";
import { markScrollFrame } from "@/lib/scroll-frame";
import GuessRow, { FEEDBACK_COLUMNS } from "./GuessRow";
import styles from "./styles/KanjiKanaru.module.css";

/** 文字を大きくして盤がコンテンツ幅に収まらず、枠の中で横に送るときの枠の名前。 */
const SCROLL_FRAME_LABEL = "盤（横にスクロールできます）";

interface GameBoardProps {
  guesses: GuessFeedback[];
  /** 次に入れる空の行を見せるか（遊んでいるあいだ）。 */
  showNextRow: boolean;
  /** 推測を送った応えとして、いま現れた行の番号。 */
  appearingRow?: number;
  /** 次に入れる行の判定の列に言う文（読み込みのあいだ）。 */
  pendingText?: string;
  /** pendingText の要素の id。無効の入力欄の説明として読ませる。 */
  pendingTextId?: string;
}

/**
 * 盤。使った行と、遊んでいるあいだは次に入れる1行だけを見せ、残りの空の行は見せない。
 */
export default function GameBoard({
  guesses,
  showNextRow,
  appearingRow,
  pendingText,
  pendingTextId,
}: GameBoardProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => markScrollFrame(frame, SCROLL_FRAME_LABEL);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    for (const content of frame.children) observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={styles.boardFrame}>
      <div className={styles.board} role="grid" aria-label="推測の結果">
        <div className={styles.boardRow} role="row">
          <div className={styles.columnHeader} role="columnheader">
            <span className="visually-hidden">推測した漢字</span>
          </div>
          {FEEDBACK_COLUMNS.map(({ key, heading, label }) => (
            <div
              key={key}
              className={styles.columnHeader}
              role="columnheader"
              aria-label={label === heading ? undefined : label}
            >
              {heading}
            </div>
          ))}
        </div>
        {guesses.map((feedback, i) => (
          <GuessRow key={i} feedback={feedback} appear={i === appearingRow} />
        ))}
        {showNextRow && (
          <GuessRow
            feedback={null}
            pendingText={pendingText}
            pendingTextId={pendingTextId}
          />
        )}
      </div>
    </div>
  );
}
