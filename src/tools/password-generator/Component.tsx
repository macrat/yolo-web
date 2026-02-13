"use client";

import { useState, useCallback } from "react";
import {
  generatePassword,
  evaluateStrength,
  DEFAULT_OPTIONS,
  type PasswordOptions,
  type PasswordStrength,
} from "./logic";
import styles from "./Component.module.css";

const strengthLabels: Record<PasswordStrength, string> = {
  weak: "弱い",
  fair: "普通",
  good: "良い",
  strong: "強い",
};

const strengthColors: Record<PasswordStrength, string> = {
  weak: "#dc3545",
  fair: "#fd7e14",
  good: "#28a745",
  strong: "#007bff",
};

export default function PasswordGeneratorTool() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const strength = evaluateStrength(options);

  const handleGenerate = useCallback(() => {
    setCopied(false);
    const pw = generatePassword(options);
    setPassword(pw);
  }, [options]);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [password]);

  const updateOption = <K extends keyof PasswordOptions>(
    key: K,
    value: PasswordOptions[K],
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.options}>
        <div className={styles.lengthControl}>
          <label htmlFor="pw-length" className={styles.label}>
            文字数: {options.length}
          </label>
          <input
            id="pw-length"
            type="range"
            min={8}
            max={128}
            value={options.length}
            onChange={(e) =>
              updateOption("length", parseInt(e.target.value, 10))
            }
            className={styles.slider}
          />
        </div>
        <div className={styles.checkboxes}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) => updateOption("uppercase", e.target.checked)}
            />
            大文字 (A-Z)
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={(e) => updateOption("lowercase", e.target.checked)}
            />
            小文字 (a-z)
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={options.digits}
              onChange={(e) => updateOption("digits", e.target.checked)}
            />
            数字 (0-9)
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={(e) => updateOption("symbols", e.target.checked)}
            />
            記号 (!@#$...)
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={(e) =>
                updateOption("excludeAmbiguous", e.target.checked)
              }
            />
            紛らわしい文字を除外 (O/0, I/l/1)
          </label>
        </div>
      </div>
      <div className={styles.strengthBar}>
        <span className={styles.strengthLabel}>強度:</span>
        <span
          className={styles.strengthValue}
          style={{ color: strengthColors[strength] }}
        >
          {strengthLabels[strength]}
        </span>
        <div className={styles.strengthMeter}>
          <div
            className={styles.strengthFill}
            style={{
              width:
                strength === "weak"
                  ? "25%"
                  : strength === "fair"
                    ? "50%"
                    : strength === "good"
                      ? "75%"
                      : "100%",
              backgroundColor: strengthColors[strength],
            }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleGenerate}
        className={styles.generateButton}
      >
        パスワード生成
      </button>
      {password && (
        <div className={styles.result}>
          <code className={styles.password}>{password}</code>
          <button
            type="button"
            onClick={handleCopy}
            className={styles.copyButton}
          >
            {copied ? "コピー済み" : "コピー"}
          </button>
        </div>
      )}
    </div>
  );
}
