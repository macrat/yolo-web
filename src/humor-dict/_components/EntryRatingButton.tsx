"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { isRated, markAsRated } from "@/humor-dict/_lib/rating-storage";
import { trackContentRating } from "@/lib/analytics";
import Button from "@/components/Button";
import styles from "./EntryRatingButton.module.css";

interface EntryRatingButtonProps {
  slug: string;
}

/**
 * 評価の段階。
 * - "unrated": まだ送っていない。ボタンを出す。
 * - "sent": いま押して送った。送ったことをスクリーンリーダーにも伝える。
 * - "restored": 前に送ったことを localStorage から読み戻した。文を出すだけで、読み上げの知らせにはしない。
 */
type RatingPhase = "unrated" | "sent" | "restored";

/** 送ったあとに出す文。送ったあとは押しても何も起きないので、ボタンを消して字で言う（§6）。 */
const RATED_MESSAGE = "「おもしろかった」を送りました";

/**
 * ユーモア辞典の見出し語に「おもしろかった」を送るボタン。押すとその場で評価を送る、プライマリでないボタン（§6）。
 *
 * - 送ったかどうかは localStorage（rating-storage）に残す。サーバーの描画と食い違わないよう、読み戻しは
 *   マウントのあとにクライアントだけで行う。
 * - 送ったあとは押しても何も起きないので、ボタンを残さず、送ったことを文で言う。切り替えのボタンとして
 *   読ませると、押せば戻るように聞こえるため。
 * - 押したときの文は、常に置いてある role="status" の段落に入れ、スクリーンリーダーにも伝える（§8）。
 *   ページを開くたびに読み上げないよう、読み戻した文はこの段落の外に出す。
 * - 押したボタンは消えるので、フォーカスをボタンと同じ位置にある文の段落へ移し、どこにいるかを見失わせない。
 */
export default function EntryRatingButton({ slug }: EntryRatingButtonProps) {
  const [phase, setPhase] = useState<RatingPhase>("unrated");
  const statusRef = useRef<HTMLParagraphElement>(null);

  // マウントのあとに localStorage と同期する。初めを "unrated" にするのは、サーバーの描画と食い違わないため。
  useEffect(() => {
    if (isRated(slug)) {
      setPhase("restored"); // eslint-disable-line react-hooks/set-state-in-effect -- Restore rating state from localStorage on mount
    }
  }, [slug]);

  useEffect(() => {
    if (phase === "sent") {
      statusRef.current?.focus();
    }
  }, [phase]);

  const handleClick = useCallback(() => {
    markAsRated(slug);
    trackContentRating();
    setPhase("sent");
  }, [slug]);

  return (
    <div className={styles.wrapper}>
      {phase === "unrated" && (
        <Button onClick={handleClick}>おもしろかった</Button>
      )}
      {phase === "restored" && (
        <p className={styles.message}>{RATED_MESSAGE}</p>
      )}
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className={phase === "sent" ? styles.message : undefined}
        /* フォーカスのリングを、消えたボタンと同じ字の左右に余白を持つ箱に出す（§5・§6）。 */
        data-text-box={phase === "sent" ? "inline" : undefined}
      >
        {phase === "sent" ? RATED_MESSAGE : ""}
      </p>
    </div>
  );
}
