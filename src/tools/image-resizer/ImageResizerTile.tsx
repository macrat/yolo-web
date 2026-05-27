"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  formatFileSize,
  getOutputMimeType,
  calculateDimensions,
} from "./logic";

/**
 * 画像リサイズ タイル用 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（dimensions/percent 両モード + プレビュー + 品質スライダー
 * + フォーマット選択）とは別に、タイルサイズ（cols=3 rows=3 = 400×400px）に
 * 最適化した画像入力型 UI。ロジックは詳細ページと同じ logic.ts を再利用。
 *
 * 採択仕様（cycle-212 T-3 計画書）:
 * - §論点 A 採択: cols=3 rows=3（400×400px）
 * - §論点 B4 採択: dimensions（幅 px 入力）+ プリセット縮小ボタン [50%] [25%] 横並び
 * - §論点 C-1 採択: accept="image/png,image/jpeg,image/webp" 明示限定
 * - §論点 C-2/C-3 採択: GIF/SVG が D&D で来た場合はエラー表示
 * - §論点 D1 採択: quality=80 固定
 * - §論点 E3 採択: 結果プレビュー省略 / ビフォーアフター 2 段テキスト
 * - §論点 F3 採択: 「リサイズしてダウンロード」統合ボタン
 * - §論点 G 採択: AP-P21 4 系統独立（未選択 / 選択後 / リサイズ後 / エラー）
 * - §論点 H 中間案採択: 100ms threshold spinner（setTimeout cancelable / useRef で ID 保持）
 * - §論点 I γ採択: 結果サイズ表示 2 段構造（role="status" aria-live="polite"）
 * - §論点 J 採択: DL 後ボタン文言「ダウンロード完了」→ 2 秒後に元に戻る
 *
 * cycle-211 SSoT (vii) 引用適用:
 * - role="button" + tabIndex={0} + aria-label + onKeyDown (Enter/Space) → file dialog 起動
 * - <input type="file"> 隠蔽 + aria-label 付与
 *
 * CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存 12 タイル同型）。
 * 画像入力型タイル 2 件目（Phase 8.1 第 13 弾 / cycle-212 T-3）。
 */

/** ファイルサイズ上限（20MB）: 既存 Component.tsx L45 と同一値 */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/** 品質設定（タイルでは固定 / 詳細ページ専用: §論点 D1 採択） */
const FIXED_QUALITY = 0.8;

/** DL 完了表示を元に戻すまでの時間 (ms): cycle-211 コピーボタンと同型 */
const DL_FEEDBACK_DURATION_MS = 2000;

/** spinner 表示開始遅延 (ms): Doherty threshold（§論点 H 中間案） */
const SPINNER_DELAY_MS = 100;

interface ResizeResult {
  /** リサイズ後の幅 (px) */
  width: number;
  /** リサイズ後の高さ (px) */
  height: number;
  /** blob のサイズ (bytes) */
  fileSize: number;
}

export default function ImageResizerTile() {
  // --- 画像情報（選択後にセット）---
  const [origWidth, setOrigWidth] = useState<number | null>(null);
  const [origHeight, setOrigHeight] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/png");

  // --- 幅 input の値（選択後はデフォルトで元画像幅）---
  const [targetWidth, setTargetWidth] = useState<string>("");

  // --- リサイズ結果（リサイズ後にセット）---
  const [resizeResult, setResizeResult] = useState<ResizeResult | null>(null);

  // --- UI 状態 ---
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [dlCompleted, setDlCompleted] = useState(false);

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** 100ms threshold spinner の setTimeout ID（clearTimeout で冪等にキャンセル可能） */
  const spinnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** DL 完了表示を元に戻す setTimeout ID（unmount 時に clearTimeout でリーク防止） */
  const dlCompletedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // unmount 時に走行中の setTimeout をすべてキャンセルする（AP-I11 参照）
  useEffect(() => {
    return () => {
      if (spinnerTimerRef.current != null) {
        clearTimeout(spinnerTimerRef.current);
      }
      if (dlCompletedTimerRef.current != null) {
        clearTimeout(dlCompletedTimerRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------
  // ファイル処理
  // -------------------------------------------------------
  const handleFile = useCallback((file: File) => {
    setError("");
    setResizeResult(null);
    setDlCompleted(false);

    // GIF / SVG 拒否（§論点 C-2 / C-3 採択）
    if (file.type === "image/gif" || file.type === "image/svg+xml") {
      setError("アニメ画像は詳細ページをご利用ください");
      return;
    }

    // ファイルサイズ上限チェック
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズが20MBを超えています");
      return;
    }

    // accept 属性の検証（MIME タイプチェック）
    // ※ GIF / SVG は上段で弾済みのため、ここでは allowedTypes 外を一括拒否
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("画像ファイルを選択してください");
      return;
    }

    setFileName(file.name);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);
        setTargetWidth(String(img.naturalWidth));
        setImageSrc(dataUrl);
      };
      img.onerror = () => {
        setError("画像ファイルを選択してください");
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setError("画像ファイルを選択してください");
    };
    reader.readAsDataURL(file);
  }, []);

  // input[type=file] change イベント
  // e.target.value = "" で同じファイルの連続選択（観点 xi）に対応
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // 同じファイルを連続して選択できるようにリセット（観点 xi 対応）
      e.target.value = "";
    },
    [handleFile],
  );

  // -------------------------------------------------------
  // ドラッグ&ドロップ
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // プリセットボタン処理（即時 DL 起動なし / 幅 input にセットのみ）
  // -------------------------------------------------------
  const handlePreset = useCallback(
    (ratio: number) => {
      if (origWidth == null) return;
      setTargetWidth(String(Math.round(origWidth * ratio)));
    },
    [origWidth],
  );

  // -------------------------------------------------------
  // リサイズ + DL 統合ボタン（§論点 F3 採択）
  // -------------------------------------------------------
  const handleResize = useCallback(() => {
    if (!imageSrc || origWidth == null || origHeight == null) return;
    setError("");

    const w = parseInt(targetWidth, 10);
    if (isNaN(w) || w < 1) {
      setError("幅を1以上の整数で指定してください");
      return;
    }

    // アスペクト比固定で高さを計算
    const dims = calculateDimensions(origWidth, origHeight, w, null, true);

    // 100ms threshold spinner 開始（§論点 H 中間案）
    if (spinnerTimerRef.current != null) {
      clearTimeout(spinnerTimerRef.current);
    }
    spinnerTimerRef.current = setTimeout(() => {
      setShowSpinner(true);
    }, SPINNER_DELAY_MS);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = dims.width;
      canvas.height = dims.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // spinner をキャンセル
        if (spinnerTimerRef.current != null) {
          clearTimeout(spinnerTimerRef.current);
          spinnerTimerRef.current = null;
        }
        setShowSpinner(false);
        setError("画像の処理に失敗しました");
        return;
      }
      ctx.drawImage(img, 0, 0, dims.width, dims.height);

      const outputMime = getOutputMimeType(mimeType);
      const qualityValue =
        outputMime === "image/png" ? undefined : FIXED_QUALITY;

      canvas.toBlob(
        (blob) => {
          // spinner をキャンセル（リサイズ完了）
          if (spinnerTimerRef.current != null) {
            clearTimeout(spinnerTimerRef.current);
            spinnerTimerRef.current = null;
          }
          setShowSpinner(false);

          if (!blob) {
            setError("画像の処理に失敗しました");
            return;
          }

          // DL リンクを生成して自動クリック
          const url = URL.createObjectURL(blob);
          const ext = outputMime.split("/")[1] || "png";
          const baseName = fileName.replace(/\.[^.]+$/, "") || "image";
          const dlName = `${baseName}_${dims.width}x${dims.height}.${ext}`;

          const a = document.createElement("a");
          a.href = url;
          a.download = dlName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          // 結果情報をセット（§論点 I γ / §論点 E3）
          setResizeResult({
            width: dims.width,
            height: dims.height,
            fileSize: blob.size,
          });

          // DL 完了表示（§論点 J）
          // ID を ref に保持して unmount 時の clearTimeout でリーク防止（AP-I11）
          setDlCompleted(true);
          dlCompletedTimerRef.current = setTimeout(
            () => setDlCompleted(false),
            DL_FEEDBACK_DURATION_MS,
          );
        },
        outputMime,
        qualityValue,
      );
    };
    img.onerror = () => {
      if (spinnerTimerRef.current != null) {
        clearTimeout(spinnerTimerRef.current);
        spinnerTimerRef.current = null;
      }
      setShowSpinner(false);
      setError("画像の処理に失敗しました");
    };
    img.src = imageSrc;
  }, [imageSrc, origWidth, origHeight, targetWidth, mimeType, fileName]);

  // 画像が選択済みかどうか
  const hasImage = imageSrc != null && origWidth != null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "12px",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* ヘッダー: タイトル */}
      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          fontWeight: 600,
          opacity: 0.7,
          flexShrink: 0,
        }}
      >
        画像リサイズ
      </p>

      {/* ドロップゾーン or ファイル名表示（選択後の代替）
           cycle-211 SSoT (vii) 引用適用: role="button" + tabIndex={0} + onKeyDown */}
      {!hasImage ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="画像ファイルを選択またはドラッグ&ドロップ"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            flexShrink: 0,
            minHeight: 64,
            border: `2px dashed ${dragActive ? "var(--accent)" : "var(--fg-soft)"}`,
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            cursor: "pointer",
            backgroundColor: dragActive ? "var(--accent-soft)" : "var(--bg)",
            transition: "border-color 0.15s, background-color 0.15s",
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--fg)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            クリックまたはドラッグ&ドロップで画像を選択
          </span>
          <p
            style={{
              margin: 0,
              fontSize: "0.7rem",
              color: "var(--fg-soft)",
              pointerEvents: "none",
            }}
          >
            PNG, JPEG, WebP 対応
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInput}
            aria-label="画像ファイル選択"
            style={{ display: "none" }}
          />
        </div>
      ) : (
        // 選択後: ファイル名 1 行 + D&D ゾーン継続
        <div
          role="button"
          tabIndex={0}
          aria-label="画像ファイルを選択またはドラッグ&ドロップ"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            flexShrink: 0,
            border: `1px solid ${dragActive ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
            borderRadius: "6px",
            padding: "6px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "var(--bg)",
          }}
        >
          <span
            title={fileName}
            style={{
              fontSize: "0.75rem",
              color: "var(--fg-soft)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              pointerEvents: "none",
            }}
          >
            {fileName}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--accent)",
              flexShrink: 0,
              pointerEvents: "none",
            }}
          >
            変更
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInput}
            aria-label="画像ファイル選択"
            style={{ display: "none" }}
          />
        </div>
      )}

      {/* エラー表示（操作側 = flexShrink: 0）*/}
      {error && (
        <div
          role="alert"
          style={{
            flexShrink: 0,
            fontSize: "0.8125rem",
            color: "var(--danger)",
            backgroundColor: "var(--danger-soft)",
            border: "1px solid var(--danger)",
            borderRadius: "4px",
            padding: "8px",
          }}
        >
          {error}
        </div>
      )}

      {/* 選択後の操作エリア（幅 input + プリセット + リサイズボタン）*/}
      {hasImage && (
        <>
          {/* 幅 input + プリセット [50%] [25%] 横並び（§論点 B4 採択）*/}
          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <label
              htmlFor="tile-resizer-width"
              style={{
                fontSize: "0.75rem",
                color: "var(--fg-soft)",
                flexShrink: 0,
              }}
            >
              幅
            </label>
            <input
              id="tile-resizer-width"
              type="number"
              min={1}
              value={targetWidth}
              onChange={(e) => setTargetWidth(e.target.value)}
              style={{
                flex: 1,
                padding: "4px 6px",
                fontSize: "0.8125rem",
                border: "1px solid var(--border, var(--fg-soft))",
                borderRadius: "4px",
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                fontFamily: "inherit",
                minWidth: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--fg-soft)",
                flexShrink: 0,
              }}
            >
              px
            </span>
            {/* プリセットボタン [50%] [25%]（即時 DL 起動なし / 幅 input にセットのみ）*/}
            <button
              type="button"
              onClick={() => handlePreset(0.5)}
              style={{
                padding: "3px 8px",
                fontSize: "0.75rem",
                borderRadius: "4px",
                border: "1px solid var(--border, var(--fg-soft))",
                backgroundColor: "transparent",
                color: "var(--fg)",
                cursor: "pointer",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => handlePreset(0.25)}
              style={{
                padding: "3px 8px",
                fontSize: "0.75rem",
                borderRadius: "4px",
                border: "1px solid var(--border, var(--fg-soft))",
                backgroundColor: "transparent",
                color: "var(--fg)",
                cursor: "pointer",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              25%
            </button>
          </div>

          {/* リサイズ + DL 統合ボタン + spinner（§論点 F3 / §論点 H 中間案）*/}
          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={handleResize}
              disabled={showSpinner}
              style={{
                flex: 1,
                padding: "6px 12px",
                fontSize: "0.8125rem",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--accent)",
                color: "var(--bg)",
                cursor: showSpinner ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                opacity: showSpinner ? 0.7 : 1,
              }}
            >
              {dlCompleted ? "ダウンロード完了" : "リサイズしてダウンロード"}
            </button>
            {/* spinner（100ms threshold / §論点 H 中間案 / flexShrink:0 操作側要素）*/}
            {showSpinner && (
              <span
                aria-label="処理中"
                style={{
                  flexShrink: 0,
                  display: "inline-block",
                  width: "20px",
                  height: "20px",
                  border: "2px solid var(--accent)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite",
                }}
              />
            )}
          </div>
        </>
      )}

      {/* 結果サイズ表示 2 段構造（§論点 I 案 γ / §論点 E3）
           role="status" aria-live="polite" を 2 段全体を囲む 1 要素に付与 */}
      {resizeResult && (
        <div
          role="status"
          aria-live="polite"
          style={{
            flexShrink: 0,
            fontSize: "0.75rem",
            color: "var(--fg-soft)",
            lineHeight: 1.5,
          }}
        >
          {/* 1 行目: ビフォーアフター寸法（≤ 19 字）*/}
          <div>
            {origWidth}×{origHeight} → {resizeResult.width}×
            {resizeResult.height}
          </div>
          {/* 2 行目: 推定容量 + DL 起動通知（≤ 18 字）*/}
          <div>(推定 {formatFileSize(resizeResult.fileSize)} / DL 開始)</div>
        </div>
      )}

      {/* フッター: 詳細ページリンク（操作側 = flexShrink: 0）*/}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          flexShrink: 0,
          marginTop: "auto",
        }}
      >
        <Link
          href="/tools/image-resizer"
          style={{
            fontSize: "0.75rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
          }}
        >
          詳細ページで開く
        </Link>
      </div>
    </div>
  );
}
