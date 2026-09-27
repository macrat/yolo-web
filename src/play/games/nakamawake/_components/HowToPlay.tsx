import Accordion from "@/components/Accordion";
import styles from "./HowToPlay.module.css";

/**
 * くわしい遊び方。遊び始めるのに要ること（何をするか・盤の数の意味）はページの頭の要約と凡例が言うので、
 * ここは閉じたアコーディオンに入れ、読みたい来訪者が開く（DESIGN.md §6）。
 */
export default function HowToPlay() {
  return (
    <Accordion summary="くわしい遊び方">
      <div className={styles.body}>
        <p>16の言葉のなかに、共通点でつながる4つずつの組が4つ隠れています。</p>
        <p>
          同じ組だと思う4つの言葉を選んで「チェック」を押します。当たると、その組が名前と難易度と一緒に、残りの言葉の上に並びます。4つのうち3つが同じ組のときは、そう知らせます。
        </p>
        <p>
          組の難易度は、難易度1（易しい）から難易度4（とても難しい）までの4つです。
        </p>
        <p>
          4回間違えると、そこで終わりです。問題は毎日0:00（日本時間）に新しくなります。
        </p>
      </div>
    </Accordion>
  );
}
