"use client";

import { useState, useCallback, useRef } from "react";
import {
  fileToBase64,
  parseBase64Image,
  formatFileSize,
  type ImageBase64Result,
  type ParsedImage,
} from "./logic";
import styles from "./Component.module.css";

type TabMode = "encode" | "decode";

export default function ImageBase64Tool() {
  const [mode, setMode] = useState<TabMode>("encode");
  const [base64Result, setBase64Result] = useState<ImageBase64Result | null>(
    null,
  );
  const [decodeInput, setDecodeInput] = useState("");
  const [parsedImage, setParsedImage] = useState<ParsedImage | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"base64" | "datauri" | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setBase64Result(null);
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }
    try {
      const result = await fileToBase64(file);
      setBase64Result(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleCopy = useCallback(
    async (text: string, type: "base64" | "datauri") => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // Clipboard API not available
      }
    },
    [],
  );

  const handleDecode = useCallback(() => {
    setError("");
    setParsedImage(null);
    if (!decodeInput.trim()) {
      setError("Base64文字列を入力してください");
      return;
    }
    const parsed = parseBase64Image(decodeInput);
    if (parsed) {
      setParsedImage(parsed);
    } else {
      setError("有効なBase64画像データではありません");
    }
  }, [decodeInput]);

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist" aria-label="変換モード">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "encode"}
          className={`${styles.tab} ${mode === "encode" ? styles.activeTab : ""}`}
          onClick={() => setMode("encode")}
        >
          画像 → Base64
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "decode"}
          className={`${styles.tab} ${mode === "decode" ? styles.activeTab : ""}`}
          onClick={() => setMode("decode")}
        >
          Base64 → 画像
        </button>
      </div>

      {mode === "encode" && (
        <div className={styles.encodePanel}>
          <div
            className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ""}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="画像ファイルを選択またはドラッグ&ドロップ"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
          >
            <p className={styles.dropText}>
              クリックまたはドラッグ&ドロップで画像を選択
            </p>
            <p className={styles.dropSubText}>
              PNG, JPEG, GIF, WebP, SVG対応
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className={styles.fileInput}
              aria-label="画像ファイル選択"
            />
          </div>

          {base64Result && (
            <div className={styles.resultArea}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={base64Result.dataUri}
                alt="プレビュー"
                className={styles.preview}
              />
              <div className={styles.fileInfo}>
                <span>MIMEタイプ: {base64Result.mimeType}</span>
                <span>
                  元サイズ: {formatFileSize(base64Result.originalSize)}
                </span>
                <span>
                  Base64サイズ: {formatFileSize(base64Result.base64Size)}
                </span>
              </div>
              <div className={styles.outputGroup}>
                <div className={styles.outputHeader}>
                  <label htmlFor="base64-output" className={styles.label}>
                    Base64
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(base64Result.base64, "base64")}
                    className={styles.copyButton}
                  >
                    {copied === "base64" ? "コピー済み" : "コピー"}
                  </button>
                </div>
                <textarea
                  id="base64-output"
                  className={styles.textarea}
                  value={base64Result.base64}
                  readOnly
                  rows={4}
                />
              </div>
              <div className={styles.outputGroup}>
                <div className={styles.outputHeader}>
                  <label htmlFor="datauri-output" className={styles.label}>
                    Data URI
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(base64Result.dataUri, "datauri")
                    }
                    className={styles.copyButton}
                  >
                    {copied === "datauri" ? "コピー済み" : "コピー"}
                  </button>
                </div>
                <textarea
                  id="datauri-output"
                  className={styles.textarea}
                  value={base64Result.dataUri}
                  readOnly
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "decode" && (
        <div className={styles.decodePanel}>
          <div className={styles.outputGroup}>
            <label htmlFor="decode-input" className={styles.label}>
              Base64文字列またはData URI
            </label>
            <textarea
              id="decode-input"
              className={styles.textarea}
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="data:image/png;base64,iVBOR... または Base64文字列を貼り付け"
              rows={6}
              spellCheck={false}
            />
          </div>
          <button
            type="button"
            onClick={handleDecode}
            className={styles.button}
          >
            プレビュー
          </button>
          {parsedImage && (
            <div className={styles.resultArea}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={parsedImage.dataUri}
                alt="デコード結果プレビュー"
                className={styles.preview}
              />
              <div className={styles.fileInfo}>
                <span>MIMEタイプ: {parsedImage.mimeType}</span>
              </div>
              <a
                href={parsedImage.dataUri}
                download={`image.${parsedImage.mimeType.split("/")[1]?.replace("+xml", "") || "png"}`}
                className={styles.button}
              >
                ダウンロード
              </a>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
