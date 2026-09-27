import Accordion from "@/components/Accordion";
import { FEEDBACK_MARKS } from "@/play/games/kanji-kanaru/_lib/marks";
import styles from "./styles/KanjiKanaru.module.css";

/** 文の中で盤の印を言う。盤と同じ字と書体で組み、読み上げは印の字を読ませず意味の語だけにする。 */
function Mark({ level }: { level: keyof typeof FEEDBACK_MARKS }) {
  const { mark, meaning } = FEEDBACK_MARKS[level];
  return (
    <>
      <span className={styles.inlineMark} aria-hidden="true">
        {mark}
      </span>{" "}
      {meaning}
    </>
  );
}

/**
 * くわしい遊び方。盤の上の要約と凡例で遊び始められるので、閉じたアコーディオンに入れ、入力欄の下に置く
 * （来訪者が開いたときだけ開く）。
 */
export default function HowToPlay() {
  return (
    <Accordion summary="くわしい遊び方">
      <div className={styles.howToPlay}>
        <p>
          毎日1つの漢字を当てるゲームです。6回までに答えの漢字を見つけましょう。
        </p>
        <p>
          漢字を1字入れると、6つの項目のそれぞれで、答えの漢字とどれだけ合っているかが盤に印で出ます（
          <Mark level="correct" />、<Mark level="close" />、
          <Mark level="wrong" />
          ）。
        </p>
        <ul>
          <li>部首: 同じ部首なら一致。</li>
          <li>画数: 同じなら一致、差が2画までなら近い。</li>
          <li>
            学年: 同じなら一致、差が1学年なら近い。答えの学年が上なら ↑、下なら
            ↓ を添えます。
          </li>
          <li>音（音読み）: 同じ音読みを1つでも持てば一致。</li>
          <li>
            意味:
            推測した漢字と答えの漢字の意味がとても近ければ一致、やや近ければ近い。
          </li>
          <li>訓（訓読みの数）: 同じ数なら一致、差が1つなら近い。</li>
        </ul>
        <p>難易度で、答えになる漢字の範囲が変わります。</p>
        <ul>
          <li>初級: 小学1〜2年の漢字（約240字）</li>
          <li>中級: 小学1〜6年の漢字（約1,026字）</li>
          <li>上級: すべての常用漢字（約2,136字）</li>
        </ul>
        <p className={styles.license}>
          このゲームはKANJIDIC2およびJMdictの辞書ファイルを使用しています。これらのファイルはElectronic
          Dictionary Research and Development
          Groupの所有物であり、同グループのライセンスに準拠して使用しています。
        </p>
      </div>
    </Accordion>
  );
}
