"use client";

import { useState, useCallback } from "react";
import styles from "./SearchBox.module.css";

interface SearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

/**
 * 辞典の検索ボックス（(new) デザイン体系版）。
 *
 * legacy 版（src/dictionary/_components/SearchBox.tsx）からのフォーク。
 * TSX ロジックは legacy と不変で、CSS import 行のみ (new) 版へ差し替え。
 */
export default function SearchBox({
  placeholder = "検索...",
  onSearch,
}: SearchBoxProps) {
  const [query, setQuery] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    },
    [onSearch],
  );

  return (
    <div className={styles.wrapper}>
      <input
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        aria-label="検索"
      />
    </div>
  );
}
