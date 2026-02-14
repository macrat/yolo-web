"use client";

import { useState, useCallback, useRef } from "react";
import {
  calculateDimensions,
  calculateDimensionsFromPercent,
  formatFileSize,
  getOutputMimeType,
  type ImageInfo,
} from "./logic";
import styles from "./Component.module.css";

type ResizeMode = "dimensions" | "percent";

interface ResizedResult {
  dataUrl: string;
  width: number;
  height: number;
  fileSize: number;
  fileName: string;
}

export default function ImageResizerTool() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resizeMode, setResizeMode] = useState<ResizeMode>("dimensions");
  const [targetWidth, setTargetWidth] = useState<string>("");
  const [targetHeight, setTargetHeight] = useState<string>("");
  const [percent, setPercent] = useState<string>("100");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState("image/png");
  const [quality, setQuality] = useState(80);
  const [result, setResult] = useState<ResizedResult | null>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileNameRef = useRef<string>("");

  const handleFile = useCallback((file: File) => {
    setError("");
    setResult(null);
    setImageInfo(null);
    setImageSrc(null);

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズが20MBを超えています");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    fileNameRef.current = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.naturalWidth,
          height: img.naturalHeight,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
        setImageSrc(dataUrl);
        setTargetWidth(String(img.naturalWidth));
        setTargetHeight(String(img.naturalHeight));
        setPercent("100");
      };
      img.onerror = () => {
        setError("画像の読み込みに失敗しました");
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
    };
    reader.readAsDataURL(file);
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

  const handleWidthChange = useCallback(
    (value: string) => {
      setTargetWidth(value);
      if (maintainAspectRatio && imageInfo && value) {
        const w = parseInt(value, 10);
        if (!isNaN(w) && w > 0) {
          const dims = calculateDimensions(
            imageInfo.width,
            imageInfo.height,
            w,
            null,
            true,
          );
          setTargetHeight(String(dims.height));
        }
      }
    },
    [maintainAspectRatio, imageInfo],
  );

  const handleHeightChange = useCallback(
    (value: string) => {
      setTargetHeight(value);
      if (maintainAspectRatio && imageInfo && value) {
        const h = parseInt(value, 10);
        if (!isNaN(h) && h > 0) {
          const dims = calculateDimensions(
            imageInfo.width,
            imageInfo.height,
            null,
            h,
            true,
          );
          setTargetWidth(String(dims.width));
        }
      }
    },
    [maintainAspectRatio, imageInfo],
  );

  const handleResize = useCallback(() => {
    if (!imageSrc || !imageInfo) return;
    setError("");
    setResult(null);

    let newWidth: number;
    let newHeight: number;

    if (resizeMode === "percent") {
      const p = parseInt(percent, 10);
      if (isNaN(p) || p < 1 || p > 1000) {
        setError("パーセントは1〜1000の範囲で指定してください");
        return;
      }
      const dims = calculateDimensionsFromPercent(
        imageInfo.width,
        imageInfo.height,
        p,
      );
      newWidth = dims.width;
      newHeight = dims.height;
    } else {
      const w = parseInt(targetWidth, 10);
      const h = parseInt(targetHeight, 10);
      if (isNaN(w) || w < 1) {
        setError("幅を1以上の整数で指定してください");
        return;
      }
      if (isNaN(h) || h < 1) {
        setError("高さを1以上の整数で指定してください");
        return;
      }
      const dims = calculateDimensions(
        imageInfo.width,
        imageInfo.height,
        w,
        h,
        maintainAspectRatio,
      );
      newWidth = dims.width;
      newHeight = dims.height;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas APIが利用できません");
        return;
      }
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const mime = getOutputMimeType(outputFormat);
      const qualityValue = mime === "image/png" ? undefined : quality / 100;
      const dataUrl = canvas.toDataURL(mime, qualityValue);

      // Estimate file size from base64 data URL
      const commaIndex = dataUrl.indexOf(",");
      const base64Data =
        commaIndex >= 0 ? dataUrl.substring(commaIndex + 1) : "";
      const estimatedSize = Math.round((base64Data.length * 3) / 4);

      const ext = mime.split("/")[1] || "png";
      const baseName = fileNameRef.current.replace(/\.[^.]+$/, "") || "image";
      const fileName = `${baseName}_${newWidth}x${newHeight}.${ext}`;

      setResult({
        dataUrl,
        width: newWidth,
        height: newHeight,
        fileSize: estimatedSize,
        fileName,
      });
    };
    img.onerror = () => {
      setError("画像の処理に失敗しました");
    };
    img.src = imageSrc;
  }, [
    imageSrc,
    imageInfo,
    resizeMode,
    percent,
    targetWidth,
    targetHeight,
    maintainAspectRatio,
    outputFormat,
    quality,
  ]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = result.fileName;
    link.click();
  }, [result]);

  return (
    <div className={styles.container}>
      {/* File Upload */}
      <div
        className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
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
          PNG, JPEG, GIF, WebP対応 (最大20MB)
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

      {/* Image Info and Preview */}
      {imageInfo && imageSrc && (
        <>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>元画像</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="元画像プレビュー"
              className={styles.preview}
            />
            <div className={styles.infoGrid}>
              <span>ファイル名: {imageInfo.fileName}</span>
              <span>
                サイズ: {imageInfo.width} x {imageInfo.height}px
              </span>
              <span>容量: {formatFileSize(imageInfo.fileSize)}</span>
              <span>形式: {imageInfo.mimeType}</span>
            </div>
          </div>

          {/* Resize Controls */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>リサイズ設定</h3>
            <div className={styles.controls}>
              {/* Mode Toggle */}
              <div className={styles.row}>
                <label className={styles.label}>モード:</label>
                <button
                  type="button"
                  className={
                    resizeMode === "dimensions"
                      ? styles.button
                      : styles.buttonSecondary
                  }
                  onClick={() => setResizeMode("dimensions")}
                  aria-label="サイズ指定モード"
                >
                  サイズ指定
                </button>
                <button
                  type="button"
                  className={
                    resizeMode === "percent"
                      ? styles.button
                      : styles.buttonSecondary
                  }
                  onClick={() => setResizeMode("percent")}
                  aria-label="パーセント指定モード"
                >
                  パーセント指定
                </button>
              </div>

              {resizeMode === "dimensions" ? (
                <>
                  <div className={styles.row}>
                    <label htmlFor="resize-width" className={styles.label}>
                      幅:
                    </label>
                    <input
                      id="resize-width"
                      type="number"
                      min="1"
                      className={styles.numberInput}
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      aria-label="リサイズ幅"
                    />
                    <span className={styles.label}>px</span>
                    <button
                      type="button"
                      className={`${styles.lockButton} ${maintainAspectRatio ? styles.lockButtonActive : ""}`}
                      onClick={() =>
                        setMaintainAspectRatio(!maintainAspectRatio)
                      }
                      aria-label={
                        maintainAspectRatio
                          ? "アスペクト比ロック解除"
                          : "アスペクト比ロック"
                      }
                      title={
                        maintainAspectRatio
                          ? "アスペクト比ロック中"
                          : "アスペクト比フリー"
                      }
                    >
                      {maintainAspectRatio ? "\u{1F512}" : "\u{1F513}"}
                    </button>
                  </div>
                  <div className={styles.row}>
                    <label htmlFor="resize-height" className={styles.label}>
                      高さ:
                    </label>
                    <input
                      id="resize-height"
                      type="number"
                      min="1"
                      className={styles.numberInput}
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      aria-label="リサイズ高さ"
                    />
                    <span className={styles.label}>px</span>
                  </div>
                </>
              ) : (
                <div className={styles.row}>
                  <label htmlFor="resize-percent" className={styles.label}>
                    倍率:
                  </label>
                  <input
                    id="resize-percent"
                    type="number"
                    min="1"
                    max="1000"
                    className={styles.numberInput}
                    value={percent}
                    onChange={(e) => setPercent(e.target.value)}
                    aria-label="リサイズパーセント"
                  />
                  <span className={styles.label}>%</span>
                </div>
              )}

              {/* Output Format */}
              <div className={styles.row}>
                <label htmlFor="output-format" className={styles.label}>
                  出力形式:
                </label>
                <select
                  id="output-format"
                  className={styles.selectInput}
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  aria-label="出力形式"
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              {/* Quality Slider (JPEG/WebP only) */}
              {(outputFormat === "image/jpeg" ||
                outputFormat === "image/webp") && (
                <div className={styles.row}>
                  <label htmlFor="output-quality" className={styles.label}>
                    品質:
                  </label>
                  <input
                    id="output-quality"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    className={styles.rangeInput}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                    aria-label="出力品質"
                  />
                  <span className={styles.label}>{quality}%</span>
                </div>
              )}

              <button
                type="button"
                className={styles.button}
                onClick={handleResize}
                aria-label="リサイズ実行"
              >
                リサイズ
              </button>
            </div>
          </div>
        </>
      )}

      {/* Result */}
      {result && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>リサイズ結果</h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.dataUrl}
            alt="リサイズ結果プレビュー"
            className={styles.preview}
          />
          <div className={styles.resultTable}>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>サイズ</span>
              <span className={styles.resultValue}>
                {result.width} x {result.height}px
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>推定ファイルサイズ</span>
              <span className={styles.resultValue}>
                {formatFileSize(result.fileSize)}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.downloadButton}
            onClick={handleDownload}
            aria-label="リサイズ画像をダウンロード"
          >
            ダウンロード
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* Privacy Note */}
      <p className={styles.privacy}>
        ※ 画像はブラウザ内で処理され、サーバーには送信されません。
      </p>
    </div>
  );
}
