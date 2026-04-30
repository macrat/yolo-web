"use client";

import { useState, useCallback } from "react";
import Button from "@/components/Button";
import { trackShare } from "@/lib/analytics";
import styles from "./ShareButtons.module.css";

/** サポートする SNS の種別 */
type SnsType = "x" | "line" | "hatena" | "copy";

interface ShareButtonsProps {
  /** 共有するページの URL パス（例: "/blog/my-post"）。window.location.origin と結合して絶対 URL にする */
  url: string;
  /** 共有するページのタイトル */
  title: string;
  /** 表示するボタン一覧。省略時は全ボタンを表示 */
  sns?: SnsType[];
  /** GA4 share イベント用のコンテンツタイプ（例: "tool", "blog"） */
  contentType?: string;
  /** GA4 share イベント用のコンテンツ識別子 */
  contentId?: string;
}

const DEFAULT_SNS: SnsType[] = ["x", "line", "hatena", "copy"];

/**
 * SNS 共有 URL を組み立て、新規タブで開く汎用ユーティリティ。
 * `target="_blank"` + `rel="noopener noreferrer"` でセキュリティを確保する。
 */
function openShareUrl(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * ShareButtons — SNS 共有ボタン群コンポーネント。
 *
 * DESIGN.md §5: Button コンポーネント（variant="default"、size="small"）を再利用
 * DESIGN.md §3: アイコンは原則として使わない
 *
 * 各ボタンは新規タブで開く。aria-label に「（外部サイト・新しいタブで開く）」を付与して
 * アクセシビリティ上の外部遷移を明示する。
 */
export default function ShareButtons({
  url,
  title,
  sns = DEFAULT_SNS,
  contentType,
  contentId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  /** window.location.origin と結合して絶対 URL を返す */
  const getFullUrl = useCallback((): string => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${url}`;
  }, [url]);

  /** trackShare を条件付きで呼ぶ共通ヘルパー */
  const track = useCallback(
    (
      method: "twitter" | "line" | "web_share" | "clipboard" | "hatena",
    ): void => {
      // contentType / contentId の両方が指定された時のみ GA 送信。
      // 呼び出し元から識別子を持たないシェアは「不明」として記録しない設計
      if (contentType && contentId) {
        trackShare(method, contentType, contentId);
      }
    },
    [contentType, contentId],
  );

  const handleShareX = useCallback((): void => {
    const fullUrl = getFullUrl();
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
    openShareUrl(shareUrl);
    track("twitter");
  }, [title, getFullUrl, track]);

  const handleShareLine = useCallback((): void => {
    const fullUrl = getFullUrl();
    const shareUrl = `https://line.me/R/share?text=${encodeURIComponent(title + "\n" + fullUrl)}`;
    openShareUrl(shareUrl);
    track("line");
  }, [title, getFullUrl, track]);

  const handleShareHatena = useCallback((): void => {
    const fullUrl = getFullUrl();
    const shareUrl = `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(fullUrl)}&btitle=${encodeURIComponent(title)}`;
    openShareUrl(shareUrl);
    track("hatena");
  }, [title, getFullUrl, track]);

  const handleCopy = useCallback(async (): Promise<void> => {
    const fullUrl = getFullUrl();
    try {
      await navigator.clipboard.writeText(title + "\n" + fullUrl);
      setCopied(true);
      // 2 秒後に「コピーしました」メッセージを非表示にする
      setTimeout(() => setCopied(false), 2000);
      track("clipboard");
    } catch {
      // クリップボード API が利用できない場合はサイレントに失敗
    }
  }, [title, getFullUrl, track]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttons}>
        {sns.includes("x") && (
          <Button
            variant="default"
            size="small"
            onClick={handleShareX}
            aria-label="X で共有（外部サイト・新しいタブで開く）"
          >
            X でシェア
          </Button>
        )}
        {sns.includes("line") && (
          <Button
            variant="default"
            size="small"
            onClick={handleShareLine}
            aria-label="LINE で共有（外部サイト・新しいタブで開く）"
          >
            LINE でシェア
          </Button>
        )}
        {sns.includes("hatena") && (
          <Button
            variant="default"
            size="small"
            onClick={handleShareHatena}
            aria-label="はてなブックマークに追加（外部サイト・新しいタブで開く）"
          >
            はてブ
          </Button>
        )}
        {sns.includes("copy") && (
          <Button
            variant="default"
            size="small"
            onClick={handleCopy}
            aria-label="URLをコピー"
          >
            URLをコピー
          </Button>
        )}
      </div>
      {/* コピー完了フィードバック。aria-live="polite" でスクリーンリーダーに通知 */}
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "コピーしました" : ""}
      </div>
    </div>
  );
}
