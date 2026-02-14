"use client";

import { useState } from "react";
import { validateEmail, type EmailValidationResult } from "./logic";
import styles from "./Component.module.css";

export default function EmailValidatorTool() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<EmailValidationResult | null>(null);

  const handleChange = (value: string) => {
    setEmail(value);
    if (value.trim()) {
      setResult(validateEmail(value));
    } else {
      setResult(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label htmlFor="email-input" className={styles.label}>
          メールアドレスを入力
        </label>
        <input
          id="email-input"
          type="text"
          className={styles.input}
          value={email}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="user@example.com"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="email-result"
        />
      </div>
      {result && (
        <div id="email-result" className={styles.results} role="status">
          <div
            className={`${styles.badge} ${result.valid ? styles.valid : styles.invalid}`}
          >
            {result.valid ? "有効" : "無効"}
          </div>
          <div className={styles.analysis}>
            <div className={styles.analysisItem}>
              <span className={styles.analysisLabel}>ローカルパート:</span>
              <span className={styles.analysisValue}>
                {result.localPart || "(空)"}
              </span>
            </div>
            <div className={styles.analysisItem}>
              <span className={styles.analysisLabel}>ドメイン:</span>
              <span className={styles.analysisValue}>
                {result.domain || "(空)"}
              </span>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className={styles.errorList} role="alert">
              <h3 className={styles.listTitle}>エラー</h3>
              <ul className={styles.list}>
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          {result.warnings.length > 0 && (
            <div className={styles.warningList}>
              <h3 className={styles.listTitle}>警告</h3>
              <ul className={styles.list}>
                {result.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestions.length > 0 && (
            <div className={styles.suggestionList}>
              <h3 className={styles.listTitle}>候補</h3>
              <ul className={styles.list}>
                {result.suggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
