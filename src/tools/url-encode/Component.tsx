"use client";

import { useState, useCallback } from "react";
import { encodeUrl, decodeUrl, type EncodeMode } from "./logic";
import styles from "./Component.module.css";

type Direction = "encode" | "decode";

export default function UrlEncodeTool() {
  const [direction, setDirection] = useState<Direction>("encode");
  const [mode, setMode] = useState<EncodeMode>("component");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input) {
      setOutput("");
      return;
    }
    const result =
      direction === "encode" ? encodeUrl(input, mode) : decodeUrl(input, mode);
    if (result.success) {
      setOutput(result.output);
    } else {
      setError(result.error || "Conversion failed");
      setOutput("");
    }
  }, [input, direction, mode]);

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
        <div
          className={styles.modeSwitch}
          role="radiogroup"
          aria-label="Direction"
        >
          <button
            type="button"
            className={`${styles.modeButton} ${direction === "encode" ? styles.active : ""}`}
            onClick={() => {
              setDirection("encode");
              setOutput("");
              setError("");
            }}
            role="radio"
            aria-checked={direction === "encode"}
          >
            エンコード
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${direction === "decode" ? styles.active : ""}`}
            onClick={() => {
              setDirection("decode");
              setOutput("");
              setError("");
            }}
            role="radio"
            aria-checked={direction === "decode"}
          >
            デコード
          </button>
        </div>
        <div className={styles.encodeMode}>
          <label htmlFor="encode-mode" className={styles.label}>
            モード:
          </label>
          <select
            id="encode-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as EncodeMode)}
            className={styles.select}
          >
            <option value="component">コンポーネント（パラメータ用）</option>
            <option value="full">URL全体</option>
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="url-input" className={styles.label}>
          入力
        </label>
        <textarea
          id="url-input"
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            direction === "encode"
              ? "エンコードするテキストを入力..."
              : "デコードするURL文字列を入力..."
          }
          rows={4}
          spellCheck={false}
        />
      </div>
      <button
        type="button"
        onClick={handleConvert}
        className={styles.convertButton}
      >
        変換
      </button>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="url-output" className={styles.label}>
            出力
          </label>
          {output && (
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
          id="url-output"
          className={styles.textarea}
          value={output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={4}
        />
      </div>
    </div>
  );
}
