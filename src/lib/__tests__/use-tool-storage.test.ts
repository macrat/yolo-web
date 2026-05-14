/**
 * useToolStorage のユニットテスト
 *
 * localStorage 永続化 Hook のテスト。
 * - デフォルト値から開始する
 * - 値を更新すると localStorage に保存する
 * - 既存の localStorage の値を復元する
 * - localStorage が使えない場合でもインメモリで動作する
 */

import { expect, test, describe, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useToolStorage from "@/lib/use-tool-storage";

// localStorage モック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe("useToolStorage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  test("初回レンダリングでデフォルト値を返す", () => {
    const { result } = renderHook(() =>
      useToolStorage("test-key", "default-value"),
    );
    // hydration 前はデフォルト値
    expect(result.current[0]).toBe("default-value");
  });

  test("setAndPersist を呼ぶと値が更新される", () => {
    const { result } = renderHook(() => useToolStorage("test-key", "initial"));
    act(() => {
      result.current[1]("updated");
    });
    expect(result.current[0]).toBe("updated");
  });

  test("setAndPersist を呼ぶと localStorage に保存される", () => {
    const { result } = renderHook(() => useToolStorage("test-key", "initial"));
    act(() => {
      result.current[1]("saved-value");
    });
    expect(localStorageMock.getItem("test-key")).toBe('"saved-value"');
  });

  test("localStorage に既存の値がある場合に復元する", () => {
    localStorageMock.setItem("existing-key", '"restored-value"');
    const { result } = renderHook(() =>
      useToolStorage("existing-key", "default"),
    );
    // useEffect は非同期のため act() が必要
    act(() => {});
    expect(result.current[0]).toBe("restored-value");
  });

  test("オブジェクト型の値を保存・復元できる", () => {
    const { result } = renderHook(() =>
      useToolStorage<{ count: number }>("obj-key", { count: 0 }),
    );
    act(() => {
      result.current[1]({ count: 42 });
    });
    expect(result.current[0]).toEqual({ count: 42 });
    expect(localStorageMock.getItem("obj-key")).toBe('{"count":42}');
  });

  test("localStorage が使えない場合でもインメモリで動作する", () => {
    // localStorage の setItem を例外発生にする
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = () => {
      throw new Error("Storage quota exceeded");
    };

    const { result } = renderHook(() => useToolStorage("error-key", "default"));
    // エラーが発生しても値はメモリ上で更新される
    expect(() => {
      act(() => {
        result.current[1]("in-memory-value");
      });
    }).not.toThrow();
    expect(result.current[0]).toBe("in-memory-value");

    // 元に戻す
    localStorageMock.setItem = originalSetItem;
  });

  test("localStorage の読み込みが失敗した場合はデフォルト値を使用する", () => {
    // getItem が例外を発生させる
    const originalGetItem = localStorageMock.getItem;
    localStorageMock.getItem = () => {
      throw new Error("Security error");
    };

    const { result } = renderHook(() =>
      useToolStorage("error-key", "fallback"),
    );
    act(() => {});
    expect(result.current[0]).toBe("fallback");

    // 元に戻す
    localStorageMock.getItem = originalGetItem;
  });

  test("キーが異なる場合は独立して保存される", () => {
    const { result: result1 } = renderHook(() =>
      useToolStorage("key-1", "default-1"),
    );
    const { result: result2 } = renderHook(() =>
      useToolStorage("key-2", "default-2"),
    );

    act(() => {
      result1.current[1]("value-1");
      result2.current[1]("value-2");
    });

    expect(result1.current[0]).toBe("value-1");
    expect(result2.current[0]).toBe("value-2");
    expect(localStorageMock.getItem("key-1")).toBe('"value-1"');
    expect(localStorageMock.getItem("key-2")).toBe('"value-2"');
  });
});
