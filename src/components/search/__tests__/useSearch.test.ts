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
    url: "/play/kanji-kanaru",
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

    expect(fetch).toHaveBeenCalledWith("/search-index.json");
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

    // Every result item should have a matches array
    for (const item of allItems) {
      expect(Array.isArray(item.matches)).toBe(true);
    }
    // At least one item should have non-empty matches
    const hasMatches = allItems.some((item) => item.matches.length > 0);
    expect(hasMatches).toBe(true);
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

describe("useSearch - tracking APIs", () => {
  test("getHasSearched and getHadAnyInput are exposed in return value", () => {
    const { result } = renderHook(() => useSearch());
    expect(typeof result.current.getHasSearched).toBe("function");
    expect(typeof result.current.getHadAnyInput).toBe("function");
    expect(typeof result.current.resetTracking).toBe("function");
  });

  test("getHasSearched returns false initially", () => {
    const { result } = renderHook(() => useSearch());
    expect(result.current.getHasSearched()).toBe(false);
  });

  test("getHadAnyInput returns false initially", () => {
    const { result } = renderHook(() => useSearch());
    expect(result.current.getHadAnyInput()).toBe(false);
  });

  test("getHadAnyInput returns true after setQuery with non-empty string", () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("a");
    });

    expect(result.current.getHadAnyInput()).toBe(true);
  });

  test("getHadAnyInput returns true after setQuery with whitespace-only string", () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("   ");
    });

    // q.length > 0 判定: 空白のみでも入力痕跡あり
    expect(result.current.getHadAnyInput()).toBe(true);
  });

  test("getHadAnyInput remains false when setQuery is called with empty string", () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("");
    });

    expect(result.current.getHadAnyInput()).toBe(false);
  });

  test("getHasSearched returns true after performSearch fires via debounce", async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.loadIndex();
    });

    act(() => {
      result.current.setQuery("漢字");
    });

    // デバウンス後に trackSearch と同条件で hasSearchedRef が立つ
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.getHasSearched()).toBe(true);
  });

  test("getHasSearched returns true even when Fuse returns zero results", async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.loadIndex();
    });

    act(() => {
      // 検索結果が 0 件になるクエリ（mockDocuments に存在しない文字列）
      result.current.setQuery("zzzzz_no_match_xyz");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // 結果は 0 件
    expect(result.current.results).toEqual([]);
    // しかし trackSearch は発火するので hasSearchedRef も立つ
    expect(result.current.getHasSearched()).toBe(true);
  });

  test("getHasSearched remains false when index is not loaded", () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("漢字");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // fuseRef.current が null のため performSearch の条件分岐に入らない
    expect(result.current.getHasSearched()).toBe(false);
  });

  test("resetTracking resets both flags to false", async () => {
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

    // 両フラグが立っていることを確認
    expect(result.current.getHasSearched()).toBe(true);
    expect(result.current.getHadAnyInput()).toBe(true);

    act(() => {
      result.current.resetTracking();
    });

    expect(result.current.getHasSearched()).toBe(false);
    expect(result.current.getHadAnyInput()).toBe(false);
  });

  test("clearSearch does not reset tracking flags", async () => {
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

    expect(result.current.getHasSearched()).toBe(true);
    expect(result.current.getHadAnyInput()).toBe(true);

    act(() => {
      result.current.clearSearch();
    });

    // clearSearch は ref に触れないのでフラグは残る
    expect(result.current.getHasSearched()).toBe(true);
    expect(result.current.getHadAnyInput()).toBe(true);
  });
});
