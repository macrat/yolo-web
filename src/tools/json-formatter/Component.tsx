"use client";

import { useState, useCallback } from "react";
import { formatJson, minifyJson, validateJson, type IndentType } from "./logic";
import styles from "./Component.module.css";

export default function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  const [copied, setCopied] = useState(false);

  const handleFormat = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      setOutput(formatJson(input, indent));
    } catch {
      const result = validateJson(input);
      setError(result.error || "Invalid JSON");
      setOutput("");
    }
  }, [input, indent]);

  const handleMinify = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      setOutput(minifyJson(input));
    } catch {
      const result = validateJson(input);
      setError(result.error || "Invalid JSON");
      setOutput("");
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    setCopied(false);
    if (!input.trim()) {
      setError("");
      setOutput("");
      return;
    }
    const result = validateJson(input);
    if (result.valid) {
      setError("");
      setOutput("Valid JSON");
    } else {
      setError(result.error || "Invalid JSON");
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
        <div className={styles.indentControl}>
          <label htmlFor="indent-select" className={styles.controlLabel}>
            インデント:
          </label>
          <select
            id="indent-select"
            value={indent}
            onChange={(e) => setIndent(e.target.value as IndentType)}
            className={styles.select}
          >
            <option value="2">2スペース</option>
            <option value="4">4スペース</option>
            <option value="tab">タブ</option>
          </select>
        </div>
        <div className={styles.buttons}>
          <button
            onClick={handleFormat}
            className={styles.button}
            type="button"
          >
            整形
          </button>
          <button
            onClick={handleMinify}
            className={styles.button}
            type="button"
          >
            圧縮
          </button>
          <button
            onClick={handleValidate}
            className={styles.button}
            type="button"
          >
            検証
          </button>
        </div>
      </div>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <label htmlFor="json-input" className={styles.panelLabel}>
            入力
          </label>
          <textarea
            id="json-input"
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            spellCheck={false}
          />
        </div>
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor="json-output" className={styles.panelLabel}>
              出力
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className={styles.copyButton}
                type="button"
              >
                {copied ? "コピー済み" : "コピー"}
              </button>
            )}
          </div>
          <textarea
            id="json-output"
            className={styles.textarea}
            value={output}
            readOnly
            placeholder="結果がここに表示されます"
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
