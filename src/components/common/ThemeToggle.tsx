"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

const THEME_CYCLE = ["system", "light", "dark"] as const;

const THEME_LABELS: Record<string, string> = {
  system: "システム設定に従う",
  light: "ライトモード",
  dark: "ダークモード",
};

/**
 * Sun icon for light mode
 */
function SunIcon() {
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
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

/**
 * Moon icon for dark mode
 */
function MoonIcon() {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Monitor icon for system mode
 */
function SystemIcon() {
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
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const currentIndex = THEME_CYCLE.indexOf(
      (theme as (typeof THEME_CYCLE)[number]) ?? "system",
    );
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex]);
  };

  // Avoid hydration mismatch by rendering an invisible placeholder
  // that preserves layout space until the client has mounted.
  if (!mounted) {
    return (
      <button
        className={`${styles.toggle} ${styles.placeholder}`}
        type="button"
        aria-label="テーマを切り替え"
        disabled
      >
        <SystemIcon />
      </button>
    );
  }

  const currentTheme = theme ?? "system";
  const label = THEME_LABELS[currentTheme] ?? "テーマを切り替え";

  return (
    <button
      className={styles.toggle}
      onClick={cycleTheme}
      type="button"
      aria-label={`現在: ${label} - クリックでテーマを切り替え`}
      title={label}
    >
      {currentTheme === "dark" && <MoonIcon />}
      {currentTheme === "light" && <SunIcon />}
      {currentTheme === "system" && <SystemIcon />}
    </button>
  );
}
