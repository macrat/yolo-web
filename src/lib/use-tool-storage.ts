"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * useToolStorage — ツール固有キーによる localStorage 永続化 Hook。
 *
 * `useState` の永続化版として使える。
 * - 初回マウント時に localStorage から値を復元する
 * - 値が変更されると localStorage に自動保存する
 * - サーバーサイドレンダリング（SSR）では defaultValue をそのまま返す
 * - localStorage が使えない環境（プライベートブラウジング等）ではインメモリで動作する
 *
 * 設計:
 * - ツール固有の保存キーはスラッグ等から導出し、呼び出し元が指定する
 * - 「前回の入力を復元しました」等の通知 UI は呼び出し元の責務
 *
 * @param key ツール固有の保存キー（例: "tool:keigo-reference:input"）
 * @param defaultValue 復元できない場合のデフォルト値
 * @returns [現在の値, 値を更新する関数]
 */
function useToolStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  // クライアントサイドで localStorage からの復元を試みる（マウント後の初回のみ）
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored) as T;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore persisted value from localStorage on mount (external system sync)
        setValue(parsed);
      }
    } catch {
      // 読み込み失敗時は defaultValue のまま使用する
    }
    // key が変わった場合は再実行して最新の保存値を復元する
  }, [key]);

  // 値を更新して localStorage に保存する関数
  const setAndPersist = useCallback(
    (newValue: T) => {
      setValue(newValue);
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch {
        // 保存失敗時（容量不足等）はインメモリの値だけ更新する
      }
    },
    [key],
  );

  return [value, setAndPersist];
}

export default useToolStorage;
