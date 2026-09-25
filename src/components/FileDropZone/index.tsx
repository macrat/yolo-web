"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import styles from "./FileDropZone.module.css";

interface FileDropZoneProps {
  /** 何のファイルを選ぶ欄かを言うラベル。欄の上に置く。 */
  label: string;

  /** ファイルが選ばれたときに呼ぶ。サイズの上限を超えたときは呼ばず、onError を呼ぶ。 */
  onFileSelect: (file: File) => void;

  /** ファイルサイズの上限（バイト）。未指定なら制限しない。 */
  maxSizeBytes?: number;

  /** 選ばれたファイルが上限を超えたときに、来訪者に見せる日本語の文を渡して呼ぶ。 */
  onError?: (message: string) => void;

  /** input[type="file"] の accept 属性（例: "image/*"）。未指定なら制限しない。 */
  accept?: string;

  /** 対応する形式や容量の目安など、欄の中に添える補助情報。 */
  description?: string;
}

/**
 * ファイルを選ぶ欄（DESIGN.md §8 の選ぶ欄）。
 *
 * 欄を押すかキーボードで操作するとファイルを選ぶ画面が開き、ファイルを欄の上に落としても選べる。
 * 落とす操作は選ぶ画面の近道で、それでしかできないことは持たない（§6）。ファイルを重ねているあいだは、
 * 線を変えずに欄の中の文言で、離せば選べることを示す。線を変えると hover やエラーと読み違えられるため。
 *
 * 選ぶのは本物の `<input type="file">` で、見えないまま欄の直前に置き、フォーカス・キーボード・
 * 選ぶ画面を開く動作をブラウザの標準に任せる。見えている欄はその入力の `<label>` なので、押すと
 * 選ぶ画面が開き、入力が受けたフォーカスのリングを欄に出す。
 */
function FileDropZone({
  label,
  onFileSelect,
  maxSizeBytes,
  onError,
  accept,
  description,
}: FileDropZoneProps) {
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const promptId = `${inputId}-prompt`;
  const descriptionId = `${inputId}-description`;

  const processFile = useCallback(
    (file: File) => {
      if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
        const mbRaw = maxSizeBytes / (1024 * 1024);
        // 整数なら小数点なし、端数があれば小数1桁（10 → "10"、1.5 → "1.5"）。
        const mb = mbRaw % 1 === 0 ? mbRaw.toFixed(0) : mbRaw.toFixed(1);
        onError?.(`ファイルサイズが${mb}MBを超えています`);
        return;
      }
      onFileSelect(file);
    },
    [maxSizeBytes, onError, onFileSelect],
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // 同じファイルを続けて選んでも change が起きるよう、値を空に戻す。
      e.target.value = "";
    },
    [processFile],
  );

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  // 欄の中の子要素へ移るたびに dragenter と dragleave が対で起きるので、入った深さを数え、
  // 欄から出きったときだけ重ねていない状態に戻す。
  const dragDepthRef = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    dragDepthRef.current += 1;
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDraggingOver(false);
  }, []);

  // 落とされたファイルをブラウザが開いてしまわないよう、既定の動作を止める。
  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      dragDepthRef.current = 0;
      setIsDraggingOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  return (
    <div className={styles.field}>
      <label id={labelId} htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className={styles.fileInput}
        aria-labelledby={labelId}
        aria-describedby={
          description ? `${promptId} ${descriptionId}` : promptId
        }
      />
      <label
        htmlFor={inputId}
        className={styles.dropZone}
        data-field=""
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <span id={promptId}>
          {isDraggingOver
            ? "ここで離すと選べます"
            : "ファイルを選ぶ（ここにファイルを落としても選べます）"}
        </span>
        {description && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
      </label>
    </div>
  );
}

export default FileDropZone;
