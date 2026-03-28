"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "./useSearch";
import SearchInput from "./SearchInput";
import SearchResults, {
  flattenItems,
  getResultOptionId,
} from "./SearchResults";
import styles from "./SearchModal.module.css";

export type CloseReason = "navigation" | "dismiss";

type SearchModalProps = {
  isOpen: boolean;
  onClose: (reason: CloseReason) => void;
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { query, setQuery, results, isLoading, error, loadIndex, clearSearch } =
    useSearch();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(-1);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const flatItems = useMemo(() => flattenItems(results), [results]);

  // Wrap setQuery to also reset active index when input changes
  const handleQueryChange = useCallback(
    (q: string) => {
      setActiveIndex(-1);
      setQuery(q);
    },
    [setQuery],
  );

  // Wrap onClose to also reset active index.
  // reason is forwarded to the parent so it can decide whether to restore focus.
  const handleClose = useCallback(
    (reason: CloseReason) => {
      setActiveIndex(-1);
      clearSearch();
      onClose(reason);
    },
    [onClose, clearSearch],
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
      // Focus the search input after opening
      inputRef.current?.focus();
      loadIndex();
    } else if (dialog.open) {
      // Only close if the dialog is currently open to avoid redundant calls
      // on initial render when showModal() has not yet been invoked.
      dialog.close();
      clearSearch();
    }
  }, [isOpen, loadIndex, clearSearch]);

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
      handleClose("dismiss");
    },
    [handleClose],
  );

  // Handle clicks on the <dialog> element itself (i.e., the backdrop area).
  // Clicks that reach the dialog element without hitting any of its children
  // originate from the backdrop — close the modal in that case.
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        handleClose("dismiss");
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
          handleClose("navigation");
          router.push(item.url);
        }
      }
    },
    [handleClose, flatItems, activeIndex, router],
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
          onClick={() => handleClose("dismiss")}
        >
          ✕
        </button>
      </div>
      <SearchResults
        results={results}
        query={query}
        onSelect={() => handleClose("navigation")}
        error={error}
        activeIndex={activeIndex}
      />
    </dialog>
  );
}
