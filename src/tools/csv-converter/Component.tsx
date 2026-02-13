"use client";

import { useState, useCallback } from "react";
import { convert, type DataFormat } from "./logic";
import styles from "./Component.module.css";

const FORMAT_LABELS: Record<DataFormat, string> = {
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  markdown: "Markdown表",
};

const SAMPLE_CSV = `名前,年齢,都市
田中太郎,30,東京
佐藤花子,25,大阪
"鈴木, 一郎",40,名古屋`;

export default function CsvConverterTool() {
  const [input, setInput] = useState(SAMPLE_CSV);
  const [fromFormat, setFromFormat] = useState<DataFormat>("csv");
  const [toFormat, setToFormat] = useState<DataFormat>("json");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    setError("");
    setCopied(false);
    const result = convert(input, fromFormat, toFormat);
    if (result.success) {
      setOutput(result.output);
    } else {
      setError(result.error || "変換に失敗しました");
      setOutput("");
    }
  }, [input, fromFormat, toFormat]);

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
      <div className={styles.formatRow}>
        <div className={styles.field}>
          <label htmlFor="csv-from-format" className={styles.label}>
            入力形式
          </label>
          <select
            id="csv-from-format"
            className={styles.formatSelect}
            value={fromFormat}
            onChange={(e) => setFromFormat(e.target.value as DataFormat)}
          >
            {(Object.keys(FORMAT_LABELS) as DataFormat[]).map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABELS[fmt]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="csv-to-format" className={styles.label}>
            出力形式
          </label>
          <select
            id="csv-to-format"
            className={styles.formatSelect}
            value={toFormat}
            onChange={(e) => setToFormat(e.target.value as DataFormat)}
          >
            {(Object.keys(FORMAT_LABELS) as DataFormat[]).map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABELS[fmt]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="csv-input" className={styles.label}>
          入力データ
        </label>
        <textarea
          id="csv-input"
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="変換するデータを入力..."
          rows={10}
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
          <label htmlFor="csv-output" className={styles.label}>
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
          id="csv-output"
          className={styles.textarea}
          value={output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={10}
        />
      </div>
    </div>
  );
}
