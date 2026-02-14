"use client";

import { useState, useCallback } from "react";
import { formatSql, minifySql } from "./logic";
import styles from "./Component.module.css";

type IndentType = "2" | "4" | "tab";

function getIndentString(indentType: IndentType): string {
  switch (indentType) {
    case "2":
      return "  ";
    case "4":
      return "    ";
    case "tab":
      return "\t";
  }
}

export default function SqlFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  const [uppercase, setUppercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleFormat = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      setOutput(
        formatSql(input, {
          indent: getIndentString(indent),
          uppercase,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setOutput("");
    }
  }, [input, indent, uppercase]);

  const handleMinify = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      setOutput(minifySql(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setOutput("");
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [output]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.options}>
          <div className={styles.indentControl}>
            <label htmlFor="sql-indent-select" className={styles.controlLabel}>
              インデント:
            </label>
            <select
              id="sql-indent-select"
              value={indent}
              onChange={(e) => setIndent(e.target.value as IndentType)}
              className={styles.select}
              aria-label="インデントの種類を選択"
            >
              <option value="2">2スペース</option>
              <option value="4">4スペース</option>
              <option value="tab">タブ</option>
            </select>
          </div>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className={styles.checkbox}
              aria-label="キーワードを大文字にする"
            />
            キーワード大文字
          </label>
        </div>
        <div className={styles.buttons}>
          <button
            onClick={handleFormat}
            className={styles.button}
            type="button"
            aria-label="SQLを整形する"
          >
            整形
          </button>
          <button
            onClick={handleMinify}
            className={styles.buttonSecondary}
            type="button"
            aria-label="SQLを圧縮する"
          >
            圧縮
          </button>
        </div>
      </div>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <label htmlFor="sql-input" className={styles.panelLabel}>
            入力
          </label>
          <textarea
            id="sql-input"
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SELECT id, name, email FROM users WHERE status = 'active' AND created_at > '2024-01-01' ORDER BY name ASC;"
            spellCheck={false}
            aria-label="SQL入力"
          />
        </div>
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor="sql-output" className={styles.panelLabel}>
              出力
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className={styles.copyButton}
                type="button"
                aria-label="結果をコピーする"
              >
                {copied ? "コピー済み" : "コピー"}
              </button>
            )}
          </div>
          <textarea
            id="sql-output"
            className={styles.textarea}
            value={output}
            readOnly
            placeholder="結果がここに表示されます"
            aria-label="SQL出力"
          />
        </div>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
