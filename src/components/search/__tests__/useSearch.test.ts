import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearch } from "../useSearch";
import type { SearchDocument } from "@/lib/search/types";

const mockDocuments: SearchDocument[] = [
  {
    id: "tool:char-count",
    type: "tool",
    title: "文字数カウント",
    description: "テキストの文字数を数えるツール",
    keywords: ["文字数", "カウント", "Character Count"],
    url: "/tools/char-count",
    category: "text",
  },
  {
    id: "kanji:山",
    type: "kanji",
    title: "山",
    description: "やま、さん",
    keywords: ["サン", "やま"],
    url: "/dictionary/kanji/山",
    category: "nature",
    extra: "山脈 登山",
  },
  {
    id: "game:kanji-kanaru",
    type: "game",
    title: "漢字カナール",
    description: "漢字を当てるパズルゲーム",
    keywords: ["漢字", "パズル"],
    url: "/games/kanji-kanaru",
    extra: "初級〜中級",
  },
  {
    id: "blog:test-post",
    type: "blog",
    title: "テスト記事",
    description: "テスト用のブログ記事です",
    keywords: ["テスト"],
    url: "/blog/test-post",
    category: "technical",
  },
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDocuments,
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useSearch", () => {
  test("initial state has empty query and results", () => {
    const { result } = renderHook(() => useSearch());
    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("loadIndex fetches and loads documents", async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.loadIndex();
    });

    expect(fetch).toHaveBeenCalledWith("/api/search-index");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("search returns relevant results after index is loaded", async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.loadIndex();
    });

    act(() => {
      result.current.setQuery("漢字");
    });

    // Advance debounce timer
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.length).toBeGreaterThan(0);
    // Should find kanji-related items
    const allItems = result.current.results.flatMap((g) => g.items);
    const hasKanjiResult = allItems.some(
      (item) =>
        item.document.title.includes("漢字") ||
        item.document.keywords.includes("漢字"),
    );
    expect(hasKanjiResult).toBe(true);
  });

  test("results are grouped by content type", async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.loadIndex();
    });

    act(() => {
      result.current.setQuery("漢字");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    for (const group of result.current.results) {
      expect(group.type).toBeTruthy();
      expect(group.label).toBeTruthy();
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  test("clearSearch resets query and results", async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.loadIndex();
    });

    act(() => {
      result.current.setQuery("漢字");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.query).toBe("漢字");
    expect(result.current.results.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual([]);
  });

  test("empty query returns no results", async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.loadIndex();
    });

    act(() => {
      result.current.setQuery("");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results).toEqual([]);
  });

  test("handles fetch error gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.loadIndex();
    });

    expect(result.current.error).toBe(
      "検索インデックスの読み込みに失敗しました。ページを再読み込みしてください。",
    );
    expect(result.current.isLoading).toBe(false);
  });
});
