"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Button from "@/components/Button";
import styles from "./ResultCopyArea.module.css";

/** 通知の表示状態 */
type NoticeState = { type: "none" } | { type: "success" } | { type: "failure" };

/** 通知が自動消去されるまでの時間 (ms) */
const NOTICE_DURATION_MS = 2500;

interface ResultCopyAreaProps {
  /** コピー対象の文字列（必須） */
  value: string;
  /** コピーボタンのラベル（デフォルト: "コピー"） */
  label?: string;
}

/**
 * ResultCopyArea — コピー可能な結果領域。
 *
 * docs/tile-and-detail-design.md §3 #3: 結果テキストの表示 + clipboard コピーボタン。
 * 成功時は「コピーしました」、失敗時は「コピーできませんでした」を同一箇所に表示する。
 * clipboard API の存在チェック + try-catch でハンドリングし、silent ignore は行わない。
 *
 * DESIGN.md §5: ボタンは src/components/Button を使う。
 */
function ResultCopyArea({ value, label = "コピー" }: ResultCopyAreaProps) {
  const [notice, setNotice] = useState<NoticeState>({ type: "none" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** タイマーをリセットして通知を指定状態に変更する */
  const showNotice = useCallback((state: NoticeState) => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    setNotice(state);
    timerRef.current = setTimeout(() => {
      setNotice({ type: "none" });
      timerRef.current = null;
    }, NOTICE_DURATION_MS);
  }, []);

  /** アンマウント時にタイマーをクリア */
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    // clipboard API が存在しない場合は即座に失敗通知
    if (!navigator.clipboard) {
      showNotice({ type: "failure" });
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      showNotice({ type: "success" });
    } catch {
      // writeText が拒否された場合（権限エラー等）も失敗通知を表示する
      showNotice({ type: "failure" });
    }
  }, [value, showNotice]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.valueArea}>{value}</div>
      <div className={styles.actions}>
        <Button variant="default" size="small" onClick={handleCopy}>
          {label}
        </Button>
        {notice.type !== "none" && (
          <span
            role="status"
            aria-live="polite"
            className={
              notice.type === "success"
                ? styles.noticeSuccess
                : styles.noticeFailure
            }
          >
            {notice.type === "success"
              ? "コピーしました"
              : "コピーできませんでした"}
          </span>
        )}
      </div>
    </div>
  );
}

export default ResultCopyArea;
