"use client";

import { useId, useSyncExternalStore } from "react";
import {
  subscribeFortuneStore,
  getFortuneSnapshot,
  getFortuneServerSnapshot,
} from "@/play/fortune/fortuneStore";
import { formatRating, MAX_RATING } from "@/play/fortune/rating";
import type { DailyFortuneEntry } from "@/play/fortune/types";
import PhrasedText from "@/components/PhrasedText";
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
  /** 占っているあいだ、運勢の名の代わりに見出しに出す「占っています……」。 */
  pendingHeading: ResultHeading;
}

type FortuneBody = Pick<
  DailyFortuneEntry,
  "rating" | "description" | "luckyItem" | "luckyAction"
>;

/**
 * 占っているあいだ、結果のボックスの中身と共有の区画が占める場所を取るための、見えない中身。運勢の中ほどの
 * 長さの文にしてあり、運勢が出たときに下の内容がほとんど動かない。字の数で場所を取るので、幅や字の
 * 大きさが変わっても運勢と同じように折り返す。
 */
const PLACEHOLDER_BODY: FortuneBody = {
  rating: MAX_RATING,
  description:
    "運勢を占っています。運勢を占っています。運勢を占っています。運勢を占っています。運勢を占っています。運勢を占っています。",
  luckyItem: "運勢を占っています",
  luckyAction: "運勢を占っています。運勢を占っています",
};

/** JavaScript が動かない来訪者に、運勢が出ない理由と見る方法を言う。 */
const NOSCRIPT_MESSAGE =
  "今日の運勢はブラウザの JavaScript で占います。JavaScript を有効にすると表示されます。";

/** "YYYY-MM-DD" を、結果が何の日のものかを言う補助情報の行にする。 */
function formatCaption(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日のユーモア運勢`;
}

function FortuneDetails({ fortune }: { fortune: FortuneBody }) {
  return (
    <>
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
    </>
  );
}

function ShareSection({ shareText }: { shareText: string }) {
  const headingId = useId();
  return (
    <>
      <section className={styles.share} aria-labelledby={headingId}>
        <PhrasedText
          as="h3"
          id={headingId}
          className={styles.shareHeading}
          phrases={["この", "結果を", "共有"]}
        />
        <ShareButtons
          url="/play/daily"
          title="今日のユーモア運勢"
          text={shareText}
          sns={["x", "line", "copy"]}
          contentType="fortune"
          contentId="fortune-daily"
        />
      </section>
      <p className={styles.comeback}>明日も来てね！　毎日運勢が変わります</p>
    </>
  );
}

/**
 * 今日の運勢。端末に残した来訪者ごとの種と日本時間の日付から、その日の運勢を1つ選んで結果のボックスに出す。
 *
 * 運勢は端末の localStorage で決まるので、サーバーでは描かず、読み込んだあとに描く。サーバーの描画と
 * 最初の描画をそろえるため、ストアのサーバーの値は null で、そのあいだは占っていることを見出しで言い、
 * 運勢が出たときと同じ形のボックスと共有の区画で場所を取っておく。場所を取らないと、運勢が出たときに
 * 下の内容が押し下げられる。
 * 結果はページを開いただけで出るもので、来訪者の操作への応えではないので、登場の動きを持たない（§11）。
 */
export default function DailyFortuneCard({
  headings,
  pendingHeading,
}: DailyFortuneCardProps) {
  const state = useSyncExternalStore(
    subscribeFortuneStore,
    getFortuneSnapshot,
    getFortuneServerSnapshot,
  );

  if (!state) {
    return (
      <>
        <ResultBox caption="今日のユーモア運勢" heading={pendingHeading}>
          <noscript>
            <p className={styles.noscript}>{NOSCRIPT_MESSAGE}</p>
          </noscript>
          <div className={styles.pending} aria-hidden="true">
            <FortuneDetails fortune={PLACEHOLDER_BODY} />
          </div>
        </ResultBox>
        <div className={styles.pending} aria-hidden="true" inert>
          <ShareSection shareText="" />
        </div>
      </>
    );
  }

  const { fortune, today } = state;
  const shareText = `今日のユーモア運勢は「${fortune.title}」(${formatRating(fortune.rating)}/${MAX_RATING}) でした！　#ユーモア運勢 #yolosnet`;

  return (
    <>
      <ResultBox caption={formatCaption(today)} heading={headings[fortune.id]}>
        <FortuneDetails fortune={fortune} />
      </ResultBox>
      <ShareSection shareText={shareText} />
    </>
  );
}
