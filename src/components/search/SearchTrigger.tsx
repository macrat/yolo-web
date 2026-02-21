"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import SearchModal from "./SearchModal";
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

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const isMac = useIsMac();
  const mounted = useMounted();

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shortcutLabel = isMac ? "\u2318K" : "Ctrl+K";

  return (
    <>
      <button
        className={styles.trigger}
        onClick={openModal}
        type="button"
        aria-label={`サイト内検索 (${shortcutLabel})`}
        title="サイト内検索"
      >
        <SearchIcon />
        <kbd className={styles.kbd}>{shortcutLabel}</kbd>
      </button>
      {mounted &&
        createPortal(
          <SearchModal isOpen={isOpen} onClose={closeModal} />,
          document.body,
        )}
    </>
  );
}
