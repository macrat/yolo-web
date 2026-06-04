"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * コピー成功時に表示する既定の日本語ラベル。
 * 全ツールで表示文言を統一するためにエクスポートし、
 * 各ツールの Component から参照できるようにする（N-1 要件）。
 */
export const COPIED_LABEL = "コピーしました";

/**
 * コピー済み表示を継続するデフォルト時間（ミリ秒）。
 * options.resetDelay で上書き可能（N-1 要件）。
 */
export const DEFAULT_RESET_DELAY_MS = 2000;

/**
 * コピーターゲットを識別するキーの型。
 * - `string | number`: 複数ターゲットを識別する場合（パターン B/C/D）
 * - `true`: 単一ターゲット用（パターン A。key 省略時に自動設定）
 * - `null`: コピー済みでない状態
 */
export type CopiedKey = string | number | true | null;

export interface UseCopyToClipboardOptions {
  /**
   * コピー済み表示を継続するミリ秒数。
   * 省略時は DEFAULT_RESET_DELAY_MS (2000ms) を使用。
   */
  resetDelay?: number;
}

export interface UseCopyToClipboardReturn {
  /**
   * テキストをクリップボードにコピーする関数。
   * @param text コピーするテキスト
   * @param key 複数ターゲットを識別するキー。省略時は `true`（単一ターゲット相当）。
   */
  copy: (text: string, key?: string | number) => Promise<void>;
  /**
   * 直近にコピーされたターゲットの識別子。
   * - `null`: コピー済みでない（初期状態またはタイムアウト後）
   * - `true`: key を省略してコピーした場合（単一ターゲット用途）
   * - `string | number`: key を指定してコピーした場合
   *
   * 使用例（単一ターゲット）: `copiedKey ? "コピー済み" : "コピー"`
   * 使用例（複数ターゲット）: `copiedKey === "hex" ? "コピー済み" : "コピー"`
   */
  copiedKey: CopiedKey;
}

/**
 * クリップボードコピーと成功フィードバック管理を提供する汎用フック。
 *
 * 既存の5つの state パターンを1つのシグネチャで吸収する:
 * - パターン A: `useState<boolean>` 単一ターゲット → key 省略で `copiedKey === true`
 * - パターン B: `useState<string>` 文字列ラベル複数ターゲット → key に文字列を渡す
 * - パターン C: `useState<型リテラル>` 型リテラル複数ターゲット → key に文字列を渡す
 * - パターン D: `useState<number | null>` 整数 index → key に数値を渡す
 * - パターン E: `useState<boolean>` 複数 boolean → それぞれ別の key（文字列）を渡す
 *
 * aria-live 方針:
 * フックは状態だけを返す。aria-live によるアナウンスは各コンポーネント側で
 * `<span aria-live="polite">{copiedKey ? COPIED_LABEL : ""}</span>` のように実装する。
 * 全ツールで同一文言 COPIED_LABEL を使い、表示継続時間もこのフックの既定に従うことで
 * バラつきを防ぐ（N-1 要件）。
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { resetDelay = DEFAULT_RESET_DELAY_MS } = options;

  const [copiedKey, setCopiedKey] = useState<CopiedKey>(null);

  // AP-I11: タイマー ID を ref で保持し、unmount 時に clearTimeout する
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // unmount 時のタイマークリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string, key?: string | number): Promise<void> => {
      // SSR 安全: サーバーサイドや clipboard 未対応環境では何もしない
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        return;
      }

      try {
        await navigator.clipboard.writeText(text);

        // 前回のタイマーをキャンセルしてから新しいタイマーをセット
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
        }

        // key 省略時は単一ターゲット用途として `true` をセット
        const resolvedKey: CopiedKey = key !== undefined ? key : true;
        setCopiedKey(resolvedKey);

        timerRef.current = setTimeout(() => {
          setCopiedKey(null);
          timerRef.current = null;
        }, resetDelay);
      } catch {
        // clipboard API 失敗時は安全に無視（既存挙動踏襲）
      }
    },
    [resetDelay],
  );

  return { copy, copiedKey };
}
