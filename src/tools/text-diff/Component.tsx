"use client";

import { useState, useCallback } from "react";
import { computeDiff, hasDifferences, type DiffMode } from "./logic";
import styles from "./Component.module.css";

export default function TextDiffTool() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [mode, setMode] = useState<DiffMode>("line");
  const [showResult, setShowResult] = useState(false);

  const diffParts = showResult ? computeDiff(oldText, newText, mode) : [];
  const hasDiff = hasDifferences(diffParts);

  const handleCompare = useCallback(() => {
    setShowResult(true);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <label htmlFor="diff-mode" className={styles.label}>
          比較モード:
        </label>
        <select
          id="diff-mode"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as DiffMode);
            setShowResult(false);
          }}
          className={styles.select}
        >
          <option value="line">行単位</option>
          <option value="word">単語単位</option>
          <option value="char">文字単位</option>
        </select>
      </div>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <label htmlFor="diff-old" className={styles.panelLabel}>
            変更前テキスト
          </label>
          <textarea
            id="diff-old"
            className={styles.textarea}
            value={oldText}
            onChange={(e) => {
              setOldText(e.target.value);
              setShowResult(false);
            }}
            placeholder="変更前のテキストを入力..."
            rows={10}
            spellCheck={false}
          />
        </div>
        <div className={styles.panel}>
          <label htmlFor="diff-new" className={styles.panelLabel}>
            変更後テキスト
          </label>
          <textarea
            id="diff-new"
            className={styles.textarea}
            value={newText}
            onChange={(e) => {
              setNewText(e.target.value);
              setShowResult(false);
            }}
            placeholder="変更後のテキストを入力..."
            rows={10}
            spellCheck={false}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleCompare}
        className={styles.compareButton}
      >
        比較する
      </button>
      {showResult && (
        <div className={styles.result}>
          <h3 className={styles.resultHeading}>差分結果</h3>
          {!hasDiff ? (
            <p className={styles.noDiff}>テキストに差分はありません。</p>
          ) : (
            <pre
              className={styles.diffOutput}
              role="region"
              aria-label="Diff result"
            >
              {diffParts.map((part, i) => (
                <span
                  key={i}
                  className={
                    part.added
                      ? styles.added
                      : part.removed
                        ? styles.removed
                        : styles.unchanged
                  }
                >
                  {part.value}
                </span>
              ))}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
