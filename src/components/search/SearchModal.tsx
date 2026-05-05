"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
} from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "./useSearch";
import SearchInput from "./SearchInput";
import SearchResults, {
  flattenItems,
  getResultOptionId,
} from "./SearchResults";
import styles from "./SearchModal.module.css";
import {
  trackSearchModalClose,
  trackSearchAbandoned,
  trackSearchResultClick,
  type CloseReasonValue,
} from "@/lib/analytics";

/**
 * Normalize a URL to a site-internal path (pathname + search + hash).
 *
 * We use new URL(url, location.origin) to parse the URL defensively:
 * - If `url` is already a relative path (e.g. "/tools/char-count"), this
 *   resolves it against the current origin and extracts only the path part.
 * - If `url` somehow contains an absolute external URL, only the path is
 *   returned, stripping the origin — ensuring we never send external URLs to GA.
 *
 * SSR guard: location is not available server-side, so we return the raw url
 * as a fallback (build-index.ts only generates site-internal paths anyway).
 */
function toSitePath(url: string): string {
  if (typeof window === "undefined") return url;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    // Malformed URL — return as-is (build-index.ts ensures these are valid paths)
    return url;
  }
}

/**
 * The reason a search modal was closed — used for focus restoration logic.
 * Kept as a two-value union (separate from GA4's CloseReasonValue) because
 * SearchTrigger only needs to know "navigation vs dismiss" to decide whether
 * to restore focus to the trigger element.
 */
export type CloseReason = "navigation" | "dismiss";

/**
 * Handle exposed via useImperativeHandle for external callers (SearchTrigger).
 * Only tracking methods are exposed — no state mutation or onClose calls.
 */
export type SearchModalHandle = {
  /**
   * Records the close event and, if abandoned, fires search_abandoned.
   * Must be called BEFORE setIsOpen(false) so that tracking flags in useSearch
   * still reflect the pre-close state when this method runs.
   * Does NOT call onClose or mutate isOpen state.
   */
  recordCloseAndAbandonedTracking: (reason: CloseReasonValue) => void;
};

type SearchModalProps = {
  isOpen: boolean;
  onClose: (reason: CloseReason) => void;
  /** React 19 props-based ref — no forwardRef required. */
  ref?: React.Ref<SearchModalHandle>;
};

export default function SearchModal({
  ref,
  isOpen,
  onClose,
}: SearchModalProps) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    loadIndex,
    clearSearch,
    getHasSearched,
    getHadAnyInput,
    resetTracking,
  } = useSearch();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(-1);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const flatItems = useMemo(() => flattenItems(results), [results]);

  // Expose tracking-only methods to external callers (e.g. SearchTrigger for
  // popstate and Cmd+K close paths that bypass handleClose entirely).
  useImperativeHandle(
    ref,
    () => ({
      recordCloseAndAbandonedTracking: (reason: CloseReasonValue) => {
        const hasSearched = getHasSearched();
        trackSearchModalClose({ close_reason: reason });
        if (!hasSearched) {
          trackSearchAbandoned({ had_query: getHadAnyInput() });
        }
      },
    }),
    [getHasSearched, getHadAnyInput],
  );

  // Wrap setQuery to also reset active index when input changes
  const handleQueryChange = useCallback(
    (q: string) => {
      setActiveIndex(-1);
      setQuery(q);
    },
    [setQuery],
  );

  /**
   * Central close handler for all paths that go through SearchModal itself
   * (ESC / cancel, backdrop click, ✕ button, Enter key navigation).
   *
   * gaReason is the GA4-level CloseReasonValue (6 values) while reason is
   * the focus-restoration CloseReason (2 values) forwarded to the parent.
   *
   * Firing order (per cycle-173 §3 spec):
   *   1. Read abandoned state (getHasSearched)
   *   2. trackSearchModalClose
   *   3. trackSearchAbandoned (only if not searched)
   *   4. clearSearch + onClose (existing order preserved)
   */
  const handleClose = useCallback(
    (reason: CloseReason, gaReason: CloseReasonValue) => {
      const hasSearched = getHasSearched();
      // Step 2: fire close event with GA4 reason
      trackSearchModalClose({ close_reason: gaReason });
      // Step 3: fire abandoned event if user never executed a search
      if (!hasSearched) {
        trackSearchAbandoned({ had_query: getHadAnyInput() });
      }
      // Step 4: reset UI state and notify parent (existing order preserved)
      setActiveIndex(-1);
      clearSearch();
      onClose(reason);
    },
    [onClose, clearSearch, getHasSearched, getHadAnyInput],
  );

  // Open/close the native <dialog> element based on the isOpen prop.
  // showModal() moves the dialog to the top layer; close() removes it.
  // We focus the search input immediately after opening so keyboard navigation
  // works without an extra Tab press.
  // We guard dialog.close() with dialog.open to avoid calling close() on an
  // already-closed dialog (e.g. on initial render before showModal() is called).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      // Reset tracking flags each time the modal opens so abandoned/hasSearched
      // always reflect the current session, not a previous one.
      resetTracking();
      // Focus the search input after opening
      inputRef.current?.focus();
      loadIndex();
    } else if (dialog.open) {
      // Only close if the dialog is currently open to avoid redundant calls
      // on initial render when showModal() has not yet been invoked.
      dialog.close();
      clearSearch();
    }
  }, [isOpen, loadIndex, clearSearch, resetTracking]);

  // Lock body scroll when open.
  // showModal() does not automatically lock scroll, so we manage it manually.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle the native <dialog> cancel event, which is fired by the browser
  // when the user presses Escape. We call e.preventDefault() to suppress the
  // browser's built-in close behavior and handle closing ourselves so that
  // the parent (SearchTrigger) can track the close reason correctly.
  const handleCancel = useCallback(
    (e: React.SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      // "cancel" event = ESC key → GA4 close_reason: "escape"
      handleClose("dismiss", "escape");
    },
    [handleClose],
  );

  // Handle clicks on the <dialog> element itself (i.e., the backdrop area).
  // Clicks that reach the dialog element without hitting any of its children
  // originate from the backdrop — close the modal in that case.
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        // Backdrop click → GA4 close_reason: "backdrop"
        handleClose("dismiss", "backdrop");
      }
    },
    [handleClose],
  );

  // Keyboard navigation: ArrowUp/Down, Enter
  // ESC is now handled via the cancel event above.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (flatItems.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        const item = flatItems[activeIndex];
        if (item) {
          // Fire search_result_click before closing (§3-5: Enter key path)
          const safePath = toSitePath(item.url);
          trackSearchResultClick({ search_term: query, result_url: safePath });
          // Enter key selects a result → GA4 close_reason: "navigation"
          handleClose("navigation", "navigation");
          router.push(item.url);
        }
      }
    },
    [handleClose, flatItems, activeIndex, router, query],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Compute the aria-activedescendant value
  const activeDescendant =
    activeIndex >= 0 ? getResultOptionId(activeIndex) : undefined;

  // Determine whether the listbox is actually visible in SearchResults.
  // The listbox renders only when there is a non-empty query, results exist,
  // and no error has occurred.
  const isListboxVisible =
    query.trim() !== "" && results.length > 0 && error === null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      aria-modal="true"
      aria-label="サイト内検索"
      id="search-modal-dialog"
      onCancel={handleCancel}
      onClick={handleDialogClick}
    >
      <div className={styles.inputRow}>
        <SearchInput
          ref={inputRef}
          value={query}
          onChange={handleQueryChange}
          isLoading={isLoading}
          isListboxVisible={isListboxVisible}
          activeDescendant={activeDescendant}
        />
        {/* Close button: always visible so mobile users (where backdrop is hidden)
            can dismiss the full-screen dialog without needing a swipe or back button. */}
        <button
          type="button"
          className={styles.closeButton}
          aria-label="検索を閉じる"
          onClick={() => handleClose("dismiss", "close_button")}
        >
          ✕
        </button>
      </div>
      <SearchResults
        results={results}
        query={query}
        onSelect={(url) => {
          // Fire search_result_click before closing (§3-5: click path)
          const safePath = toSitePath(url);
          trackSearchResultClick({ search_term: query, result_url: safePath });
          handleClose("navigation", "navigation");
        }}
        error={error}
        activeIndex={activeIndex}
      />
    </dialog>
  );
}
