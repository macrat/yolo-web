"use client";

import { useState, useCallback } from "react";
import { convertKana, type KanaConvertMode } from "./logic";
import styles from "./Component.module.css";

const MODES: { value: KanaConvertMode; label: string }[] = [
  { value: "hiragana-to-katakana", label: "ひらがな → カタカナ" },
  { value: "katakana-to-hiragana", label: "カタカナ → ひらがな" },
  { value: "to-fullwidth-katakana", label: "半角カナ → 全角カナ" },
  { value: "to-halfwidth-katakana", label: "全角カナ → 半角カナ" },
];

export default function KanaConverterTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<KanaConvertMode>("hiragana-to-katakana");
  const [copied, setCopied] = useState(false);

  const output = convertKana(input, mode);

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

  const handleModeChange = (newMode: KanaConvertMode) => {
    setMode(newMode);
    setCopied(false);
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.modeSwitch}
        role="radiogroup"
        aria-label="変換モード"
      >
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            className={`${styles.modeButton} ${mode === m.value ? styles.active : ""}`}
            onClick={() => handleModeChange(m.value)}
            role="radio"
            aria-checked={mode === m.value}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <label htmlFor="kana-input" className={styles.label}>
            入力テキスト
          </label>
          <textarea
            id="kana-input"
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="変換するテキストを入力..."
            rows={8}
            spellCheck={false}
          />
        </div>
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor="kana-output" className={styles.label}>
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
            id="kana-output"
            className={styles.textarea}
            value={output}
            readOnly
            placeholder="結果がここに表示されます"
            rows={8}
            aria-live="polite"
          />
        </div>
      </div>
    </div>
  );
}
