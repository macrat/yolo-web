"use client";

import { useState, useCallback } from "react";
import Button from "@/components/Button";
import styles from "./ResultCopyArea.module.css";

interface ResultCopyAreaProps {
  /** コピー対象のテキスト */
  text: string;
  /** コピーボタンのラベル（デフォルト: "コピー"） */
  buttonLabel?: string;
  /** コピー完了時のフィードバック文言（デフォルト: "コピーしました"） */
  feedbackLabel?: string;
  /** コピー完了フィードバックを表示する時間（ms、デフォルト: 2000） */
  feedbackDuration?: number;
  /** 追加クラス */
  className?: string;
}

/**
 * ResultCopyArea — ツール結果テキストのコピー UX コンポーネント。
 *
 * 「コピー」ボタンとコピー完了フィードバックを提供する。
 * aria-live="polite" でスクリーンリーダーにもフィードバックを伝える。
 *
 * 設計:
 * - コピー先への変換処理は呼び出し元の責務（このコンポーネントは変換しない）
 * - SNS シェア機能は ShareButtons コンポーネントが担う（責務分離）
 * - DESIGN.md §5: Button コンポーネントを活用
 */
function ResultCopyArea({
  text,
  buttonLabel = "コピー",
  feedbackLabel = "コピーしました",
  feedbackDuration = 2000,
  className,
}: ResultCopyAreaProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), feedbackDuration);
    } catch {
      // clipboard API が使えない環境では何もしない
    }
  }, [text, feedbackDuration]);

  return (
    <div className={[styles.container, className].filter(Boolean).join(" ")}>
      <Button
        variant="default"
        size="small"
        onClick={handleCopy}
        aria-label={copied ? feedbackLabel : buttonLabel}
      >
        {copied ? feedbackLabel : buttonLabel}
      </Button>
      {/* スクリーンリーダー向けフィードバック（aria-live） */}
      <span role="status" aria-live="polite" className={styles.srOnly}>
        {copied ? feedbackLabel : ""}
      </span>
    </div>
  );
}

export default ResultCopyArea;
