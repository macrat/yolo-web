"use client";

import { useState, useCallback, useRef } from "react";
import FileDropZone from "@/components/FileDropZone";
import Input from "@/components/Input";
import Select from "@/components/Select";
import SegmentedControl from "@/components/SegmentedControl";
import ErrorMessage from "@/components/ErrorMessage";
import {
  calculateDimensions,
  calculateDimensionsFromPercent,
  formatFileSize,
  getOutputMimeType,
  type ImageInfo,
} from "./logic";
import styles from "./ImageResizerPage.module.css";

type ResizeMode = "dimensions" | "percent";

interface ResizedResult {
  dataUrl: string;
  width: number;
  height: number;
  fileSize: number;
  fileName: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const RESIZE_MODE_OPTIONS: { label: string; value: ResizeMode }[] = [
  { label: "サイズ指定", value: "dimensions" },
  { label: "パーセント指定", value: "percent" },
];

/**
 * ImageResizerPage — 画像リサイズツール（単一実装ページ本体）
 *
 * 個別論点①-5 解消: GIF受け取り時に「アニメーションGIFはリサイズ後にアニメーションが
 * 失われる」旨を警告表示。静止画GIFは処理を継続する選択肢を提供。
 *
 * T-4b: コピーボタンなし（download 主体）
 */
export default function ImageResizerPage() {
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
  // GIF警告: GIFが選択されたが処理継続を選んだかどうか
  const [gifWarning, setGifWarning] = useState(false);
  // 結果サマリ（C-3ライブリージョン用の実テキスト）
  const [resultSummary, setResultSummary] = useState("");

  const fileNameRef = useRef<string>("");

  const handleFile = useCallback((file: File) => {
    setError("");
    setResult(null);
    setGifWarning(false);
    setResultSummary("");
    setImageInfo(null);
    setImageSrc(null);

    // ファイルサイズ上限チェック
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズが20MBを超えています");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    // 個別論点①-5: GIF誤誘導解消
    // GIFを受け取ったとき、アニメーション消失の警告を表示する。
    // ただし、GIFはアニメーション・静止画どちらも含むため、処理自体は継続可能にする
    // （Canvas APIはGIFの最初のフレームのみを処理する）。
    if (file.type === "image/gif") {
      setGifWarning(true);
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

  const handleFileError = useCallback((message: string) => {
    setError(message);
    setResult(null);
    setGifWarning(false);
  }, []);

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
    setResultSummary("");

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

      // C-3: ライブリージョン用の実テキストサマリ
      setResultSummary(
        `リサイズ完了: ${newWidth}×${newHeight}px（推定 ${formatFileSize(estimatedSize)}）`,
      );
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
      {/* ファイル選択 */}
      <FileDropZone
        onFileSelect={handleFile}
        onError={handleFileError}
        maxSizeBytes={MAX_FILE_SIZE}
        accept="image/*"
        description="PNG, JPEG, GIF, WebP対応 (最大20MB)"
      />

      {/* エラー表示 */}
      {error && <ErrorMessage message={error} />}

      {/* GIF警告（個別論点①-5: アニメーション消失の明示）
       * GIF受け取り時の注意（advisory）のため role="status"（polite）を使用。
       * 処理を妨げない注意であり role="alert"（assertive）は過剰なため不使用。
       */}
      {gifWarning && (
        <div
          className={styles.gifWarningBox}
          role="status"
          aria-live="polite"
          data-testid="gif-warning"
        >
          <strong>GIF画像の注意:</strong>{" "}
          アニメーションGIFはリサイズ後にアニメーションが失われ、最初のフレームのみが出力されます。アニメーションを保持したい場合はご注意ください。
        </div>
      )}

      {/* 元画像情報とリサイズ設定 */}
      {imageInfo && imageSrc && (
        <>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>元画像</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="元画像プレビュー"
              className={styles.imagePreview}
            />
            <div className={styles.infoGrid}>
              <span>ファイル名: {imageInfo.fileName}</span>
              <span>
                サイズ: {imageInfo.width} × {imageInfo.height}px
              </span>
              <span>容量: {formatFileSize(imageInfo.fileSize)}</span>
              <span>形式: {imageInfo.mimeType}</span>
            </div>
          </div>

          {/* リサイズ設定 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>リサイズ設定</h3>

            {/* モード切替 (SegmentedControl: A-3) */}
            <div className={styles.modeRow}>
              <span id="resize-mode-label" className={styles.modeLabel}>
                モード:
              </span>
              <SegmentedControl
                options={RESIZE_MODE_OPTIONS}
                value={resizeMode}
                onChange={(v) => setResizeMode(v as ResizeMode)}
                aria-labelledby="resize-mode-label"
              />
            </div>

            {/* サイズ指定モード */}
            {resizeMode === "dimensions" ? (
              <>
                <div className={styles.row}>
                  <label htmlFor="resize-width" className={styles.label}>
                    幅
                  </label>
                  <div className={styles.numberInputWrapper}>
                    <Input
                      id="resize-width"
                      type="number"
                      min="1"
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                    />
                  </div>
                  <span className={styles.label}>px</span>
                  <button
                    type="button"
                    className={`${styles.lockButton} ${maintainAspectRatio ? styles.lockButtonActive : ""}`}
                    onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
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
                    高さ
                  </label>
                  <div className={styles.numberInputWrapper}>
                    <Input
                      id="resize-height"
                      type="number"
                      min="1"
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(e.target.value)}
                    />
                  </div>
                  <span className={styles.label}>px</span>
                </div>
              </>
            ) : (
              /* パーセント指定モード */
              <div className={styles.row}>
                <label htmlFor="resize-percent" className={styles.label}>
                  倍率
                </label>
                <div className={styles.numberInputWrapper}>
                  <Input
                    id="resize-percent"
                    type="number"
                    min="1"
                    max="1000"
                    value={percent}
                    onChange={(e) => setPercent(e.target.value)}
                  />
                </div>
                <span className={styles.label}>%</span>
              </div>
            )}

            {/* 出力形式 (Select: A-2) */}
            <div className={styles.row}>
              <label htmlFor="output-format" className={styles.label}>
                出力形式
              </label>
              <Select
                id="output-format"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                aria-label="出力形式"
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
              </Select>
            </div>

            {/* 品質スライダー (JPEG/WebP only) */}
            {(outputFormat === "image/jpeg" ||
              outputFormat === "image/webp") && (
              <div className={styles.row}>
                <label htmlFor="output-quality" className={styles.label}>
                  品質
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
              className={styles.resizeButton}
              onClick={handleResize}
            >
              リサイズ
            </button>
          </div>
        </>
      )}

      {/* C-3: ライブリージョン — 実テキストノードのサマリ */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.liveRegion}
      >
        {resultSummary}
      </div>

      {/* リサイズ結果 */}
      {result && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>リサイズ結果</h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.dataUrl}
            alt="リサイズ結果プレビュー"
            className={styles.imagePreview}
          />
          <div className={styles.resultTable}>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>サイズ</span>
              <span className={styles.resultValue}>
                {result.width} × {result.height}px
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
          >
            ダウンロード
          </button>
        </div>
      )}

      {/* プライバシーノート */}
      <p className={styles.privacy}>
        ※ 画像はブラウザ内で処理され、サーバーには送信されません。
      </p>
    </div>
  );
}
