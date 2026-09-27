"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { copyText } from "@/lib/clipboard";

/** 写せたことを出しておくミリ秒数。 */
export const COPIED_DISPLAY_MS = 2000;

/** 1つのコピーのボタンの、いまの状態。 */
export type CopyStatus = "idle" | "copied" | "failed";

export interface UseCopyToClipboardReturn {
  /** 文をクリップボードに写し、写せたかを返す。 */
  copy: (text: string) => Promise<boolean>;
  /**
   * いまの状態。写せたら "copied" になり、COPIED_DISPLAY_MS ミリ秒たつと "idle" に戻る。写せなかったら
   * "failed" になり、読み終える前に消えないよう、次に写そうとするまで残る。
   */
  status: CopyStatus;
}

/**
 * 1つのコピーのボタンのために、文をクリップボードに写し、写せた・写せなかったの状態を返すフック。写し方は
 * `copyText`（クリップボードの API に拒まれる端末でも、選んだ文を写す方法で写す）に従う。面の字と読み上げの
 * 知らせは `CopyButton`（@/components/CopyButton）が持つ。
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [status, setStatus] = useState<CopyStatus>("idle");

  // 外したあとに状態を変えないよう、タイマーを覚えておき、外すときに止める。
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!(await copyText(text))) {
      setStatus("failed");
      return false;
    }

    setStatus("copied");
    timerRef.current = setTimeout(() => {
      setStatus("idle");
      timerRef.current = null;
    }, COPIED_DISPLAY_MS);
    return true;
  }, []);

  return { copy, status };
}
