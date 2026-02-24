"use client";

import { useState } from "react";
import { useRegexWorker } from "./useRegexWorker";
import styles from "./Component.module.css";

const FLAG_OPTIONS = [
  { flag: "g", label: "g (全体)", description: "全てのマッチを検索" },
  { flag: "i", label: "i (大小無視)", description: "大文字小文字を区別しない" },
  { flag: "m", label: "m (複数行)", description: "^/$を各行に適用" },
  { flag: "s", label: "s (dotAll)", description: ".が改行にもマッチ" },
];

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [replacement, setReplacement] = useState("");
  const [showReplace, setShowReplace] = useState(false);

  const { matchResult, replaceResult, isProcessing } = useRegexWorker({
    pattern,
    flags,
    testString,
    replacement,
    showReplace,
  });

  const toggleFlag = (flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, "") : prev + flag,
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.patternRow}>
        <span className={styles.slash}>/</span>
        <input
          type="text"
          className={styles.patternInput}
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="正規表現パターン"
          spellCheck={false}
          aria-label="Regex pattern"
        />
        <span className={styles.slash}>/</span>
        <span className={styles.flagsDisplay}>{flags}</span>
      </div>
      <div className={styles.flagsRow}>
        {FLAG_OPTIONS.map((opt) => (
          <label
            key={opt.flag}
            className={styles.flagLabel}
            title={opt.description}
          >
            <input
              type="checkbox"
              checked={flags.includes(opt.flag)}
              onChange={() => toggleFlag(opt.flag)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <div className={styles.field}>
        <label htmlFor="regex-test-string" className={styles.label}>
          テスト文字列
        </label>
        <textarea
          id="regex-test-string"
          className={styles.textarea}
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="テストするテキストを入力..."
          rows={6}
          spellCheck={false}
        />
      </div>
      {isProcessing && (
        <div className={styles.processing} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          処理中...
        </div>
      )}
      {!isProcessing && matchResult?.error && (
        <div className={styles.error} role="alert">
          {matchResult.error}
        </div>
      )}
      {!isProcessing &&
        matchResult?.success &&
        matchResult.matches.length > 0 && (
          <div className={styles.matchInfo} role="status">
            <h3 className={styles.matchHeading}>
              マッチ結果: {matchResult.matches.length}件
            </h3>
            <div className={styles.matchList}>
              {matchResult.matches.slice(0, 50).map((m, i) => (
                <div key={i} className={styles.matchItem}>
                  <span className={styles.matchIndex}>#{i + 1}</span>
                  <code className={styles.matchText}>{m.match}</code>
                  <span className={styles.matchPos}>位置: {m.index}</span>
                  {m.groups.length > 0 && (
                    <span className={styles.matchGroups}>
                      グループ:{" "}
                      {m.groups.map((g, gi) => `$${gi + 1}="${g}"`).join(", ")}
                    </span>
                  )}
                </div>
              ))}
              {matchResult.matches.length > 50 && (
                <p className={styles.truncated}>
                  ...他 {matchResult.matches.length - 50} 件のマッチ
                </p>
              )}
            </div>
          </div>
        )}
      {!isProcessing &&
        matchResult?.success &&
        pattern &&
        matchResult.matches.length === 0 &&
        testString && <p className={styles.noMatch}>マッチなし</p>}
      <div className={styles.replaceSection}>
        <button
          type="button"
          onClick={() => setShowReplace(!showReplace)}
          className={styles.toggleButton}
        >
          {showReplace ? "置換を非表示" : "置換を表示"}
        </button>
        {showReplace && (
          <>
            <div className={styles.field}>
              <label htmlFor="regex-replacement" className={styles.label}>
                置換文字列
              </label>
              <input
                id="regex-replacement"
                type="text"
                className={styles.replaceInput}
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="置換後の文字列..."
                spellCheck={false}
              />
            </div>
            {!isProcessing && replaceResult?.success && (
              <div className={styles.field}>
                <span className={styles.label}>置換結果</span>
                <pre className={styles.replaceOutput}>
                  {replaceResult.output}
                </pre>
              </div>
            )}
            {!isProcessing && replaceResult?.error && (
              <div className={styles.error} role="alert">
                {replaceResult.error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
