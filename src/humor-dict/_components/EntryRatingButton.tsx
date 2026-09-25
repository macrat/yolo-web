"use client";

import { useState, useEffect, useCallback } from "react";
import { isRated, markAsRated } from "@/humor-dict/_lib/rating-storage";
import { trackContentRating } from "@/lib/analytics";
import Button from "@/components/Button";
import styles from "./EntryRatingButton.module.css";

interface EntryRatingButtonProps {
  slug: string;
}

/** 押したあとに出す文。押したあとは押しても何も起きないので、ボタンを消して字で言う（§6）。 */
const RATED_MESSAGE = "「おもしろかった」を送りました";

/**
 * ユーモア辞典の見出し語に「おもしろかった」を送るボタン。押すとその場で評価を送る、プライマリでないボタン（§6）。
 *
 * - 送ったかどうかは localStorage（rating-storage）に残す。サーバーの描画と食い違わないよう、読み戻しは
 *   マウントのあとにクライアントだけで行う。
 * - 送ったあとは押しても何も起きないので、ボタンを残さず、送ったことを文で言う。切り替えのボタンとして
 *   読ませると、押せば戻るように聞こえるため。
 * - 文は常に置いてある role="status" の段落に入れ、押したときにスクリーンリーダーにも伝わるようにする（§8）。
 */
export default function EntryRatingButton({ slug }: EntryRatingButtonProps) {
  const [rated, setRated] = useState(false);

  // マウントのあとに localStorage と同期する。初めを false にするのは、サーバーの描画と食い違わないため。
  useEffect(() => {
    if (isRated(slug)) {
      setRated(true); // eslint-disable-line react-hooks/set-state-in-effect -- Restore rating state from localStorage on mount
    }
  }, [slug]);

  const handleClick = useCallback(() => {
    markAsRated(slug);
    trackContentRating();
    setRated(true);
  }, [slug]);

  return (
    <div className={styles.wrapper}>
      {!rated && <Button onClick={handleClick}>おもしろかった</Button>}
      <p role="status">{rated ? RATED_MESSAGE : ""}</p>
    </div>
  );
}
