"use client";

import { useState, useCallback } from "react";
import { generateQrCode, type ErrorCorrectionLevel } from "./logic";
import styles from "./Component.module.css";

export default function QrCodeTool() {
  const [input, setInput] = useState("");
  const [errorCorrection, setErrorCorrection] =
    useState<ErrorCorrectionLevel>("M");
  const [svgTag, setSvgTag] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setSvgTag("");
      setDataUrl("");
      return;
    }
    const result = generateQrCode(input, errorCorrection);
    if (result.success) {
      setSvgTag(result.svgTag);
      setDataUrl(result.dataUrl);
    } else {
      setError(result.error || "Generation failed");
      setSvgTag("");
      setDataUrl("");
    }
  }, [input, errorCorrection]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qrcode.png";
    link.click();
  }, [dataUrl]);

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label htmlFor="qr-input" className={styles.label}>
          テキストまたはURL
        </label>
        <textarea
          id="qr-input"
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="QRコードにするテキストやURLを入力..."
          rows={3}
          spellCheck={false}
        />
      </div>
      <div className={styles.controls}>
        <div className={styles.ecControl}>
          <label htmlFor="qr-ec" className={styles.controlLabel}>
            エラー訂正:
          </label>
          <select
            id="qr-ec"
            value={errorCorrection}
            onChange={(e) =>
              setErrorCorrection(e.target.value as ErrorCorrectionLevel)
            }
            className={styles.select}
          >
            <option value="L">低 (L: 7%)</option>
            <option value="M">中 (M: 15%)</option>
            <option value="Q">高 (Q: 25%)</option>
            <option value="H">最高 (H: 30%)</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className={styles.generateButton}
        >
          QRコード生成
        </button>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      {svgTag && (
        <div className={styles.result}>
          <div
            className={styles.qrImage}
            dangerouslySetInnerHTML={{ __html: svgTag }}
            role="img"
            aria-label="Generated QR code"
          />
          <button
            type="button"
            onClick={handleDownload}
            className={styles.downloadButton}
          >
            PNG形式でダウンロード
          </button>
        </div>
      )}
    </div>
  );
}
