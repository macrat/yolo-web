"use client";

import { useState, useMemo } from "react";
import { computeDiff, hasDifferences, type DiffMode } from "./logic";
import styles from "./Component.module.css";

export default function TextDiffTool() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [mode, setMode] = useState<DiffMode>("line");

  // §論点 2-D 案 A 採択: 即時計算化（cycle-210 text-replace 同型 / useMemo で依存値変化に応じて派生計算）
  const diffParts = useMemo(
    () => computeDiff(oldText, newText, mode),
    [oldText, newText, mode],
  );
  const hasDiff = hasDifferences(diffParts);

  // サマリ status 欄用のモード別単位文字列（§論点 MINOR-2 visitor + MINOR-1 impl r4 統合）
  const modeUnit = useMemo(() => {
    switch (mode) {
      case "line":
        return "行";
      case "word":
        return "単語";
      case "char":
        return "文字";
    }
  }, [mode]);

  // 追加・削除件数を別カウント（計画書完成条件: (b) added 件数 + removed 件数を別カウント）
  const addedCount = useMemo(
    () => diffParts.filter((p) => p.added).length,
    [diffParts],
  );
  const removedCount = useMemo(
    () => diffParts.filter((p) => p.removed).length,
    [diffParts],
  );

  const summaryText = hasDiff
    ? `+${addedCount} ${modeUnit} / −${removedCount} ${modeUnit}`
    : "差分なし";

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
            }}
            placeholder="変更後のテキストを入力..."
            rows={10}
            spellCheck={false}
          />
        </div>
      </div>
      {/* サマリ status 欄: 短文 1 行のみ aria-live="polite" を付与（§論点 13 M1'' / cycle-213 (ζ) 引用）
       * 長文 <pre> 差分結果欄には aria-live を付けない（長文の連続アナウンス回避） */}
      <div
        role="status"
        aria-live="polite"
        aria-label="差分サマリ"
        className={styles.summary}
      >
        {summaryText}
      </div>
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
    </div>
  );
}
