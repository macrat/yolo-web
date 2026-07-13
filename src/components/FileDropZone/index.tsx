"use client";

import { useRef, useState, useCallback, useId } from "react";
import type { DragEvent, KeyboardEvent, ChangeEvent } from "react";
import styles from "./FileDropZone.module.css";

interface FileDropZoneProps {
  /**
   * ファイルが選択されたときに呼ばれるコールバック。
   * サイズ上限を超えた場合は呼ばれず、onError が呼ばれる。
   */
  onFileSelect: (file: File) => void;

  /**
   * ファイルサイズ上限（バイト）。
   * 超えた場合は onFileSelect を呼ばず onError を呼ぶ。
   * 未指定時は制限なし。
   */
  maxSizeBytes?: number;

  /**
   * エラー時コールバック（サイズ超過など）。
   * message は日本語の人間可読メッセージ。
   */
  onError?: (message: string) => void;

  /**
   * input[type="file"] の accept 属性（例: "image/*", ".pdf,.doc"）。
   * 未指定時は制限なし。
   */
  accept?: string;

  /**
   * ドロップゾーン下部に表示する補足テキスト（対応フォーマット・容量目安など）。
   * 例: "PNG, JPEG, GIF, WebP対応 (最大10MB)"
   */
  description?: string;

  /**
   * aria-label（アクセシビリティ用ラベル）。
   * 指定すると aria-label で accessible name を上書きする（aria-labelledby は外れる）。
   * 未指定時は可視テキストを aria-labelledby で参照する（WCAG 2.5.3 Label in Name 準拠）。
   */
  ariaLabel?: string;
}

/**
 * FileDropZone — ファイルドラッグ&ドロップ共通コンポーネント。
 *
 * image-base64 / image-resizer などのドラッグ&ドロップ取り込みを一本化する。
 *
 * ### a11y
 * - `role="button"` + `tabIndex={0}` でキーボードフォーカス可能。
 * - Enter / Space キーで file dialog を開く。
 * - デフォルトは可視テキストを `aria-labelledby` で参照（WCAG 2.5.3 Label in Name 準拠）。
 * - `ariaLabel` prop を渡すと `aria-label` で上書き（`aria-labelledby` は外れる）。
 *
 * ### デザイン (DESIGN.md 準拠)
 * - 角丸: `--radius-sm` (2px・入力欄扱いの例外)
 * - border: 2px dashed `--rule-strong` (通常) / `--accent` (ドラッグ中・ホバー)
 * - フォーカス: `outline: 2px solid var(--accent); outline-offset: 2px`
 * - ドラッグ中の視覚表現は border 色変化のみ（影・opacity 変化等は禁止）
 *
 * ### hydration
 * dragActive は純粋なクライアント state のみ依存。SSR では常に false 扱いで
 * 一致する（サーバーが dragActive クラスを出力しない）。
 */
function FileDropZone({
  onFileSelect,
  maxSizeBytes,
  onError,
  accept,
  description,
  ariaLabel,
}: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ドラッグ中フラグ。SSR では初期値 false → hydration mismatch なし
  const [dragActive, setDragActive] = useState(false);
  // 可視テキストと aria-labelledby を紐付ける安定した id（SSR/CSR で一致）
  const dropTextId = useId();

  const processFile = useCallback(
    (file: File) => {
      if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
        const mbRaw = maxSizeBytes / (1024 * 1024);
        // 整数なら小数点なし、端数あれば小数1桁（例: 10 → "10"、1.5 → "1.5"）
        const mb = mbRaw % 1 === 0 ? mbRaw.toFixed(0) : mbRaw.toFixed(1);
        onError?.(`ファイルサイズが${mb}MBを超えています`);
        return;
      }
      onFileSelect(file);
    },
    [maxSizeBytes, onError, onFileSelect],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // 同じファイルを連続選択できるよう value をリセット
      e.target.value = "";
    },
    [processFile],
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  return (
    <div
      className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ""}`}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel ?? undefined}
      aria-labelledby={ariaLabel ? undefined : dropTextId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <p id={dropTextId} className={styles.dropText}>
        クリックまたはドラッグ&amp;ドロップでファイルを選択
      </p>
      {description && <p className={styles.dropDescription}>{description}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className={styles.fileInput}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

export default FileDropZone;
