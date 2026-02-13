"use client";

import { useState, useMemo, useCallback } from "react";
import { replaceText, type ReplaceOptions } from "./logic";
import styles from "./Component.module.css";

export default function TextReplaceTool() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [replacement, setReplacement] = useState("");
  const [options, setOptions] = useState<ReplaceOptions>({
    useRegex: false,
    caseSensitive: true,
    globalReplace: true,
  });
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => replaceText(input, search, replacement, options),
    [input, search, replacement, options],
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

  const handleOptionChange = (key: keyof ReplaceOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    setCopied(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label htmlFor="replace-input" className={styles.label}>
          入力テキスト
        </label>
        <textarea
          id="replace-input"
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="置換するテキストを入力..."
          rows={8}
          spellCheck={false}
        />
      </div>
      <div className={styles.searchRow}>
        <div className={styles.field}>
          <label htmlFor="replace-search" className={styles.label}>
            検索文字列
          </label>
          <input
            id="replace-search"
            type="text"
            className={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              options.useRegex ? "正規表現パターン..." : "検索する文字列..."
            }
            spellCheck={false}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="replace-replacement" className={styles.label}>
            置換文字列
          </label>
          <input
            id="replace-replacement"
            type="text"
            className={styles.input}
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="置換後の文字列..."
            spellCheck={false}
          />
        </div>
      </div>
      <div className={styles.optionsRow}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={options.useRegex}
            onChange={() => handleOptionChange("useRegex")}
          />
          正規表現
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={options.caseSensitive}
            onChange={() => handleOptionChange("caseSensitive")}
          />
          大文字小文字を区別
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={options.globalReplace}
            onChange={() => handleOptionChange("globalReplace")}
          />
          すべて置換
        </label>
      </div>
      {options.useRegex && (
        <div className={styles.warning} role="note">
          複雑な正規表現パターンはブラウザがフリーズする可能性があります。
        </div>
      )}
      {result.error && (
        <div className={styles.error} role="alert">
          {result.error}
        </div>
      )}
      <div className={styles.resultInfo} role="status" aria-live="polite">
        {search ? `${result.count}件置換しました` : ""}
      </div>
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="replace-output" className={styles.label}>
            置換結果
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
          id="replace-output"
          className={styles.textarea}
          value={result.output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={8}
        />
      </div>
    </div>
  );
}
