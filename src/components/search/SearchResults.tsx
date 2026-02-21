"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { RangeTuple, FuseResultMatch } from "fuse.js";
import type { SearchResultGroup } from "./useSearch";
import { HighlightedText } from "./highlightMatches";
import styles from "./SearchResults.module.css";

export type FlatItem = {
  groupIndex: number;
  itemIndex: number;
  url: string;
};

type SearchResultsProps = {
  results: SearchResultGroup[];
  query: string;
  onSelect: () => void;
  error: string | null;
  activeIndex: number;
};

/** Flatten all result items into a single list for keyboard navigation */
export function flattenItems(groups: SearchResultGroup[]): FlatItem[] {
  const flat: FlatItem[] = [];
  for (let gi = 0; gi < groups.length; gi++) {
    for (let ii = 0; ii < groups[gi].items.length; ii++) {
      flat.push({
        groupIndex: gi,
        itemIndex: ii,
        url: groups[gi].items[ii].document.url,
      });
    }
  }
  return flat;
}

/** Generate a stable ID for a search result option */
export function getResultOptionId(index: number): string {
  return `search-result-option-${index}`;
}

/** Extract match indices for a specific field key from Fuse.js match results */
function getMatchIndices(
  matches: ReadonlyArray<FuseResultMatch>,
  key: string,
): ReadonlyArray<RangeTuple> {
  const match = matches.find((m) => m.key === key);
  return match?.indices ?? [];
}

export default function SearchResults({
  results,
  query,
  onSelect,
  error,
  activeIndex,
}: SearchResultsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.querySelector(
      `[data-result-index="${activeIndex}"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className={styles.container}>
        <p className={styles.hint}>
          ツール、ゲーム、辞典など、サイト内のコンテンツを検索できます
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>
          「{query}」に一致するコンテンツが見つかりませんでした
        </p>
      </div>
    );
  }

  let flatIndex = 0;

  return (
    <div
      className={styles.container}
      ref={listRef}
      role="listbox"
      id="search-results-listbox"
      aria-label="検索結果"
    >
      {results.map((group) => (
        <div key={group.type} className={styles.group}>
          <div className={styles.groupHeader}>
            <span className={styles.groupLabel}>{group.label}</span>
            <span className={styles.groupCount}>{group.items.length}</span>
          </div>
          {group.items.map((item) => {
            const currentFlatIndex = flatIndex++;
            const isActive = currentFlatIndex === activeIndex;
            return (
              <Link
                key={item.document.id}
                href={item.document.url}
                className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                onClick={onSelect}
                role="option"
                aria-selected={isActive}
                id={getResultOptionId(currentFlatIndex)}
                data-result-index={currentFlatIndex}
              >
                <span className={styles.itemTitle}>
                  <HighlightedText
                    text={item.document.title}
                    indices={getMatchIndices(item.matches, "title")}
                    className={styles.highlight}
                  />
                </span>
                <span className={styles.itemDescription}>
                  <HighlightedText
                    text={item.document.description}
                    indices={getMatchIndices(item.matches, "description")}
                    className={styles.highlight}
                  />
                </span>
                <span className={styles.itemUrl}>{item.document.url}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
