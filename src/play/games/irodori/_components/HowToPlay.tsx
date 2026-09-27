import Accordion from "@/components/Accordion";
import styles from "./HowToPlay.module.css";

/**
 * くわしい遊び方。遊び始めるのに要ること（何を作るか）はページの頭の要約が言うので、ここは点数の決まりや
 * 伝統色のことなど、遊びながら知りたくなることを、閉じたアコーディオンに置く。
 */
export default function HowToPlay() {
  return (
    <Accordion summary="くわしい遊び方" className={styles.howToPlay}>
      <div className={styles.content}>
        <p>
          毎日、お題の色が5つ出ます。1問ずつ、お題の色を見て、色相・彩度・明度の3つのスライダーで、できるだけ近い色を作ってください。
        </p>
        <p>
          「決定」を押すと、その問の答えが決まります。お題との色差が小さいほど点が高く、1問100点までです。
        </p>
        <p>
          5問を終えると、5問の点数の平均が今日の合計点（0〜100点）になり、合計点からランク（S・A・B・C・D）が決まります。
        </p>
        <p>
          日本の伝統色がお題になることもあります。色の名前は、答えを決めたあとに出ます。
        </p>
        <p className={styles.note}>
          画面の設定によって、色の見え方が変わることがあります。
        </p>
      </div>
    </Accordion>
  );
}
