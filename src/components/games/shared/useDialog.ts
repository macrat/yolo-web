"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * Return type for the useDialog hook.
 */
export interface UseDialogReturn {
  /** Ref to attach to the <dialog> element. */
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  /** Callback for the dialog's onClose event. */
  handleClose: () => void;
  /** Callback for backdrop click detection (click outside the dialog box). */
  handleBackdropClick: (e: React.MouseEvent<HTMLDialogElement>) => void;
}

/**
 * Custom hook that manages native <dialog> element open/close logic.
 *
 * Encapsulates the repeated pattern found in all 12 game modals:
 * - Syncs the dialog open state with the `open` prop via showModal()/close()
 * - Provides a close handler that calls the onClose callback
 * - Provides a backdrop click handler that closes on clicks outside the dialog
 *
 * @param open - Whether the dialog should be open
 * @param onClose - Callback invoked when the dialog should close
 */
export function useDialog(open: boolean, onClose: () => void): UseDialogReturn {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        onClose();
      }
    },
    [onClose],
  );

  return { dialogRef, handleClose, handleBackdropClick };
}
