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
  /** Callback for the dialog's onPointerDown event: notes where a press starts. */
  handleBackdropPointerDown: (e: React.PointerEvent<HTMLDialogElement>) => void;
  /**
   * Callback for the dialog's onClick event: closes when both the press and the
   * release were on the backdrop (outside the dialog box).
   */
  handleBackdropClick: (e: React.MouseEvent<HTMLDialogElement>) => void;
}

/**
 * Custom hook that manages native <dialog> element open/close logic.
 *
 * Encapsulates the repeated pattern found in all 12 game modals:
 * - Syncs the dialog open state with the `open` prop via showModal()/close()
 * - Provides a close handler that calls the onClose callback
 * - Provides backdrop handlers that close on a press that starts and ends
 *   outside the dialog
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
      // so native restoration returns focus to it on every close path (Esc /
      // backdrop / close button). The pre-showModal focus is overwritten
      // synchronously by showModal()'s own initial focus and is never painted.
      //
      // preventScroll is essential: the anchor (the game's <h1>) sits at the top
      // of the page, but an auto-opened modal can appear while the user is
      // scrolled down (e.g. the game-end Result modal). A plain focus() would
      // scroll the page to the anchor here, and closing would leave the user
      // yanked to the top. With preventScroll we keep their scroll position;
      // native focus restoration on close does not scroll either (verified in a
      // real browser), so focus is retained AND the scroll position is kept.
      //
      // We only redirect when there is no meaningful opener (activeElement is
      // <body> or null). When opened from a trigger button, we leave native
      // restoration untouched so focus returns to that button as before.
      const opener = document.activeElement;
      if (
        returnFocusRef?.current &&
        (opener === null || opener === document.body)
      ) {
        returnFocusRef.current.focus({ preventScroll: true });
      }
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, returnFocusRef]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Whether the current press started on the backdrop. A click is dispatched to
  // the common ancestor of where the press started and where it ended, so a
  // drag from the dialog's text out onto the backdrop arrives as a click on the
  // <dialog> outside its box; only a press that also started there closes it.
  const pressStartedOnBackdropRef = useRef(false);

  const handleBackdropPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDialogElement>) => {
      pressStartedOnBackdropRef.current = isOnBackdrop(e);
    },
    [],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const pressStartedOnBackdrop = pressStartedOnBackdropRef.current;
      pressStartedOnBackdropRef.current = false;
      if (pressStartedOnBackdrop && isOnBackdrop(e)) {
        onClose();
      }
    },
    [onClose],
  );

  return {
    dialogRef,
    handleClose,
    handleBackdropPointerDown,
    handleBackdropClick,
  };
}

/**
 * Whether a pointer event is on the backdrop: it targets the <dialog> element
 * itself, outside its box. Events on the dialog's contents target those
 * elements, and a button activated with Enter/Space fires a click at (0, 0), so
 * the coordinates alone would mistake it for the backdrop. The dialog's own
 * padding is the <dialog> element too, which the coordinates keep inside.
 */
function isOnBackdrop(e: React.MouseEvent<HTMLDialogElement>): boolean {
  if (e.target !== e.currentTarget) return false;
  const rect = e.currentTarget.getBoundingClientRect();
  return (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  );
}
