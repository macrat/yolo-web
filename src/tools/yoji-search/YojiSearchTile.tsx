"use client";

import { useState, useMemo, useId } from "react";
import Panel from "@/components/Panel";
import Input from "@/components/Input";
import SegmentedControl from "@/components/SegmentedControl";
import {
  YOJI_CATEGORY_LABELS,
  YOJI_DIFFICULTY_LABELS,
} from "@/dictionary/_lib/types";
import type {
  YojiCategory,
  YojiDifficulty,
  YojiOrigin,
} from "@/dictionary/_lib/types";
import { filterYoji, YOJI_COUNT } from "./logic";
import styles from "./YojiSearchTile.module.css";

export type YojiSearchTileVariant = "full";

export interface YojiSearchTileProps {
  variant?: YojiSearchTileVariant;
  as?: "section" | "div" | "article" | "aside";
  className?: string;
}

const CATEGORY_OPTIONS = [
  { label: "すべて", value: "all" },
  ...Object.entries(YOJI_CATEGORY_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

const DIFFICULTY_OPTIONS = [
  { label: "すべて", value: "all" },
  ...Object.entries(YOJI_DIFFICULTY_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

const ORIGIN_OPTIONS = [
  { label: "すべて", value: "all" },
  { label: "日本", value: "日本" },
  { label: "中国", value: "中国" },
  { label: "不明", value: "不明" },
];

const STRUCTURE_LABELS: Record<string, string> = {
  対句: "対句",
  組合せ: "組合せ",
  因果: "因果",
};

/** Initial number of results shown, and how many more each "もっと見る" reveals */
const PAGE_SIZE = 50;

export default function YojiSearchTile({
  variant: _variant = "full",
  as,
  className,
}: YojiSearchTileProps) {
  // Keep variant reference for future use
  void _variant;

  const uid = useId();
  const searchId = `${uid}-search`;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<YojiCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<YojiDifficulty | "all">("all");
  const [origin, setOrigin] = useState<YojiOrigin | "all">("all");
  const [expandedYoji, setExpandedYoji] = useState<string | null>(null);

  const hasActiveFilter =
    query.trim() !== "" ||
    category !== "all" ||
    difficulty !== "all" ||
    origin !== "all";

  // How many results are currently revealed. Starts at one page and grows via
  // the "もっと見る" button so a "一覧"(browse-all) visitor can reach every entry.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const results = useMemo(
    () => filterYoji({ query, category, difficulty, origin }),
    [query, category, difficulty, origin],
  );

  // Any change to the query/filters resets the reveal count to one page.
  // Done during render (React's "adjust state when inputs change" pattern)
  // instead of in an effect, to avoid a cascading extra render.
  const filterKey = `${query}|${category}|${difficulty}|${origin}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  // Browse-first: show the list even before any keyword/filter so visitors
  // arriving with a "一覧"(browse) intent see idioms immediately instead of a
  // blank screen. Searching/filtering narrows the same list.
  const displayedResults = results.slice(0, visibleCount);
  const remainingCount = results.length - displayedResults.length;

  const toggleExpand = (yoji: string) => {
    setExpandedYoji((prev) => (prev === yoji ? null : yoji));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    yoji: string,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleExpand(yoji);
    }
  };

  return (
    <Panel as={as} className={className}>
      <div className={styles.inner}>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Input
              id={searchId}
              type="search"
              placeholder="四字熟語・読み・意味で検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="四字熟語を検索"
            />
          </div>
        </div>

        <div className={styles.filters}>
          <SegmentedControl
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(val) => setCategory(val as YojiCategory | "all")}
            aria-label="カテゴリで絞り込み"
            className={styles.categoryControl}
          />
          <div className={styles.subFilters}>
            <SegmentedControl
              options={DIFFICULTY_OPTIONS}
              value={String(difficulty)}
              onChange={(val) =>
                setDifficulty(
                  val === "all" ? "all" : (Number(val) as YojiDifficulty),
                )
              }
              aria-label="難易度で絞り込み"
            />
            <SegmentedControl
              options={ORIGIN_OPTIONS}
              value={origin}
              onChange={(val) => setOrigin(val as YojiOrigin | "all")}
              aria-label="出典で絞り込み"
            />
          </div>
        </div>

        <p className={styles.resultCount} role="status" aria-live="polite">
          {hasActiveFilter
            ? `${YOJI_COUNT}語中 ${results.length}件`
            : `${YOJI_COUNT}語を収録`}
        </p>

        {results.length === 0 ? (
          <p className={styles.emptyState}>
            条件に合う四字熟語が見つかりません
          </p>
        ) : (
          <>
            <ul className={styles.resultList}>
              {displayedResults.map((entry) => (
                <li key={entry.yoji} className={styles.resultItem}>
                  <button
                    type="button"
                    className={styles.resultButton}
                    onClick={() => toggleExpand(entry.yoji)}
                    onKeyDown={(e) => handleKeyDown(e, entry.yoji)}
                    aria-expanded={expandedYoji === entry.yoji}
                    aria-label={`${entry.yoji} の詳細を${expandedYoji === entry.yoji ? "閉じる" : "表示"}`}
                  >
                    <span className={styles.yojiText}>{entry.yoji}</span>
                    <span className={styles.reading}>{entry.reading}</span>
                    <span className={styles.meaning}>{entry.meaning}</span>
                  </button>
                  {expandedYoji === entry.yoji && (
                    <div className={styles.detailPanel}>
                      <dl className={styles.detailList}>
                        <div className={styles.detailRow}>
                          <dt className={styles.detailLabel}>例文</dt>
                          <dd className={styles.detailValue}>
                            {entry.example}
                          </dd>
                        </div>
                        <div className={styles.detailRow}>
                          <dt className={styles.detailLabel}>カテゴリ</dt>
                          <dd className={styles.detailValue}>
                            {YOJI_CATEGORY_LABELS[entry.category]}
                          </dd>
                        </div>
                        <div className={styles.detailRow}>
                          <dt className={styles.detailLabel}>難易度</dt>
                          <dd className={styles.detailValue}>
                            {YOJI_DIFFICULTY_LABELS[entry.difficulty]}
                          </dd>
                        </div>
                        <div className={styles.detailRow}>
                          <dt className={styles.detailLabel}>出典</dt>
                          <dd className={styles.detailValue}>{entry.origin}</dd>
                        </div>
                        <div className={styles.detailRow}>
                          <dt className={styles.detailLabel}>構造</dt>
                          <dd className={styles.detailValue}>
                            {STRUCTURE_LABELS[entry.structure] ??
                              entry.structure}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {remainingCount > 0 && (
              <button
                type="button"
                className={styles.moreButton}
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                もっと見る（他 {remainingCount}件）
              </button>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}
