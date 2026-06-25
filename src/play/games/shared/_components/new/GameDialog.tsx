"use client";

import type { ReactNode } from "react";
import { useDialog } from "../useDialog";
import styles from "./GameDialog.module.css";

/**
 * Props for the GameDialog component.
 */
interface GameDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** Callback invoked when the dialog should close. */
  onClose: () => void;
  /** Unique ID for aria-labelledby on the title element. */
  titleId: string;
  /** Title text displayed in the dialog header. */
  title: string;
  /** Main content of the dialog. */
  children: ReactNode;
  /** Optional width in pixels (default: 400). irodori ResultModal uses 440. */
  width?: number;
  /** Optional additional CSS class for the dialog element. */
  className?: string;
  /** Optional content rendered before the title (e.g. result emoji). */
  headerContent?: ReactNode;
  /** Optional content rendered just before the close button (e.g. stats button). */
  footer?: ReactNode;
}

/**
 * Shared dialog wrapper for all game modals ((new) デザイン体系版・cycle-268 フォーク).
 *
 * legacy `../GameDialog` を (new) austere へ質的入れ替えしたもの:
 * 角丸 12px→--r-normal(2px) / ボタン 6px→--r-interactive(8px)、影撤去、
 * タイトル中央寄せ撤去（左寄せ）、旧 --color-* → 新トークン。
 * 振る舞い・props・DOM 構造は不変。`useDialog` フックは共有のまま参照する。
 */
export default function GameDialog({
  open,
  onClose,
  titleId,
  title,
  children,
  width = 400,
  className,
  headerContent,
  footer,
}: GameDialogProps) {
  const { dialogRef, handleClose, handleBackdropClick } = useDialog(
    open,
    onClose,
  );

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.modal} ${className ?? ""}`.trim()}
      style={{ width: `${width}px` }}
      onClose={handleClose}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
    >
      {headerContent}
      <h2 id={titleId} className={styles.modalTitle}>
        {title}
      </h2>
      {children}
      {footer}
      <button className={styles.modalClose} onClick={handleClose} type="button">
        {"閉じる"}
      </button>
    </dialog>
  );
}
