"use client";

import { useState, useCallback } from "react";
import { encodeBase64, decodeBase64 } from "./logic";
import styles from "./Component.module.css";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
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
      mode === "encode" ? encodeBase64(input) : decodeBase64(input);
    if (result.success) {
      setOutput(result.output);
    } else {
      setError(result.error || "Conversion failed");
      setOutput("");
    }
  }, [input, mode]);

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

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.modeSwitch} role="radiogroup" aria-label="Mode">
        <button
          type="button"
          className={`${styles.modeButton} ${mode === "encode" ? styles.active : ""}`}
          onClick={() => handleModeChange("encode")}
          role="radio"
          aria-checked={mode === "encode"}
        >
          エンコード
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === "decode" ? styles.active : ""}`}
          onClick={() => handleModeChange("decode")}
          role="radio"
          aria-checked={mode === "decode"}
        >
          デコード
        </button>
      </div>
      <div className={styles.field}>
        <label htmlFor="base64-input" className={styles.label}>
          {mode === "encode" ? "テキスト入力" : "Base64入力"}
        </label>
        <textarea
          id="base64-input"
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "エンコードするテキストを入力..."
              : "デコードするBase64文字列を入力..."
          }
          rows={6}
          spellCheck={false}
        />
      </div>
      <button
        type="button"
        onClick={handleConvert}
        className={styles.convertButton}
      >
        {mode === "encode" ? "エンコード" : "デコード"}
      </button>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="base64-output" className={styles.label}>
            {mode === "encode" ? "Base64出力" : "テキスト出力"}
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
          id="base64-output"
          className={styles.textarea}
          value={output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={6}
        />
      </div>
    </div>
  );
}
