"use client";

import { useId, useSyncExternalStore } from "react";
import {
  subscribeFortuneStore,
  getFortuneSnapshot,
  getFortuneServerSnapshot,
} from "@/play/fortune/fortuneStore";
import ResultBox, { type ResultHeading } from "@/components/ResultBox";
import ShareButtons from "@/components/ShareButtons";
import StarRating from "./StarRating";
import styles from "./DailyFortuneCard.module.css";

interface DailyFortuneCardProps {
  /**
   * 運勢の id ごとの、運勢の名の見出し。どの運勢が出るかは来訪者の端末で決まるので、サーバーの page.tsx が
   * すべての運勢の名の区切りを作って渡す。
   */
  headings: Readonly<Record<string, ResultHeading>>;
}

/** "YYYY-MM-DD" を、結果が何の日のものかを言う補助情報の行にする。 */
function formatCaption(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日のユーモア運勢`;
}

/**
 * 今日の運勢。端末に残した来訪者ごとの種と日本時間の日付から、その日の運勢を1つ選んで結果のボックスに出す。
 *
 * 運勢は端末の localStorage で決まるので、サーバーでは描かず、読み込んだあとに描く。サーバーの描画と
 * 最初の描画をそろえるため、ストアのサーバーの値は null で、そのあいだは占っていることを字で言う。
 * 結果はページを開いただけで出るもので、来訪者の操作への応えではないので、登場の動きを持たない（§11）。
 */
export default function DailyFortuneCard({ headings }: DailyFortuneCardProps) {
  const state = useSyncExternalStore(
    subscribeFortuneStore,
    getFortuneSnapshot,
    getFortuneServerSnapshot,
  );
  const shareHeadingId = useId();

  if (!state) {
    return <p className={styles.loading}>運勢を占っています...</p>;
  }

  const { fortune, today } = state;

  const shareText = `今日のユーモア運勢は「${fortune.title}」(${fortune.rating}/5) でした! #ユーモア運勢 #yolosnet`;

  return (
    <>
      <ResultBox caption={formatCaption(today)} heading={headings[fortune.id]}>
        <p className={styles.rating}>
          <StarRating rating={fortune.rating} />
        </p>
        <p className={styles.description}>{fortune.description}</p>
        <dl className={styles.details}>
          <div className={styles.detail}>
            <dt className={styles.detailLabel}>ラッキーアイテム</dt>
            <dd>{fortune.luckyItem}</dd>
          </div>
          <div className={styles.detail}>
            <dt className={styles.detailLabel}>今日のアクション</dt>
            <dd>{fortune.luckyAction}</dd>
          </div>
        </dl>
      </ResultBox>

      <section className={styles.share} aria-labelledby={shareHeadingId}>
        <h3 id={shareHeadingId} className={styles.shareHeading}>
          この結果を共有
        </h3>
        <ShareButtons
          url="/play/daily"
          title="今日のユーモア運勢"
          text={shareText}
          sns={["x", "line", "copy"]}
          contentType="fortune"
          contentId="fortune-daily"
        />
      </section>

      <p className={styles.comeback}>明日も来てね! 毎日運勢が変わります</p>
    </>
  );
}
