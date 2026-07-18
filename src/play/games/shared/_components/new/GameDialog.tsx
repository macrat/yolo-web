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
  /**
   * Optional element to focus when an *auto-opened* dialog closes. Auto-opened
   * dialogs (first-visit HowToPlay / game-end Result) have no trigger element,
   * so native focus restoration falls back to <body>; passing a stable anchor
   * (e.g. the game's <h1>) keeps keyboard/SR focus from being lost. Manually
   * opened dialogs (help/stats buttons) ignore this and restore to the trigger.
   * See useDialog for details.
   */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Shared dialog wrapper for all game modals ((new) デザイン体系版。legacy 版は廃止済みで、
 * 本ファイルが唯一の実装).
 *
 * cycle-268 で legacy 版（廃止済み）から (new) austere へ質的入れ替え:
 * 角丸 12px→2px相当 / ボタン 6px→8px相当のトークンに置換、影撤去、
 * タイトル中央寄せ撤去（左寄せ）、旧 --color-* → 新トークン。
 * cycle-279 でさらに店構えへ再移行し、.modal / .modalClose とも
 * var(--radius)（0px）に統一（角丸なし）。
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
  returnFocusRef,
}: GameDialogProps) {
  const { dialogRef, handleClose, handleBackdropClick } = useDialog(
    open,
    onClose,
    returnFocusRef,
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
