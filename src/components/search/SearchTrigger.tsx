"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import SearchModal, {
  type CloseReason,
  type SearchModalHandle,
} from "./SearchModal";
import { trackSearchModalOpen } from "@/lib/analytics";
import styles from "./SearchTrigger.module.css";

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const emptySubscribe = () => () => {};

function useIsMac(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/.test(navigator.userAgent),
    () => false,
  );
}

/**
 * Returns true if the event target is a text input element where
 * keyboard shortcuts should not interfere with user input.
 * Checks for <input>, <textarea>, and contentEditable elements.
 *
 * Note: We check both `isContentEditable` (standard DOM API) and the
 * `contenteditable` attribute directly, because some environments (jsdom)
 * do not implement `isContentEditable` as a computed property.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea") return true;
  const el = target as HTMLElement;
  // isContentEditable is the standard API; fall back to attribute check
  // for environments that do not compute it (e.g. jsdom in tests).
  if (el.isContentEditable) return true;
  const attr = el.getAttribute("contenteditable");
  if (attr !== null && attr !== "false") return true;
  return false;
}

export default function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const isMac = useIsMac();

  // Ref to the SearchModal's imperative handle for tracking-only methods
  // (popstate and Cmd+K toggle close paths that bypass handleClose).
  const searchModalRef = useRef<SearchModalHandle>(null);

  // Store the element that was focused when the modal opened, so we can
  // restore focus when the modal closes with reason "dismiss".
  const focusOriginRef = useRef<Element | null>(null);

  // Track whether the modal was closed via a search result selection
  // (reason='navigation'). When true, the cleanup function in the history
  // useEffect must skip history.back() because Next.js router.push() will
  // handle navigation and will naturally overwrite the dummy history entry.
  // Calling history.back() in that case would conflict with router navigation.
  const closedByNavigationRef = useRef(false);

  // Mirror isOpen into a ref so the Cmd+K handler (registered with an empty
  // dependency array) can read the current value without stale closure issues.
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const openModal = useCallback(() => {
    // Record the currently focused element before opening
    focusOriginRef.current = document.activeElement;
    trackSearchModalOpen();
    setIsOpen(true);
  }, []);

  // closeModal is called by SearchModal with a reason.
  // On "dismiss" (ESC / backdrop click), we restore focus to the element
  // that was active when the modal opened.
  // On "navigation" (search result selected), we skip focus restoration
  // because the page will navigate to a new URL.
  const closeModal = useCallback((reason: CloseReason) => {
    if (reason === "navigation") {
      // Record that we are closing due to navigation so the history cleanup
      // can skip history.back() and avoid conflicting with router.push().
      closedByNavigationRef.current = true;
    }
    setIsOpen(false);
    if (reason === "dismiss" && focusOriginRef.current instanceof HTMLElement) {
      focusOriginRef.current.focus();
    }
    focusOriginRef.current = null;
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!((e.metaKey || e.ctrlKey) && e.key === "k")) return;

      // Ignore keydown events fired during IME composition to avoid
      // interfering with Japanese/Chinese/Korean input methods.
      if (e.isComposing) return;

      // When the modal is closed, ignore shortcuts fired while the user is
      // typing in an input field to avoid disrupting their input.
      // When the modal is already open, allow the shortcut to toggle it
      // closed even if focus is inside the search input.
      if (!isOpenRef.current && isEditableTarget(e.target)) return;
      e.preventDefault();

      // Read the current open state from the ref (avoids stale closure since
      // this handler is registered with an empty dependency array).
      const willClose = isOpenRef.current;

      if (willClose) {
        // Closing via Cmd+K toggle: fire tracking BEFORE setIsOpen so that
        // useSearch tracking flags still reflect the pre-close state.
        searchModalRef.current?.recordCloseAndAbandonedTracking("cmd_k");
      } else {
        // Opening: fire open event
        trackSearchModalOpen();
      }

      setIsOpen((prev) => {
        if (!prev) {
          // Opening: record the focused element
          focusOriginRef.current = document.activeElement;
        } else {
          // Closing via Cmd+K toggle: restore focus to the origin element,
          // treating it like a "dismiss" (same as ESC / backdrop click).
          if (focusOriginRef.current instanceof HTMLElement) {
            focusOriginRef.current.focus();
          }
          focusOriginRef.current = null;
        }
        return !prev;
      });
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync browser history with modal open/close state so that the
  // mobile back button closes the modal instead of navigating away.
  useEffect(() => {
    if (!isOpen) return;

    // Push a dummy history entry when the modal opens
    window.history.pushState({ searchModalOpen: true }, "");

    // Reset the navigation flag each time the modal opens so that a new
    // open/close cycle starts fresh.
    closedByNavigationRef.current = false;

    // Track whether the modal was closed via the browser back button
    let closedByPopState = false;

    const handlePopState = () => {
      // (1) Set closedByPopState first so the useEffect cleanup can safely
      //     skip history.back() even if the tracking call below throws.
      closedByPopState = true;
      // (2) Fire tracking BEFORE setIsOpen so useSearch tracking flags still
      //     reflect the pre-close state when recordCloseAndAbandonedTracking runs.
      searchModalRef.current?.recordCloseAndAbandonedTracking("popstate");
      // (3) Close the modal
      setIsOpen(false);
      // (4) popstate via back button: restore focus without needing reason
      // (treated like "dismiss" — no page navigation)
      if (focusOriginRef.current instanceof HTMLElement) {
        focusOriginRef.current.focus();
      }
      focusOriginRef.current = null;
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      // Only call history.back() to remove our dummy entry when:
      // 1. The modal was NOT closed by the back button (popstate already consumed it).
      // 2. The modal was NOT closed via a search result navigation. In that case
      //    Next.js router.push() handles navigation and will naturally overwrite the
      //    dummy entry — calling back() here would conflict with that navigation.
      // 3. The current history state still has our searchModalOpen flag, meaning the
      //    dummy entry is still present. If the state has been replaced by an external
      //    navigation (e.g., Next.js internal routing), the dummy entry is already gone
      //    and calling back() would navigate the user away unexpectedly.
      if (
        !closedByPopState &&
        !closedByNavigationRef.current &&
        (window.history.state as Record<string, unknown> | null)
          ?.searchModalOpen === true
      ) {
        window.history.back();
      }
    };
  }, [isOpen]);

  const shortcutLabel = isMac ? "\u2318K" : "Ctrl+K";

  return (
    <>
      <button
        className={styles.trigger}
        onClick={openModal}
        type="button"
        aria-label={`サイト内検索 (${shortcutLabel})`}
        aria-expanded={isOpen}
        aria-controls="search-modal-dialog"
        aria-haspopup="dialog"
        title="サイト内検索"
      >
        <SearchIcon />
        {/* デスクトップのみ「検索」テキストを表示して視認性を高める */}
        <span className={styles.searchLabel}>検索</span>
        <kbd className={styles.kbd}>{shortcutLabel}</kbd>
      </button>
      {/* <dialog> is always in the DOM; visibility is controlled via showModal()/close() */}
      <SearchModal ref={searchModalRef} isOpen={isOpen} onClose={closeModal} />
    </>
  );
}
