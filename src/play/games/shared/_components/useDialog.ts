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
 * @param returnFocusRef - Optional element to receive focus when the dialog is
 *   closed *if it was auto-opened* (opened with no meaningful trigger element,
 *   e.g. the first-visit HowToPlay modal or the game-end Result modal). See the
 *   effect below for why this is needed and how it works.
 */
export function useDialog(
  open: boolean,
  onClose: () => void,
  returnFocusRef?: React.RefObject<HTMLElement | null>,
): UseDialogReturn {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      // A native modal <dialog> restores focus on close to the element that was
      // focused when showModal() was called (the "previously focused element"
      // in the HTML spec). For a dialog opened from a trigger button that is
      // correct. But auto-opened dialogs (first-visit HowToPlay / game-end
      // Result) open while nothing meaningful is focused, so the previously
      // focused element is <body> and focus is lost on close (Esc/backdrop/
      // close button all route through the native close).
      //
      // To fix this without depending on the ordering of the close event vs.
      // native focus restoration, we move focus onto returnFocusRef *before*
      // showModal(). That element then becomes the previously focused element,
      // so native restoration returns focus to it on every close path. The
      // pre-showModal focus is overwritten synchronously by showModal()'s own
      // initial focus and is never painted (no visible flash).
      //
      // We only redirect when there is no meaningful opener (activeElement is
      // <body> or null). When opened from a trigger button, we leave native
      // restoration untouched so focus returns to that button as before.
      const opener = document.activeElement;
      if (
        returnFocusRef?.current &&
        (opener === null || opener === document.body)
      ) {
        returnFocusRef.current.focus();
      }
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, returnFocusRef]);

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
