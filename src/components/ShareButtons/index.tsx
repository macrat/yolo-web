"use client";

import {
  useState,
  useCallback,
  useEffect,
  type MouseEvent,
  type ReactNode,
} from "react";
import Button from "@/components/Button";
import { trackShare, type ShareSurface } from "@/lib/analytics";
import { copyText } from "@/lib/clipboard";
import { SHARE_LABELS } from "@/lib/share-labels";
import { useCanWebShare, shareGameResult } from "@/lib/webShare";
import styles from "./ShareButtons.module.css";

/** サポートする SNS の種別 */
type SnsType = "x" | "line" | "hatena" | "copy";

/** GA4 share イベントの method 値 */
type ShareMethod = "twitter" | "line" | "web_share" | "clipboard" | "hatena";

interface ShareButtonsProps {
  /**
   * 共有するページの URL。パス（例: "/blog/my-post"）なら、いま開いているサイトの origin を前に付ける。
   * "http://" か "https://" で始まる URL は、そのまま使う。
   */
  url: string;
  /** 共有するページのタイトル。端末の共有シートとはてなブックマークに渡す */
  title: string;
  /**
   * 結果を共有するときの文（例: 「〇〇診断の結果は「△△」でした!」）。URL を含めない。URL は共有先ごとの形で、
   * この部品が付ける。渡すと、共有するものがページから結果に替わる。端末が共有シートを開けるなら、
   * 共有シートのボタン1つに任せる。共有シートがほかの共有先をすべて含むからである。コピーは、文と URL を写す
   * 「結果をコピー」になる。省くとページを共有し、文は title から組む。
   */
  text?: string;
  /** 表示するボタン一覧。並びはいつも X・LINE・はてブ・コピーの順。省略時は全ボタンを表示 */
  sns?: SnsType[];
  /** GA4 share イベント用のコンテンツタイプ（例: "tool", "blog"） */
  contentType?: string;
  /** GA4 share イベント用のコンテンツ識別子 */
  contentId?: string;
  /** GA4 share イベント用の、共有した場所（例: "text"）。省くと surface を送らない */
  surface?: ShareSurface;
  /** 共有のボタンと同じ並びの最後に置く、結果を持ち帰るほかの操作（画像の保存など） */
  children?: ReactNode;
}

const DEFAULT_SNS: SnsType[] = ["x", "line", "hatena", "copy"];

// noopener,noreferrer はタブナビング攻撃と Referer 漏洩の防止
function openShareUrl(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

function toFullUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${window.location.origin}${url}`;
}

/**
 * 共有のボタンの並び。どのボタンも、押すと共有先のページが開くか、共有シートが開くか、文と URL が
 * コピーされる、プライマリでないボタン（DESIGN.md §6）なので、共通の Button で組む。共有先はロゴや色
 * ではなく文言で言う。
 */
export default function ShareButtons({
  url,
  title,
  text,
  sns = DEFAULT_SNS,
  contentType,
  contentId,
  surface,
  children,
}: ShareButtonsProps) {
  const canWebShare = useCanWebShare();
  // 写せるたびに増える番号。0 のあいだは「コピーしました」を出さない。押し直すと番号が変わってタイマーを
  // 掛け直すので、先のタイマーが後の知らせを早く消さない。外したときもタイマーを止める。
  const [copiedCount, setCopiedCount] = useState(0);
  // 写せなかった知らせは、読み終える前に消えないよう、次にコピーを押すまで残す。
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    if (copiedCount === 0) return;
    const timer = setTimeout(() => setCopiedCount(0), 2000);
    return () => clearTimeout(timer);
  }, [copiedCount]);

  /** いま共有する URL と文。URL はクリック時にだけ組む（サーバーでは origin を持たない）。 */
  const getShareTarget = useCallback((): {
    fullUrl: string;
    body: string;
  } => {
    return { fullUrl: toFullUrl(url), body: text ?? title };
  }, [url, text, title]);

  const track = useCallback(
    (method: ShareMethod): void => {
      // contentType / contentId の両方が指定された時のみ GA 送信。
      // 呼び出し元から識別子を持たないシェアは「不明」として記録しない設計
      if (contentType && contentId) {
        trackShare(method, contentType, contentId, surface);
      }
    },
    [contentType, contentId, surface],
  );

  const handleWebShare = useCallback(async (): Promise<void> => {
    const { fullUrl, body } = getShareTarget();
    // 共有シートで共有を終えたときだけ数える。閉じただけの回を数えると web_share が水増しされる。
    const shared = await shareGameResult({ title, text: body, url: fullUrl });
    if (shared) track("web_share");
  }, [title, getShareTarget, track]);

  const handleShareX = useCallback((): void => {
    const { fullUrl, body } = getShareTarget();
    openShareUrl(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(body)}&url=${encodeURIComponent(fullUrl)}`,
    );
    track("twitter");
  }, [getShareTarget, track]);

  const handleShareLine = useCallback((): void => {
    const { fullUrl, body } = getShareTarget();
    openShareUrl(
      `https://line.me/R/share?text=${encodeURIComponent(body + "\n" + fullUrl)}`,
    );
    track("line");
  }, [getShareTarget, track]);

  const handleShareHatena = useCallback((): void => {
    const { fullUrl } = getShareTarget();
    openShareUrl(
      `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(fullUrl)}&btitle=${encodeURIComponent(title)}`,
    );
    track("hatena");
  }, [title, getShareTarget, track]);

  const handleCopy = useCallback(
    async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
      const { fullUrl, body } = getShareTarget();
      setCopyFailed(false);
      // 写すための欄は、押したボタンの並びに置く。結果のダイアログの中でも、その欄を選べる。
      if (
        await copyText(body + "\n" + fullUrl, event.currentTarget.parentElement)
      ) {
        setCopiedCount((count) => count + 1);
        track("clipboard");
      } else {
        setCopiedCount(0);
        setCopyFailed(true);
      }
    },
    [getShareTarget, track],
  );

  interface ShareAction {
    key: SnsType;
    label: string;
    ariaLabel?: string;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  }

  const actions: ShareAction[] = [
    {
      key: "x",
      label: SHARE_LABELS.x.text,
      ariaLabel: SHARE_LABELS.x.ariaLabel,
      onClick: handleShareX,
    },
    {
      key: "line",
      label: SHARE_LABELS.line.text,
      ariaLabel: SHARE_LABELS.line.ariaLabel,
      onClick: handleShareLine,
    },
    {
      key: "hatena",
      label: SHARE_LABELS.hatena.text,
      ariaLabel: SHARE_LABELS.hatena.ariaLabel,
      onClick: handleShareHatena,
    },
    {
      key: "copy",
      label: text === undefined ? "URLをコピー" : "結果をコピー",
      onClick: handleCopy,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttons}>
        {text !== undefined && canWebShare ? (
          <Button onClick={handleWebShare}>この結果をシェア</Button>
        ) : (
          actions
            .filter((a) => sns.includes(a.key))
            .map(({ key, label, ariaLabel, onClick }) => (
              <Button key={key} onClick={onClick} aria-label={ariaLabel}>
                {label}
              </Button>
            ))
        )}
        {children}
      </div>
      {/* コピーの知らせ。aria-live="polite" で読み上げにも伝える。 */}
      <div className={styles.copyMessage} role="status" aria-live="polite">
        {copyFailed ? (
          <>
            <span className={styles.sentence}>コピーできませんでした。</span>
            <span className={styles.sentence}>
              ほかの共有先をお使いください
            </span>
          </>
        ) : copiedCount > 0 ? (
          "コピーしました"
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
