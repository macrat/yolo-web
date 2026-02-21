"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "./useSearch";
import SearchInput from "./SearchInput";
import SearchResults, {
  flattenItems,
  getResultOptionId,
} from "./SearchResults";
import styles from "./SearchModal.module.css";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { query, setQuery, results, isLoading, error, loadIndex, clearSearch } =
    useSearch();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(-1);

  const flatItems = useMemo(() => flattenItems(results), [results]);

  // Wrap setQuery to also reset active index when input changes
  const handleQueryChange = useCallback(
    (q: string) => {
      setActiveIndex(-1);
      setQuery(q);
    },
    [setQuery],
  );

  // Wrap onClose to also reset active index
  const handleClose = useCallback(() => {
    setActiveIndex(-1);
    clearSearch();
    onClose();
  }, [onClose, clearSearch]);

  // Load index on first open
  useEffect(() => {
    if (isOpen) {
      loadIndex();
    }
  }, [isOpen, loadIndex]);

  // Lock body scroll when open
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

  // Keyboard navigation: ESC, ArrowUp/Down, Enter
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

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
          handleClose();
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

  // Clear search when modal closes (e.g., via Cmd+K toggle or isOpen prop change)
  useEffect(() => {
    if (!isOpen) {
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  // Compute the aria-activedescendant value
  const activeDescendant =
    activeIndex >= 0 ? getResultOptionId(activeIndex) : undefined;

  // Determine whether the listbox is actually visible in SearchResults.
  // The listbox renders only when there is a non-empty query, results exist,
  // and no error has occurred.
  const isListboxVisible =
    query.trim() !== "" && results.length > 0 && error === null;

  if (!isOpen) return null;

  return (
    <>
      <div
        className={styles.overlay}
        onClick={handleClose}
        aria-hidden="true"
        data-testid="search-overlay"
      />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="サイト内検索"
        id="search-modal-dialog"
      >
        <SearchInput
          value={query}
          onChange={handleQueryChange}
          isLoading={isLoading}
          isListboxVisible={isListboxVisible}
          activeDescendant={activeDescendant}
        />
        <SearchResults
          results={results}
          query={query}
          onSelect={handleClose}
          error={error}
          activeIndex={activeIndex}
        />
      </div>
    </>
  );
}
