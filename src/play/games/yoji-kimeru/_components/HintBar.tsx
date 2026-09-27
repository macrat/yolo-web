"use client";

import type {
  YojiCategory,
  YojiOrigin,
} from "@/play/games/yoji-kimeru/_lib/types";
import {
  categoryLabels,
  originLabels,
  difficultyLabels,
} from "@/play/games/yoji-kimeru/_lib/constants";
import styles from "./styles/YojiKimeru.module.css";

/** 問題を読み込んだあとに出すヒントの元。 */
export interface HintSource {
  reading: string;
  category: YojiCategory;
  origin: YojiOrigin;
  difficulty: 1 | 2 | 3;
}

interface HintBarProps {
  guessCount: number;
  /** 問題を読み込むまでは null。そのあいだは読み込んでいることを字で言う。 */
  hint: HintSource | null;
}

/** 推測の回数ごとに増えるヒントと、それが出る回。 */
const LATER_HINTS = [
  { after: 3, name: "読みの最初の字" },
  { after: 4, name: "出典" },
  { after: 5, name: "分類" },
] as const;

/**
 * ヒントの帯。難易度と読みの字数は初めから出し、3回目のあとに読みの最初の字、4回目のあとに出典、5回目の
 * あとに分類を1行ずつ足す。次に出るヒントを最後の行で言う。
 *
 * どの行も1つのヒントだけを持ち、行の中で折れない短い文にする。問題を読み込む前と後で行の数が変わらず、
 * 読み込んだときに下のものが動かない。
 */
/** その回数の推測のあとに出る、ヒントの帯の行の数。 */
export function hintLineCount(guessCount: number): number {
  const shown = LATER_HINTS.filter(({ after }) => guessCount >= after).length;
  const next = shown < LATER_HINTS.length ? 1 : 0;
  return 1 + shown + next;
}

export default function HintBar({ guessCount, hint }: HintBarProps) {
  const next = LATER_HINTS.find(({ after }) => guessCount < after);

  return (
    <div className={styles.hints} role="status" aria-label="ヒント">
      <p>
        <span className={styles.hintLabel}>ヒント</span>
        {hint ? (
          <>
            難易度{" "}
            <span aria-hidden="true">{difficultyLabels[hint.difficulty]}</span>
            <span className="visually-hidden">3段階の{hint.difficulty}</span>
            、読み {[...hint.reading].length}文字
          </>
        ) : (
          "読み込んでいます"
        )}
      </p>
      {hint && guessCount >= 3 && <p>読みの最初の字 {[...hint.reading][0]}</p>}
      {hint && guessCount >= 4 && <p>出典 {originLabels[hint.origin]}</p>}
      {hint && guessCount >= 5 && <p>分類 {categoryLabels[hint.category]}</p>}
      {next && (
        <p className={styles.hintNext}>
          {next.after}回目のあとに{next.name}
        </p>
      )}
    </div>
  );
}
