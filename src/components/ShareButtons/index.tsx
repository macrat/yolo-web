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

const ICON_SIZE = 20;

function XIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function HatenaIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.964 1.05A2.045 2.045 0 0 1 24 3.084v17.832a2.05 2.05 0 0 1-2.036 2.036H2.036A2.045 2.045 0 0 1 0 20.916V3.084A2.04 2.04 0 0 1 2.036 1.05Zm-10.46 13.732c-.815 0-1.473.654-1.473 1.474 0 .814.654 1.472 1.473 1.472.815 0 1.474-.654 1.474-1.473 0-.815-.66-1.473-1.474-1.473zm.345-8.998H8.595v11.244h2.99q2.354 0 3.297-.4a3.5 3.5 0 0 0 1.5-1.32q.557-.92.557-2.142a3.45 3.45 0 0 0-.616-2.054 2.83 2.83 0 0 0-1.706-1.107 2.5 2.5 0 0 0 1.402-.99 2.85 2.85 0 0 0 .473-1.62q.001-.749-.296-1.345a2.45 2.45 0 0 0-.86-.95 3.4 3.4 0 0 0-1.27-.473q-.704-.118-2.226-.107h-.011zm.115 6.69q.911 0 1.27.21.65.39.65 1.45 0 .607-.236 1a1.41 1.41 0 0 1-.674.557q-.435.166-1.444.165h-1.013v-3.38zm-.236-4.42q.866 0 1.197.165.604.296.604 1.226 0 .865-.557 1.18-.557.319-1.402.32h-.95V8.054z" />
    </svg>
  );
}

/** Lucide スタイル線画のリンクアイコン（DESIGN.md §3 準拠、stroke-width 1.5px） */
function LinkIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// noopener,noreferrer はタブナビング攻撃と Referer 漏洩の防止
function openShareUrl(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * ShareButtons — SNS 共有ボタン群コンポーネント。
 *
 * サービス識別という機能目的のため、各サービスのブランドカラーとブランドアイコンを使用する
 * （DESIGN.md §2.4「色は機能を伝えるためだけに使う」の範囲内）。
 * URL コピーボタンはサービスではないため、Lucide スタイル線画アイコン + ニュートラル色を使う。
 *
 * 既知のコントラスト課題: LINE (#06c755) と はてブ (#00a4de) は白文字とのコントラスト比が
 * WCAG AA 4.5:1 を満たさない（それぞれ 2.84:1 / 3.18:1）。サービスのブランド整合性を優先する選択。
 * 視覚識別はアイコン形状でも区別できるため、色のみに依存しない情報伝達は確保している。
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
    className: string;
    Icon: () => React.JSX.Element;
    label: string;
    ariaLabel: string;
    onClick: () => void | Promise<void>;
  }

  const actions: ShareAction[] = [
    {
      key: "x",
      className: styles.x,
      Icon: XIcon,
      label: "X でシェア",
      ariaLabel: "X で共有（外部サイト・新しいタブで開く）",
      onClick: handleShareX,
    },
    {
      key: "line",
      className: styles.line,
      Icon: LineIcon,
      label: "LINE でシェア",
      ariaLabel: "LINE で共有（外部サイト・新しいタブで開く）",
      onClick: handleShareLine,
    },
    {
      key: "hatena",
      className: styles.hatena,
      Icon: HatenaIcon,
      label: "はてブ",
      ariaLabel: "はてなブックマークに追加（外部サイト・新しいタブで開く）",
      onClick: handleShareHatena,
    },
    {
      key: "copy",
      className: styles.copy,
      Icon: LinkIcon,
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
          .map(({ key, className, Icon, label, ariaLabel, onClick }) => (
            <button
              key={key}
              type="button"
              className={`${styles.button} ${className}`}
              onClick={onClick}
              aria-label={ariaLabel}
            >
              <Icon />
              {label}
            </button>
          ))}
      </div>
      {/* コピー完了フィードバック。aria-live="polite" でスクリーンリーダーに通知 */}
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "コピーしました" : ""}
      </div>
    </div>
  );
}
