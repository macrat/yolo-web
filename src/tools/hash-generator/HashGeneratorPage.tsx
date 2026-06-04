"use client";

import { useState, useCallback } from "react";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  generateHash,
  HASH_ALGORITHMS,
  type HashAlgorithm,
  type OutputFormat,
} from "./logic";
import styles from "./HashGeneratorPage.module.css";

interface HashResult {
  algorithm: HashAlgorithm;
  hash: string;
}

/**
 * HashGeneratorPage — ハッシュ生成ツール本体（単一実装）。
 *
 * SHA-1 / SHA-256 / SHA-384 / SHA-512 の4種類のハッシュ値を一度に生成する。
 * 出力形式は16進数（Hex）または Base64 から選択可能。
 * 各ハッシュ値に個別のコピーボタンを配置する（T-4b 方針: 持ち帰り対象・コピーあり）。
 *
 * C-3 準拠: live region（role="status" aria-live="polite"）には
 * readOnly textarea をラップするのではなく、実テキストノードのサマリを配置する。
 */
export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("hex");
  const [results, setResults] = useState<HashResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // C-3: ライブリージョン用サマリテキスト
  const [statusSummary, setStatusSummary] = useState("");
  const { copy, copiedKey } = useCopyToClipboard();

  const handleGenerate = useCallback(async () => {
    setErrorMessage(null);
    if (!input) {
      setResults([]);
      setStatusSummary("");
      return;
    }
    try {
      const hashes = await Promise.all(
        HASH_ALGORITHMS.map(async (algo) => ({
          algorithm: algo,
          hash: await generateHash(input, algo, format),
        })),
      );
      setResults(hashes);
      // C-3: 実テキストノードのサマリを live region に設定する
      setStatusSummary(`${hashes.length}件のハッシュ値を生成しました`);
    } catch {
      // Web Crypto API エラーを日本語メッセージに変換する（A-4 準拠）
      setResults([]);
      setStatusSummary("");
      setErrorMessage(
        "ハッシュの計算中にエラーが発生しました。お使いの環境ではこの機能が使用できない可能性があります。",
      );
    }
  }, [input, format]);

  return (
    <div className={styles.container}>
      {/* テキスト入力欄 */}
      <div className={styles.field}>
        <label htmlFor="hash-input" className={styles.label}>
          テキスト入力
        </label>
        <Textarea
          id="hash-input"
          variant="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ハッシュ化するテキストを入力..."
          rows={4}
          spellCheck={false}
        />
      </div>

      {/* コントロール: 出力形式セレクト + 生成ボタン */}
      <div className={styles.controls}>
        <div className={styles.formatControl}>
          <label htmlFor="hash-format" className={styles.controlLabel}>
            出力形式:
          </label>
          <Select
            id="hash-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
          >
            <option value="hex">16進数 (Hex)</option>
            <option value="base64">Base64</option>
          </Select>
        </div>
        <Button variant="primary" onClick={handleGenerate}>
          ハッシュ生成
        </Button>
      </div>

      {/* エラー表示（A-4: 共通部品 ErrorMessage を使用・日本語メッセージ） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* C-3: ライブリージョン - 実テキストノードのサマリを持つ */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {statusSummary}
      </div>

      {/* ハッシュ結果一覧 */}
      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((result) => (
            <div key={result.algorithm} className={styles.resultRow}>
              <span className={styles.algoLabel}>{result.algorithm}</span>
              <code className={styles.hashValue}>{result.hash}</code>
              <Button
                size="small"
                onClick={() => copy(result.hash, result.algorithm)}
                disabled={!result.hash}
                aria-label={
                  copiedKey === result.algorithm
                    ? `${result.algorithm}のハッシュ値: ${COPIED_LABEL}`
                    : `${result.algorithm}のハッシュ値をコピー`
                }
              >
                {copiedKey === result.algorithm ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
