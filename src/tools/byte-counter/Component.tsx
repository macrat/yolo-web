"use client";

import { useState, useMemo } from "react";
import { analyzeText } from "./logic";
import styles from "./Component.module.css";

export default function ByteCounterTool() {
  const [text, setText] = useState("");

  const result = useMemo(() => analyzeText(text), [text]);

  return (
    <div className={styles.container}>
      <label htmlFor="byte-counter-input" className={styles.label}>
        テキストを入力
      </label>
      <textarea
        id="byte-counter-input"
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここにテキストを入力してください..."
        rows={10}
        aria-describedby="byte-counter-results"
      />

      <div className={styles.primaryStat}>
        <span className={styles.primaryStatLabel}>バイト数 (UTF-8)</span>
        <span className={styles.primaryStatValue}>{result.byteLength}</span>
      </div>

      <div
        id="byte-counter-results"
        className={styles.results}
        role="status"
        aria-live="polite"
      >
        <div className={styles.stat}>
          <span className={styles.statLabel}>文字数</span>
          <span className={styles.statValue}>{result.charCount}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>文字数（空白除く）</span>
          <span className={styles.statValue}>{result.charCountNoSpaces}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>行数</span>
          <span className={styles.statValue}>{result.lineCount}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>単語数</span>
          <span className={styles.statValue}>{result.wordCount}</span>
        </div>
      </div>

      <div className={styles.breakdown}>
        <span className={styles.breakdownTitle}>バイト構成</span>
        <div className={styles.breakdownRow}>
          <span className={styles.breakdownLabel}>1バイト文字 (ASCII)</span>
          <span className={styles.breakdownValue}>
            {result.singleByteChars}文字
          </span>
        </div>
        <div className={styles.breakdownRow}>
          <span className={styles.breakdownLabel}>2バイト文字</span>
          <span className={styles.breakdownValue}>
            {result.twoBytechars}文字
          </span>
        </div>
        <div className={styles.breakdownRow}>
          <span className={styles.breakdownLabel}>
            3バイト文字 (日本語等)
          </span>
          <span className={styles.breakdownValue}>
            {result.threeByteChars}文字
          </span>
        </div>
        <div className={styles.breakdownRow}>
          <span className={styles.breakdownLabel}>
            4バイト文字 (絵文字等)
          </span>
          <span className={styles.breakdownValue}>
            {result.fourByteChars}文字
          </span>
        </div>
      </div>
    </div>
  );
}
