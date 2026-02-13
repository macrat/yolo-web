"use client";

import { useState, useCallback } from "react";
import { convert, type ConvertMode, type ConvertOptions } from "./logic";
import styles from "./Component.module.css";

export default function FullwidthConverterTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ConvertMode>("toHalfwidth");
  const [options, setOptions] = useState<ConvertOptions>({
    alphanumeric: true,
    katakana: true,
    symbol: true,
  });
  const [copied, setCopied] = useState(false);

  const output = convert(input, mode, options);

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

  const handleModeChange = (newMode: ConvertMode) => {
    setMode(newMode);
    setCopied(false);
  };

  const handleOptionChange = (key: keyof ConvertOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    setCopied(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.modeSwitch} role="radiogroup" aria-label="Mode">
        <button
          type="button"
          className={`${styles.modeButton} ${mode === "toHalfwidth" ? styles.active : ""}`}
          onClick={() => handleModeChange("toHalfwidth")}
          role="radio"
          aria-checked={mode === "toHalfwidth"}
        >
          半角に変換
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === "toFullwidth" ? styles.active : ""}`}
          onClick={() => handleModeChange("toFullwidth")}
          role="radio"
          aria-checked={mode === "toFullwidth"}
        >
          全角に変換
        </button>
      </div>
      <div className={styles.optionsRow}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={options.alphanumeric}
            onChange={() => handleOptionChange("alphanumeric")}
          />
          英数字
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={options.katakana}
            onChange={() => handleOptionChange("katakana")}
          />
          カタカナ
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={options.symbol}
            onChange={() => handleOptionChange("symbol")}
          />
          記号・スペース
        </label>
      </div>
      <div className={styles.field}>
        <label htmlFor="fullwidth-input" className={styles.label}>
          入力テキスト
        </label>
        <textarea
          id="fullwidth-input"
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="変換するテキストを入力..."
          rows={6}
          spellCheck={false}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="fullwidth-output" className={styles.label}>
            変換結果
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
          id="fullwidth-output"
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
