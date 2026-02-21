import { forwardRef } from "react";
import styles from "./SearchInput.module.css";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  activeDescendant?: string;
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ value, onChange, isLoading, activeDescendant }, ref) {
    return (
      <div className={styles.wrapper}>
        <svg
          className={styles.icon}
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
        <input
          ref={ref}
          className={styles.input}
          type="search"
          placeholder="検索キーワードを入力..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="サイト内検索"
          aria-activedescendant={activeDescendant}
          aria-controls="search-results-listbox"
          autoFocus
          autoComplete="off"
          role="combobox"
          aria-expanded={true}
          aria-autocomplete="list"
        />
        {isLoading && (
          <span className={styles.spinner} aria-label="読み込み中" />
        )}
        {!isLoading && value && (
          <button
            className={styles.clear}
            onClick={() => onChange("")}
            type="button"
            aria-label="検索をクリア"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

export default SearchInput;
