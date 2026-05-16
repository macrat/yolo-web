/**
 * useToolStorage のユニットテスト
 *
 * 責務 4 項目（i〜iv）+ SSR/Hydration 対応を検証する。
 */

import { expect, test, describe, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToolStorage } from "@/lib/use-tool-storage";

describe("useToolStorage", () => {
  beforeEach(() => {
    // localStorage はグローバルのモックをリセット（setup.ts の afterEach.clear() で対応済み）
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // テスト 1: localStorage 不在時（未設定）は initialValue が返る
  test("1. localStorage に値がなければ initialValue で初期化される", async () => {
    const { result } = renderHook(() =>
      useToolStorage("yolos-tool-keigo-reference-search", "initial"),
    );
    // マウント直後は initialValue（useEffect 前）または復元値
    // useEffect が走った後も localStorage に何もなければ initialValue のまま
    await act(async () => {});
    const [value] = result.current;
    expect(value).toBe("initial");
  });

  // テスト 2: localStorage に値があれば復元される
  test("2. localStorage に値があれば useEffect 後に復元される", async () => {
    localStorage.setItem(
      "yolos-tool-keigo-reference-category-filter",
      JSON.stringify("restored"),
    );
    const { result } = renderHook(() =>
      useToolStorage("yolos-tool-keigo-reference-category-filter", "initial"),
    );
    await act(async () => {});
    const [value] = result.current;
    expect(value).toBe("restored");
  });

  // テスト 3: setter で値を更新すると localStorage に書き込まれる
  test("3. setter で値を更新すると localStorage に反映される", async () => {
    const { result } = renderHook(() =>
      useToolStorage("yolos-tool-keigo-reference-search", "initial"),
    );
    await act(async () => {});
    act(() => {
      result.current[1]("updated");
    });
    expect(result.current[0]).toBe("updated");
    const stored = localStorage.getItem("yolos-tool-keigo-reference-search");
    expect(stored).toBe(JSON.stringify("updated"));
  });

  // テスト 4: JSON parse 失敗時に initialValue にフォールバック（エラーをスローしない）
  test("4. localStorage の値が壊れた JSON でも initialValue にフォールバックしエラーをスローしない", async () => {
    localStorage.setItem("yolos-tool-keigo-reference-search", "{ invalid json");
    expect(() =>
      renderHook(() =>
        useToolStorage("yolos-tool-keigo-reference-search", "fallback"),
      ),
    ).not.toThrow();
    const { result } = renderHook(() =>
      useToolStorage("yolos-tool-keigo-reference-search", "fallback"),
    );
    await act(async () => {});
    const [value] = result.current;
    expect(value).toBe("fallback");
  });

  // テスト 5: setItem 失敗時に silent fail（エラーをスローしない、UI を壊さない）
  test("5. setItem が失敗しても silent fail しエラーをスローしない", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    const { result } = renderHook(() =>
      useToolStorage("yolos-tool-keigo-reference-search", "initial"),
    );
    await act(async () => {});
    expect(() => {
      act(() => {
        result.current[1]("new value");
      });
    }).not.toThrow();
    // state は更新されていること（UI は壊れない）
    expect(result.current[0]).toBe("new value");
  });

  // テスト 6: key 変更時の挙動（新 key で初期化、旧 key 放置）
  test("6. key が変わったら新 key で初期化し、旧 key のエントリは放置する", async () => {
    // 旧 key に値をセット
    localStorage.setItem(
      "yolos-tool-old-tool-search",
      JSON.stringify("old value"),
    );
    // 新 key には別の値
    localStorage.setItem(
      "yolos-tool-new-tool-search",
      JSON.stringify("new value"),
    );

    let key = "yolos-tool-old-tool-search";
    const { result, rerender } = renderHook(() =>
      useToolStorage(key, "initial"),
    );
    await act(async () => {});
    expect(result.current[0]).toBe("old value");

    // key を変更して rerender
    key = "yolos-tool-new-tool-search";
    rerender();
    await act(async () => {});
    expect(result.current[0]).toBe("new value");

    // 旧 key のエントリが残っていること（削除されていない）
    expect(localStorage.getItem("yolos-tool-old-tool-search")).toBe(
      JSON.stringify("old value"),
    );
  });

  // テスト 7: localStorage が利用不可（例外スロー）でも initialValue にフォールバックする
  test("7. localStorage.getItem が例外をスローしても initialValue にフォールバックしクラッシュしない", async () => {
    // setup.ts のモックはプレーンオブジェクトなので Storage.prototype への spyOn では
    // intercept できない。window.localStorage のメソッドに直接 spyOn する。
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("localStorage is not available");
    });
    // クラッシュしないこと
    expect(() => {
      renderHook(() =>
        useToolStorage("yolos-tool-keigo-reference-search", "ssr-safe"),
      );
    }).not.toThrow();
    const { result } = renderHook(() =>
      useToolStorage("yolos-tool-keigo-reference-search", "ssr-safe"),
    );
    await act(async () => {});
    // localStorage が使えなくても initialValue が返ること
    expect(result.current[0]).toBe("ssr-safe");
  });
});
