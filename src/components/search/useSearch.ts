"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Fuse, { type IFuseOptions, type FuseResult } from "fuse.js";
import type { SearchDocument, ContentType } from "@/lib/search/types";
import {
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ORDER,
  MAX_ITEMS_PER_GROUP,
} from "@/lib/search/types";

export type SearchResultItem = {
  document: SearchDocument;
  score: number;
};

export type SearchResultGroup = {
  type: ContentType;
  label: string;
  items: SearchResultItem[];
};

export type UseSearchReturn = {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResultGroup[];
  isLoading: boolean;
  error: string | null;
  loadIndex: () => Promise<void>;
  clearSearch: () => void;
};

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

  const loadIndex = useCallback(async () => {
    if (indexLoadedRef.current) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search-index");
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
  }, []);

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);

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

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    loadIndex,
    clearSearch,
  };
}
