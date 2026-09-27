"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { copyText } from "@/lib/clipboard";

/** 写せたことを知らせる文。 */
export const COPIED_LABEL = "コピーしました";

/** どの写し方でも写せなかったことを知らせる文。 */
export const COPY_FAILED_LABEL = "コピーできませんでした";

/** 写せたことを出しておく既定のミリ秒数。options.resetDelay で替えられる。 */
export const DEFAULT_RESET_DELAY_MS = 2000;

/**
 * 写したものを見分けるキーの型。
 * - `string | number`: 1つのフックで複数のものを写すとき、copy に渡したキー
 * - `true`: キーを省いて写したとき
 * - `null`: 写していない
 */
export type CopiedKey = string | number | true | null;

export interface UseCopyToClipboardOptions {
  /** 写せたことを出しておくミリ秒数。省くと DEFAULT_RESET_DELAY_MS。 */
  resetDelay?: number;
}

export interface UseCopyToClipboardReturn {
  /**
   * 文をクリップボードに写す。
   * @param text 写す文
   * @param key 写したものを見分けるキー。省くと `true`。
   */
  copy: (text: string, key?: string | number) => Promise<void>;
  /** 直近に写せたもののキー。写してから resetDelay ミリ秒たつと null に戻る。 */
  copiedKey: CopiedKey;
  /** 直近に写せなかったもののキー。読み終える前に消さないよう、次に写そうとするまで残る。 */
  failedKey: CopiedKey;
}

/**
 * 文をクリップボードに写し、写せた・写せなかったの状態を返すフック。写し方は `copyText`（クリップボードの API に
 * 拒まれる端末でも、選んだ文を写す方法で写す）に従う。
 *
 * フックは状態だけを返す。結果を写すボタンは、面の字と読み上げの知らせを持つ `CopyButton`
 * （@/components/CopyButton）で組む。
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { resetDelay = DEFAULT_RESET_DELAY_MS } = options;

  const [copiedKey, setCopiedKey] = useState<CopiedKey>(null);
  const [failedKey, setFailedKey] = useState<CopiedKey>(null);

  // 外したあとに状態を変えないよう、タイマーを覚えておき、外すときに止める。
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string, key?: string | number): Promise<void> => {
      const resolvedKey: CopiedKey = key !== undefined ? key : true;
      // 前回のタイマーをキャンセルしてから、結果に応じて知らせを出し直す
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setFailedKey(null);

      if (!(await copyText(text))) {
        setCopiedKey(null);
        setFailedKey(resolvedKey);
        return;
      }

      setCopiedKey(resolvedKey);
      timerRef.current = setTimeout(() => {
        setCopiedKey(null);
        timerRef.current = null;
      }, resetDelay);
    },
    [resetDelay],
  );

  return { copy, copiedKey, failedKey };
}
