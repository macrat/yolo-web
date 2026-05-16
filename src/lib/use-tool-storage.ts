"use client";

/**
 * useToolStorage: localStorage 永続化 Hook
 *
 * 責務:
 * - key 命名規約: `yolos-tool-<slug>-<purpose>` 形式を想定（検証は呼び出し側の責務）
 * - key 変更時: 新 key で初期化し、旧 key エントリは放置
 * - JSON parse 失敗時: initialValue にフォールバック（エラーをスローしない）
 * - setItem 失敗時: silent fail（console.warn のみ、UI を壊さない）
 *
 * SSR/Hydration 対応:
 * useState<T>(initialValue) で初期化し、useEffect 内で localStorage を読み込む。
 * SSR 時は localStorage にアクセスしないため Hydration 不整合が発生しない。
 * 参照: docs/knowledge/nextjs.md §4
 */

import { useState, useEffect, useCallback } from "react";

/**
 * localStorage に値を永続化する汎用 Hook。
 *
 * @param key     - ストレージキー（命名規約: `yolos-tool-<slug>-<purpose>`）
 * @param initialValue - localStorage に値がない / 読み込みに失敗した場合の初期値
 * @returns [現在の値, 値を更新する setter]
 */
export function useToolStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  // SSR/Hydration 対応: 初期値で初期化し、useEffect 内で localStorage を読む
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // SSR/Hydration 対応として localStorage 読み込みは useEffect 内で行う必要がある。
    // 参照: docs/knowledge/nextjs.md §4
    // useEffect 内での setState は通常避けるべきだが、ここは外部システム（localStorage）
    // との同期が目的であり、このルールの想定するユースケースに合致する。
    // (iii) JSON parse 失敗時に initialValue にフォールバック
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T); // eslint-disable-line react-hooks/set-state-in-effect
      }
    } catch {
      // JSON parse 失敗 / localStorage アクセス不可 → initialValue のまま維持
    }
    // key が変わったときに新 key で初期化する（旧 key の値は参照しない）
  }, [key]);

  const setValue = useCallback(
    (value: T): void => {
      // state を更新（localStorage 書き込み失敗時も UI は壊さない）
      setStoredValue(value);
      // (iv) setItem 失敗時は silent fail
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        // QuotaExceededError 等: 警告のみ、エラーをスローしない
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[useToolStorage] localStorage.setItem failed for key "${key}":`,
            error,
          );
        }
      }
    },
    [key],
  );

  return [storedValue, setValue];
}
