"use client";

import { useState, useCallback } from "react";
import {
  generateHash,
  HASH_ALGORITHMS,
  type HashAlgorithm,
  type OutputFormat,
} from "./logic";
import styles from "./Component.module.css";

interface HashResult {
  algorithm: HashAlgorithm;
  hash: string;
}

export default function HashGeneratorTool() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("hex");
  const [results, setResults] = useState<HashResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!input) {
      setResults([]);
      return;
    }
    const hashes = await Promise.all(
      HASH_ALGORITHMS.map(async (algo) => ({
        algorithm: algo,
        hash: await generateHash(input, algo, format),
      })),
    );
    setResults(hashes);
  }, [input, format]);

  const handleCopy = useCallback(async (hash: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label htmlFor="hash-input" className={styles.label}>
          テキスト入力
        </label>
        <textarea
          id="hash-input"
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ハッシュ化するテキストを入力..."
          rows={4}
          spellCheck={false}
        />
      </div>
      <div className={styles.controls}>
        <div className={styles.formatControl}>
          <label htmlFor="hash-format" className={styles.controlLabel}>
            出力形式:
          </label>
          <select
            id="hash-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
            className={styles.select}
          >
            <option value="hex">16進数 (Hex)</option>
            <option value="base64">Base64</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className={styles.generateButton}
        >
          ハッシュ生成
        </button>
      </div>
      {results.length > 0 && (
        <div className={styles.results} role="region" aria-label="Hash results">
          {results.map((result, index) => (
            <div key={result.algorithm} className={styles.resultRow}>
              <span className={styles.algoLabel}>{result.algorithm}</span>
              <code className={styles.hashValue}>{result.hash}</code>
              <button
                type="button"
                onClick={() => handleCopy(result.hash, index)}
                className={styles.copyButton}
              >
                {copiedIndex === index ? "コピー済み" : "コピー"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
