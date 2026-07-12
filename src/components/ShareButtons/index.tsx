"use client";

import { useState, useCallback } from "react";
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
 * ShareButtons — 共有ボタン群（DESIGN.md §4「札」/§6/§8 準拠の店構え版）。
 *
 * §8 厳守で、以前のブランド色ベタ塗りボタン・ブランドロゴ SVG・絵文字を撤去した。
 * 共有先は「文字＋罫の線画ボタン」で示す——地は紙、`--rule` の一本罫で囲み、文字は墨、
 * hover で朱枠＋朱文字、focus 可視、44px。共有機能（X intent / LINE / クリップボード）は維持。
 * サービスは色やロゴではなく文言（「X でシェア」等）で識別する（§6「ボタンに絵文字を使わない」・
 * §2「アクセントは朱の1色」）。
 *
 * §7 の含意: 辞典等の実務面では共有は主役でない（静かに置く）。器は静かに保ち、
 * 主役はページの成果物側に譲る。
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
            <button
              key={key}
              type="button"
              className={styles.button}
              onClick={onClick}
              aria-label={ariaLabel}
            >
              {label}
            </button>
          ))}
      </div>
      {/* コピー完了フィードバック。aria-live="polite" でスクリーンリーダーに通知。
          色ベタでなく控えめな朱文字で示す（§2/§6）。 */}
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "コピーしました" : ""}
      </div>
    </div>
  );
}
