"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { fileToBase64, type ImageBase64Result } from "./logic";

/**
 * 画像 Base64 変換 タイル用 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（encode/decode タブ + プレビュー + MIME/サイズ情報 + ダウンロード）と
 * は別に、タイルサイズ（cols=3 rows=3 = 400×400px）に最適化した画像入力型 UI。
 * ロジックは詳細ページと同じ logic.ts の fileToBase64() を再利用。
 *
 * 採択仕様（cycle-211 T-3 計画書 r2）:
 * - §論点 1 採択: encode のみ（decode は詳細ページに残存）
 * - §論点 2 採択: cols=3 rows=3（400×400px）
 * - §論点 3 採択: ドロップゾーン + クリックで file dialog 起動
 *   role="button" + onClick で inputRef.current?.click() + tabIndex={0} + onKeyDown (Enter/Space)
 *   + aria-label + aria-describedby
 * - §論点 4 採択: 構造変化を許容（未選択時 = ファイル選択 UI のみ / 選択後 = + 出力欄 + コピーボタン）
 * - §論点 5 採択: bare base64 + Data URI 両方タイル表示（来訪者価値最大化）
 * - §論点 6: encode 系エラー 3 種（容量超過 / 非対応形式 / 読込失敗）を表示
 *   文言は既存 Component.tsx の literal を流用
 * - §論点 7 採択 (AP-P21 役割分担):
 *   操作側 flexShrink:0 = ファイル選択 UI / コピーボタン / 詳細リンク / エラー枠
 *   膨張側 flex:1 + overflowY:auto = base64 出力欄 + Data URI 出力欄
 * - §論点 10 採択: ローディング表示なし
 *
 * CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存 11 タイル同型）。
 *
 * 画像入力型タイル初回（Phase 8.1 第 12 弾 / cycle-211 T-3）。
 */

/** ファイルサイズ上限（10MB）: 既存 Component.tsx と同一値 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ImageBase64Tile() {
  const [result, setResult] = useState<ImageBase64Result | null>(null);
  const [error, setError] = useState("");
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [copiedDataUri, setCopiedDataUri] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル処理（encode のみ）
  // エラー文言は既存 Component.tsx の literal を流用（§論点 6 採択）
  const handleFile = useCallback(async (file: File) => {
    setError("");
    setResult(null);
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズが10MBを超えています");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }
    try {
      const res = await fileToBase64(file);
      setResult(res);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "ファイルの読み込みに失敗しました",
      );
    }
  }, []);

  // input[type=file] change イベント
  // e.target.value = "" で同一ファイルの連続選択（観点 xii）に対応
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // 同じファイルを連続して選択できるようにリセット（観点 xii 対応）
      e.target.value = "";
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

  // base64 コピー
  const handleCopyBase64 = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.base64);
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2000);
    } catch {
      // Clipboard API not available — silent fail（Component.tsx 同型）
    }
  }, [result]);

  // Data URI コピー
  const handleCopyDataUri = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.dataUri);
      setCopiedDataUri(true);
      setTimeout(() => setCopiedDataUri(false), 2000);
    } catch {
      // Clipboard API not available — silent fail（Component.tsx 同型）
    }
  }, [result]);

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
        画像 → Base64
      </p>

      {/* ドロップゾーン（操作側 = flexShrink: 0 で高さ固定）
           §論点 3 採択: role="button" + onClick + tabIndex={0} + onKeyDown (Enter/Space)
           AP-P21 基準 (i) 下限 40px 以上: minHeight: 64 で明示確保 */}
      <div
        role="button"
        tabIndex={0}
        aria-label="画像ファイルを選択またはドラッグ&ドロップ"
        aria-describedby="tile-image-base64-hint"
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
          backgroundColor: dragActive
            ? "var(--accent-soft, var(--bg))"
            : "var(--bg)",
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
          {result ? "別の画像を選択" : "クリック / ドロップで画像を選択"}
        </span>
        <span
          id="tile-image-base64-hint"
          style={{
            fontSize: "0.7rem",
            color: "var(--fg-soft)",
            pointerEvents: "none",
          }}
        >
          PNG, JPEG, GIF, WebP 対応
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          aria-label="画像ファイル選択"
          style={{ display: "none" }}
        />
      </div>

      {/* エラー表示（操作側 = flexShrink: 0）
           §論点 6 採択: 3 種エラー文言を既存 Component.tsx と同一 literal で表示 */}
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

      {/* 結果エリア（ファイル選択後に表示）
           §論点 4 採択: 構造変化を許容 / §論点 7 採択: 膨張側 = flex: 1 + overflowY: auto */}
      {result && (
        <>
          {/* base64 出力欄（膨張側）
               role="status" aria-live="polite" で支援技術に更新を通知（既存 11 タイル同型） */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              minHeight: 0,
            }}
          >
            {/* base64 出力グループ */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minHeight: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <label
                  htmlFor="tile-base64-output"
                  style={{ fontSize: "0.7rem", color: "var(--fg-soft)" }}
                >
                  Base64
                </label>
                <button
                  type="button"
                  onClick={handleCopyBase64}
                  style={{
                    padding: "2px 8px",
                    fontSize: "0.7rem",
                    borderRadius: "4px",
                    border: "1px solid var(--border, var(--fg-soft))",
                    backgroundColor: copiedBase64
                      ? "var(--accent)"
                      : "transparent",
                    color: copiedBase64 ? "var(--bg)" : "var(--fg)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  {copiedBase64 ? "コピー済み" : "コピー"}
                </button>
              </div>
              <textarea
                id="tile-base64-output"
                readOnly
                value={result.base64}
                role="status"
                aria-live="polite"
                style={{
                  flex: 1,
                  resize: "none",
                  border: "1px solid var(--fg-soft)",
                  borderRadius: "4px",
                  padding: "4px 6px",
                  fontSize: "0.7rem",
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                  minHeight: 0,
                  overflowY: "auto",
                }}
              />
            </div>

            {/* Data URI 出力グループ */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minHeight: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <label
                  htmlFor="tile-datauri-output"
                  style={{ fontSize: "0.7rem", color: "var(--fg-soft)" }}
                >
                  Data URI
                </label>
                <button
                  type="button"
                  onClick={handleCopyDataUri}
                  style={{
                    padding: "2px 8px",
                    fontSize: "0.7rem",
                    borderRadius: "4px",
                    border: "1px solid var(--border, var(--fg-soft))",
                    backgroundColor: copiedDataUri
                      ? "var(--accent)"
                      : "transparent",
                    color: copiedDataUri ? "var(--bg)" : "var(--fg)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  {copiedDataUri ? "コピー済み" : "コピー"}
                </button>
              </div>
              <textarea
                id="tile-datauri-output"
                readOnly
                value={result.dataUri}
                role="status"
                aria-live="polite"
                style={{
                  flex: 1,
                  resize: "none",
                  border: "1px solid var(--fg-soft)",
                  borderRadius: "4px",
                  padding: "4px 6px",
                  fontSize: "0.7rem",
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                  minHeight: 0,
                  overflowY: "auto",
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* フッター: 詳細ページリンク（操作側 = flexShrink: 0）*/}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <Link
          href="/tools/image-base64"
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
