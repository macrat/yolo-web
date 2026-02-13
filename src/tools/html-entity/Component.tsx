"use client";

import { useState, useCallback } from "react";
import { convertEntity, type EntityMode } from "./logic";
import styles from "./Component.module.css";

export default function HtmlEntityTool() {
  const [mode, setMode] = useState<EntityMode>("encode");
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
    const result = convertEntity(input, mode);
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

  const handleModeChange = (newMode: EntityMode) => {
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
        <label htmlFor="html-entity-input" className={styles.label}>
          {mode === "encode" ? "テキスト入力" : "HTMLエンティティ入力"}
        </label>
        <textarea
          id="html-entity-input"
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "エスケープするテキストを入力..."
              : "アンエスケープするHTMLエンティティを入力..."
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
        {mode === "encode" ? "エスケープ" : "アンエスケープ"}
      </button>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="html-entity-output" className={styles.label}>
            {mode === "encode" ? "エスケープ結果" : "アンエスケープ結果"}
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
          id="html-entity-output"
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
