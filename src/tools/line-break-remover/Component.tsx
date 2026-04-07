"use client";

import { useState, useMemo, useCallback } from "react";
import {
  removeLineBreaks,
  type RemoveMode,
  type SmartPdfJoinStyle,
} from "./logic";
import styles from "./Component.module.css";

export default function LineBreakRemoverTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<RemoveMode>("remove");
  const [mergeConsecutive, setMergeConsecutive] = useState(false);
  const [smartPdfJoinStyle, setSmartPdfJoinStyle] =
    useState<SmartPdfJoinStyle>("remove");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      removeLineBreaks(input, {
        mode,
        mergeConsecutive,
        smartPdfJoinStyle,
      }),
    [input, mode, mergeConsecutive, smartPdfJoinStyle],
  );

  const handleCopy = useCallback(async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [result.output]);

  const handleModeChange = (newMode: RemoveMode) => {
    setMode(newMode);
    setCopied(false);
  };

  return (
    <div className={styles.container}>
      {/* モード選択 */}
      <div
        className={styles.modeSwitch}
        role="radiogroup"
        aria-label="変換モード"
      >
        <button
          type="button"
          className={`${styles.modeButton} ${mode === "remove" ? styles.active : ""}`}
          onClick={() => handleModeChange("remove")}
          role="radio"
          aria-checked={mode === "remove"}
        >
          改行を削除
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === "replace-space" ? styles.active : ""}`}
          onClick={() => handleModeChange("replace-space")}
          role="radio"
          aria-checked={mode === "replace-space"}
        >
          改行をスペースに置換
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === "smart-pdf" ? styles.active : ""}`}
          onClick={() => handleModeChange("smart-pdf")}
          role="radio"
          aria-checked={mode === "smart-pdf"}
        >
          PDFスマートモード
        </button>
      </div>

      {/* オプション（remove/replace-spaceモード用） */}
      {(mode === "remove" || mode === "replace-space") && (
        <div className={styles.optionsRow}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={mergeConsecutive}
              onChange={() => setMergeConsecutive((prev) => !prev)}
            />
            連続する改行を1つにまとめる
          </label>
        </div>
      )}

      {/* オプション（smart-pdfモード用） */}
      {mode === "smart-pdf" && (
        <div className={styles.radioGroup}>
          <span className={styles.radioGroupLabel}>行内改行の処理:</span>
          <label className={styles.radio}>
            <input
              type="radio"
              name="smartPdfJoinStyle"
              value="remove"
              checked={smartPdfJoinStyle === "remove"}
              onChange={() => setSmartPdfJoinStyle("remove")}
            />
            削除する
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              name="smartPdfJoinStyle"
              value="space"
              checked={smartPdfJoinStyle === "space"}
              onChange={() => setSmartPdfJoinStyle("space")}
            />
            スペースに置換
          </label>
        </div>
      )}

      {/* 入力テキストエリア */}
      <div className={styles.field}>
        <label htmlFor="line-break-input" className={styles.label}>
          入力テキスト
        </label>
        <textarea
          id="line-break-input"
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="改行を削除するテキストを入力..."
          rows={8}
          spellCheck={false}
        />
      </div>

      {/* エラーメッセージ */}
      {result.error && (
        <div className={styles.error} role="alert">
          {result.error}
        </div>
      )}

      {/* 処理結果情報 */}
      <div className={styles.resultInfo} role="status" aria-live="polite">
        {input && !result.error
          ? mode === "remove"
            ? `${result.removedCount}件の改行を削除しました`
            : mode === "replace-space"
              ? `${result.removedCount}件の改行をスペースに置換しました`
              : `${result.removedCount}件の改行を処理しました`
          : ""}
      </div>

      {/* 出力テキストエリア */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="line-break-output" className={styles.label}>
            変換結果
          </label>
          {result.output && (
            <button
              type="button"
              onClick={handleCopy}
              className={styles.copyButton}
            >
              {copied ? "コピー済み" : "コピー"}
            </button>
          )}
        </div>
        <textarea
          id="line-break-output"
          className={styles.textarea}
          value={result.output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={8}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
