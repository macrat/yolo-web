"use client";

import { Fragment, type Ref } from "react";
import styles from "./WordGrid.module.css";

interface Props {
  words: string[];
  selectedWords: string[];
  onWordToggle: (word: string) => void;
  /**
   * 端末の記録を当てる前の場所取り。渡すと、語のマスの見せ方（display）をこの値にする。本体の前のスクリプトが、
   * 記録で当てた組の語を格子から外す値を書く。
   */
  reservedDisplay?: (word: string) => string;
  /** 文節を持つ語の文節の並び（サーバーで分けたもの）。文節の切れ目で折る。 */
  wordPhrases: Record<string, string[]>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * まだ組になっていない語の格子。語を押して選び、選んだかどうかは語の上の四角の塗りで示す
 * （DESIGN.md §6 チェックボックスと同じ形）。列の数は、その列の数のときにマスの中で語の字が使える幅で決める
 * （WordGrid.module.css）。
 */
export default function WordGrid({
  words,
  selectedWords,
  onWordToggle,
  reservedDisplay,
  wordPhrases,
  ref,
}: Props) {
  return (
    <div
      ref={ref}
      className={styles.frame}
      role="group"
      aria-label="言葉の格子"
    >
      <div className={styles.fourColumnText}>
        <div className={styles.twoColumnText}>
          <div className={styles.grid}>
            {words.map((word) => (
              <button
                key={word}
                className={
                  wordPhrases[word]
                    ? `${styles.wordButton} ${styles.phrased}`
                    : styles.wordButton
                }
                data-thick-frame
                style={reservedDisplay && { display: reservedDisplay(word) }}
                onClick={() => onWordToggle(word)}
                aria-pressed={selectedWords.includes(word)}
                aria-label={word}
                type="button"
              >
                <span className={styles.mark} aria-hidden="true" />
                {wordPhrases[word]
                  ? wordPhrases[word].map((phrase, index) => (
                      <Fragment key={index}>
                        {index > 0 && <wbr />}
                        {phrase}
                      </Fragment>
                    ))
                  : word}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
