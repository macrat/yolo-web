"use client";

import { useState, useCallback } from "react";
import Button from "@/components/Button";
import { trackShare } from "@/lib/analytics";
import styles from "./ShareButtons.module.css";

/** サポートする SNS の種別 */
type SnsType = "x" | "line" | "hatena" | "copy";

/** GA4 share イベントの method 値 */
type ShareMethod = "twitter" | "line" | "web_share" | "clipboard" | "hatena";

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

// noopener,noreferrer はタブナビング攻撃と Referer 漏洩の防止
function openShareUrl(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * 共有のボタンの並び。どのボタンも、押すと共有先のページが開くか URL がコピーされる、プライマリでない
 * ボタン（DESIGN.md §6）なので、共通の Button で組む。共有先はロゴや色ではなく文言で言う。
 */
export default function ShareButtons({
  url,
  title,
  sns = DEFAULT_SNS,
  contentType,
  contentId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = useCallback(
    (): string => `${window.location.origin}${url}`,
    [url],
  );

  const track = useCallback(
    (method: ShareMethod): void => {
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
    openShareUrl(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
    );
    track("twitter");
  }, [title, getFullUrl, track]);

  const handleShareLine = useCallback((): void => {
    const fullUrl = getFullUrl();
    openShareUrl(
      `https://line.me/R/share?text=${encodeURIComponent(title + "\n" + fullUrl)}`,
    );
    track("line");
  }, [title, getFullUrl, track]);

  const handleShareHatena = useCallback((): void => {
    const fullUrl = getFullUrl();
    openShareUrl(
      `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(fullUrl)}&btitle=${encodeURIComponent(title)}`,
    );
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

  interface ShareAction {
    key: SnsType;
    label: string;
    ariaLabel: string;
    onClick: () => void | Promise<void>;
  }

  const actions: ShareAction[] = [
    {
      key: "x",
      label: "X でシェア",
      ariaLabel: "X で共有（外部サイト・新しいタブで開く）",
      onClick: handleShareX,
    },
    {
      key: "line",
      label: "LINE でシェア",
      ariaLabel: "LINE で共有（外部サイト・新しいタブで開く）",
      onClick: handleShareLine,
    },
    {
      key: "hatena",
      label: "はてブに追加",
      ariaLabel: "はてなブックマークに追加（外部サイト・新しいタブで開く）",
      onClick: handleShareHatena,
    },
    {
      key: "copy",
      label: "URLをコピー",
      ariaLabel: "URLをコピー",
      onClick: handleCopy,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttons}>
        {actions
          .filter((a) => sns.includes(a.key))
          .map(({ key, label, ariaLabel, onClick }) => (
            <Button key={key} onClick={onClick} aria-label={ariaLabel}>
              {label}
            </Button>
          ))}
      </div>
      {/* コピー完了フィードバック。aria-live="polite" でスクリーンリーダーに通知。 */}
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "コピーしました" : ""}
      </div>
    </div>
  );
}
