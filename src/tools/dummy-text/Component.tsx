"use client";

import { useState, useMemo, useCallback } from "react";
import {
  generateText,
  countGeneratedWords,
  countGeneratedChars,
  type TextLanguage,
} from "./logic";
import styles from "./Component.module.css";

export default function DummyTextTool() {
  const [language, setLanguage] = useState<TextLanguage>("lorem");
  const [paragraphs, setParagraphs] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(5);
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () => generateText({ language, paragraphs, sentencesPerParagraph }),
    [language, paragraphs, sentencesPerParagraph],
  );

  const wordCount = useMemo(() => countGeneratedWords(output), [output]);
  const charCount = useMemo(() => countGeneratedChars(output), [output]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [output]);

  const handleLanguageChange = (newLanguage: TextLanguage) => {
    setLanguage(newLanguage);
    setCopied(false);
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.modeSwitch}
        role="radiogroup"
        aria-label="Language"
      >
        <button
          type="button"
          className={`${styles.modeButton} ${language === "lorem" ? styles.active : ""}`}
          onClick={() => handleLanguageChange("lorem")}
          role="radio"
          aria-checked={language === "lorem"}
        >
          Lorem Ipsum
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${language === "japanese" ? styles.active : ""}`}
          onClick={() => handleLanguageChange("japanese")}
          role="radio"
          aria-checked={language === "japanese"}
        >
          日本語
        </button>
      </div>

      <div className={styles.optionsRow}>
        <div className={styles.numberField}>
          <label htmlFor="dummy-paragraphs" className={styles.numberLabel}>
            段落数
          </label>
          <input
            id="dummy-paragraphs"
            type="number"
            min={1}
            max={20}
            value={paragraphs}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setParagraphs(v);
            }}
            className={styles.numberInput}
          />
        </div>
        <div className={styles.numberField}>
          <label htmlFor="dummy-sentences" className={styles.numberLabel}>
            段落あたりの文数
          </label>
          <input
            id="dummy-sentences"
            type="number"
            min={1}
            max={20}
            value={sentencesPerParagraph}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setSentencesPerParagraph(v);
            }}
            className={styles.numberInput}
          />
        </div>
      </div>

      <div className={styles.infoBar} role="status">
        <span>{paragraphs}段落</span>
        <span>{charCount.toLocaleString()}文字</span>
        <span>{wordCount.toLocaleString()}単語</span>
      </div>

      <div>
        <div className={styles.outputHeader}>
          <label htmlFor="dummy-output" className={styles.label}>
            生成結果
          </label>
          <button
            type="button"
            onClick={handleCopy}
            className={styles.copyButton}
          >
            {copied ? "コピー済み" : "コピー"}
          </button>
        </div>
        <textarea
          id="dummy-output"
          className={styles.textarea}
          value={output}
          readOnly
          rows={12}
        />
      </div>
    </div>
  );
}
