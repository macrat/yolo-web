"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Fuse, {
  type IFuseOptions,
  type FuseResult,
  type FuseResultMatch,
} from "fuse.js";
import type { SearchDocument, ContentType } from "@/lib/search/types";
import { trackSearch } from "@/lib/analytics";
import {
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ORDER,
  MAX_ITEMS_PER_GROUP,
} from "@/lib/search/types";

export type { FuseResultMatch } from "fuse.js";

export type SearchResultItem = {
  document: SearchDocument;
  score: number;
  matches: ReadonlyArray<FuseResultMatch>;
};

export type SearchResultGroup = {
  type: ContentType;
  label: string;
  items: SearchResultItem[];
};

export interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResultGroup[];
  isLoading: boolean;
  error: string | null;
  loadIndex: () => Promise<void>;
  clearSearch: () => void;
  /** モーダル open 以降に trackSearch が発火したかを返す */
  getHasSearched: () => boolean;
  /** モーダル open 以降に 1 文字でも入力痕跡があったかを返す（q.length > 0 判定） */
  getHadAnyInput: () => boolean;
  /** hasSearchedRef と hadAnyInputRef を両方 false にリセットする */
  resetTracking: () => void;
}

const DEBOUNCE_MS = 150;

const FUSE_OPTIONS: IFuseOptions<SearchDocument> = {
  keys: [
    { name: "title", weight: 2.0 },
    { name: "keywords", weight: 1.5 },
    { name: "description", weight: 1.0 },
    { name: "extra", weight: 0.5 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 1,
};

function groupResults(
  fuseResults: FuseResult<SearchDocument>[],
): SearchResultGroup[] {
  const groupMap = new Map<ContentType, SearchResultItem[]>();

  for (const result of fuseResults) {
    const type = result.item.type;
    if (!groupMap.has(type)) {
      groupMap.set(type, []);
    }
    const items = groupMap.get(type)!;
    if (items.length < MAX_ITEMS_PER_GROUP) {
      items.push({
        document: result.item,
        score: result.score ?? 1,
        matches: result.matches ?? [],
      });
    }
  }

  // Order groups by CONTENT_TYPE_ORDER
  const groups: SearchResultGroup[] = [];
  for (const type of CONTENT_TYPE_ORDER) {
    const items = groupMap.get(type);
    if (items && items.length > 0) {
      groups.push({
        type,
        label: CONTENT_TYPE_LABELS[type],
        items,
      });
    }
  }

  return groups;
}

export function useSearch(): UseSearchReturn {
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<SearchResultGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fuseRef = useRef<Fuse<SearchDocument> | null>(null);
  const indexLoadedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- 検索行動トラッキング用 ref ---
  // モーダル open 以降に trackSearch が発火したか（performSearch の条件分岐と同一）
  const hasSearchedRef = useRef<boolean>(false);
  // モーダル open 以降に 1 文字でも入力されたか（q.length > 0 判定。空白のみも「入力あり」）
  const hadAnyInputRef = useRef<boolean>(false);

  const loadIndex = useCallback(async () => {
    if (indexLoadedRef.current) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/search-index.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const documents: SearchDocument[] = await response.json();
      fuseRef.current = new Fuse(documents, FUSE_OPTIONS);
      indexLoadedRef.current = true;
    } catch {
      setError(
        "検索インデックスの読み込みに失敗しました。ページを再読み込みしてください。",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performSearch = useCallback((q: string) => {
    if (!q.trim() || !fuseRef.current) {
      setResults([]);
      return;
    }
    const fuseResults = fuseRef.current.search(q.trim());
    setResults(groupResults(fuseResults));
    // trackSearch と同じ条件分岐（q.trim() 非空 && fuseRef.current 存在）で
    // hasSearchedRef を立てる。Fuse 結果 0 件でも trackSearch は発火するため同様に立てる。
    hasSearchedRef.current = true;
    trackSearch(q);
  }, []);

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);

      // q.length > 0 の場合に入力痕跡フラグを立てる。
      // q.trim().length ではなく q.length で判定し、空白のみ入力も「入力あり」として記録する。
      if (q.length > 0) {
        hadAnyInputRef.current = true;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        performSearch(q);
      }, DEBOUNCE_MS);
    },
    [performSearch],
  );

  const clearSearch = useCallback(() => {
    setQueryState("");
    setResults([]);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /** モーダル open 以降に trackSearch が発火したかを返す */
  const getHasSearched = useCallback((): boolean => {
    return hasSearchedRef.current;
  }, []);

  /** モーダル open 以降に 1 文字でも入力されたかを返す（q.length > 0 判定） */
  const getHadAnyInput = useCallback((): boolean => {
    return hadAnyInputRef.current;
  }, []);

  /**
   * hasSearchedRef と hadAnyInputRef を両方 false にリセットする。
   * SearchModal の useEffect([isOpen, ...]) の isOpen=true 分岐で呼ぶ。
   * clearSearch とは独立しており、state には触れない。
   */
  const resetTracking = useCallback((): void => {
    hasSearchedRef.current = false;
    hadAnyInputRef.current = false;
  }, []);

  return {
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
  };
}
