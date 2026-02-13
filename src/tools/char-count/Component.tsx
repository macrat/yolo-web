"use client";

import { useState } from "react";
import { analyzeText } from "./logic";
import styles from "./Component.module.css";

export default function CharCountTool() {
  const [text, setText] = useState("");
  const result = analyzeText(text);

  return (
    <div className={styles.container}>
      <label htmlFor="char-count-input" className={styles.label}>
        テキストを入力
      </label>
      <textarea
        id="char-count-input"
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここにテキストを入力してください..."
        rows={10}
        aria-describedby="char-count-results"
      />
      <div
        id="char-count-results"
        className={styles.results}
        role="status"
        aria-live="polite"
      >
        <div className={styles.stat}>
          <span className={styles.statLabel}>文字数</span>
          <span className={styles.statValue}>{result.chars}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>文字数（空白除く）</span>
          <span className={styles.statValue}>{result.charsNoSpaces}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>バイト数（UTF-8）</span>
          <span className={styles.statValue}>{result.bytes}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>単語数</span>
          <span className={styles.statValue}>{result.words}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>行数</span>
          <span className={styles.statValue}>{result.lines}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>段落数</span>
          <span className={styles.statValue}>{result.paragraphs}</span>
        </div>
      </div>
    </div>
  );
}
