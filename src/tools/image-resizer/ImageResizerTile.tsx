"use client";

/**
 * ImageResizerTile — 画像リサイズの単一正典タイル
 *
 * cycle-228 T-27: ImageResizerPage.tsx（559行）を Panel ルートのタイルへ移行。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **full のみ**: 全機能を1バリエーション（variant="full"）に収める（計画確定済み）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。Canvas は id を使わず ref 参照。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: calculateDimensions / calculateDimensionsFromPercent /
 *   getOutputMimeType が唯一のロジック源。Canvas 操作は UI 層の責務。
 *
 * ## Canvas / 非同期の安全性
 *
 * - Canvas は document.createElement("canvas") で生成（DOM id 不使用）。
 *   複数インスタンスが同居しても干渉しない。
 * - FileReader / Image() のコールバック内で setState する際、アンマウント後の
 *   呼び出しを `isMounted` ref で防止する。
 * - 連続ドロップ: 新しいファイルが選択された時点で直前の結果をクリアし、
 *   古い処理結果が新しい結果を上書きしないよう処理 ID を管理する。
 *
 * ## GIF 警告（個別論点①-5）
 *
 * GIF受け取り時に「アニメーションGIFはリサイズ後にアニメーションが失われる」旨を
 * role="status"（advisory = polite）で表示。処理自体は継続可能。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" の div にリサイズ完了サマリテキストを置く。
 * - GIF 警告も role="status" aria-live="polite"（処理を妨げない注意 → alert は過剰）。
 * - 全フォーム要素は useId ベースの id で label と関連付け。
 */

import { useState, useCallback, useRef, useId, useEffect } from "react";
import Panel from "@/components/Panel";
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
import styles from "./ImageResizerTile.module.css";

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

export interface ImageResizerTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * 現在は full のみ（全機能を1バリエーションに収める）。
   */
  variant?: "full";
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function ImageResizerTile({
  variant = "full",
  as = "section",
  className,
}: ImageResizerTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const resizeModeId = `${uid}-resize-mode`;
  const widthId = `${uid}-resize-width`;
  const heightId = `${uid}-resize-height`;
  const percentId = `${uid}-resize-percent`;
  const formatId = `${uid}-output-format`;
  const qualityId = `${uid}-output-quality`;

  // ---------- アンマウント後 setState 防止（D-4） ----------
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 連続ドロップで古い画像が新しい結果を上書きしないための処理 ID（handleFile 系）
  const processIdRef = useRef(0);

  // handleResize の連続実行で古いリサイズ結果が新しい結果を上書きしないための処理 ID
  const resizeIdRef = useRef(0);

  // ファイル名を ref で保持（Canvas 処理中に参照するため）
  const fileNameRef = useRef<string>("");

  // ---------- State ----------
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
  const [gifWarning, setGifWarning] = useState(false);
  const [resultSummary, setResultSummary] = useState("");

  // ---------- ファイル選択ハンドラ ----------
  const handleFile = useCallback((file: File) => {
    // 状態をリセット
    setError("");
    setResult(null);
    setGifWarning(false);
    setResultSummary("");
    setImageInfo(null);
    setImageSrc(null);

    // ファイルサイズ上限チェック（FileDropZone が呼ぶ前に弾くが念のため）
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズが20MBを超えています");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    // 個別論点①-5: GIF誤誘導解消
    if (file.type === "image/gif") {
      setGifWarning(true);
    }

    fileNameRef.current = file.name;

    // 連続ドロップの処理 ID（古い処理の結果を無視するために使う）
    const currentProcessId = ++processIdRef.current;

    const reader = new FileReader();
    reader.onload = () => {
      // アンマウント後は何もしない（D-4）
      if (!isMounted.current) return;
      // 古い処理は無視（連続ドロップ安全性）
      if (currentProcessId !== processIdRef.current) return;

      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        if (!isMounted.current) return;
        if (currentProcessId !== processIdRef.current) return;

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
        if (!isMounted.current) return;
        if (currentProcessId !== processIdRef.current) return;
        setError("画像の読み込みに失敗しました");
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      if (!isMounted.current) return;
      if (currentProcessId !== processIdRef.current) return;
      setError("ファイルの読み込みに失敗しました");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileError = useCallback((message: string) => {
    setError(message);
    setResult(null);
    setGifWarning(false);
  }, []);

  // ---------- 幅/高さ変更ハンドラ（アスペクト比連動） ----------
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

  // ---------- リサイズ実行 ----------
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

    // リサイズ処理 ID（連続リサイズ時の stale 結果上書き防止）
    const currentResizeId = ++resizeIdRef.current;

    const img = new Image();
    img.onload = () => {
      if (!isMounted.current) return;
      // 古いリサイズ処理の結果は無視（連続リサイズ安全性）
      if (currentResizeId !== resizeIdRef.current) return;

      // Canvas は document.createElement で生成（DOM id 不使用 → 複数インスタンス干渉なし）
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

      // Base64 から推定ファイルサイズを計算
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
      if (!isMounted.current) return;
      if (currentResizeId !== resizeIdRef.current) return;
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

  // ---------- ダウンロード ----------
  const handleDownload = useCallback(() => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = result.fileName;
    link.click();
  }, [result]);

  // variant は将来のバリエーション拡張のための受け口（現在は full のみ）
  void variant;

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      <div className={styles.inner}>
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

              {/* モード切替 (SegmentedControl) */}
              <div className={styles.modeRow}>
                <span id={resizeModeId} className={styles.modeLabel}>
                  モード:
                </span>
                <SegmentedControl
                  options={RESIZE_MODE_OPTIONS}
                  value={resizeMode}
                  onChange={(v) => setResizeMode(v as ResizeMode)}
                  aria-labelledby={resizeModeId}
                />
              </div>

              {/* サイズ指定モード */}
              {resizeMode === "dimensions" ? (
                <>
                  <div className={styles.row}>
                    <label htmlFor={widthId} className={styles.label}>
                      幅
                    </label>
                    <div className={styles.numberInputWrapper}>
                      <Input
                        id={widthId}
                        type="number"
                        min="1"
                        value={targetWidth}
                        onChange={(e) => handleWidthChange(e.target.value)}
                      />
                    </div>
                    <span className={styles.label}>px</span>
                    {/* DESIGN.md §3: 絵文字禁止 → Lucide スタイル SVG 線画 + 可視テキストラベル */}
                    <button
                      type="button"
                      className={`${styles.lockButton} ${maintainAspectRatio ? styles.lockButtonActive : ""}`}
                      onClick={() =>
                        setMaintainAspectRatio(!maintainAspectRatio)
                      }
                      aria-label={
                        maintainAspectRatio
                          ? "アスペクト比 固定中（クリックで解除）"
                          : "アスペクト比 固定解除（クリックで固定）"
                      }
                    >
                      {maintainAspectRatio ? (
                        /* Lucide "Lock" (施錠) — stroke 1.5px / 16px */
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          <span className={styles.lockLabel}>固定中</span>
                        </>
                      ) : (
                        /* Lucide "Unlock" (開錠) — stroke 1.5px / 16px */
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                          </svg>
                          <span className={styles.lockLabel}>固定解除</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className={styles.row}>
                    <label htmlFor={heightId} className={styles.label}>
                      高さ
                    </label>
                    <div className={styles.numberInputWrapper}>
                      <Input
                        id={heightId}
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
                  <label htmlFor={percentId} className={styles.label}>
                    倍率
                  </label>
                  <div className={styles.numberInputWrapper}>
                    <Input
                      id={percentId}
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

              {/* 出力形式 (Select) */}
              <div className={styles.row}>
                <label htmlFor={formatId} className={styles.label}>
                  出力形式
                </label>
                <Select
                  id={formatId}
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
                  <label htmlFor={qualityId} className={styles.label}>
                    品質
                  </label>
                  <input
                    id={qualityId}
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
    </Panel>
  );
}
