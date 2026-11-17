import Accordion from "@/components/Accordion";
import { FEEDBACK_MARKS } from "@/play/games/yoji-kimeru/_lib/feedbackMarks";
import type { CharFeedback } from "@/play/games/yoji-kimeru/_lib/types";
import styles from "./styles/YojiKimeru.module.css";

/** 印ごとに、その字が答えのどこにあるかを言う文。 */
const MARK_EXPLANATIONS: Record<CharFeedback, string> = {
  correct: "答えの同じ位置にある字",
  present: "答えの別の位置にある字",
  absent: "答えに無い字",
};

const MARK_ORDER: CharFeedback[] = ["correct", "present", "absent"];

/**
 * くわしい遊び方。遊び始めるのに要る要約と凡例はページの頭にいつも出ているので、ここは閉じておき、
 * 読みたい来訪者が入力欄のすぐ下で開く。
 */
export default function HowToPlay() {
  return (
    <Accordion
      summary={["くわしい", "遊び方"]}
      className={styles.howToPlayAccordion}
    >
      <div className={styles.howToPlay}>
        <p>
          毎日1つの四字熟語を当てるゲームです。漢字4字を入力して送ると、盤に推測した字が並び、字の下の印が、その字が答えのどこにあるかを示します。6回までに当てましょう。
        </p>
        <ul className={styles.markList}>
          {MARK_ORDER.map((feedback) => (
            <li key={feedback}>
              <span className={styles.legendMark} aria-hidden="true">
                {FEEDBACK_MARKS[feedback].mark}
              </span>
              {FEEDBACK_MARKS[feedback].meaning}（{MARK_EXPLANATIONS[feedback]}
              ）
            </li>
          ))}
        </ul>
        <h3 className={styles.howToPlayHeading}>難易度</h3>
        <ul>
          <li>初級: 日常でよく使われる四字熟語</li>
          <li>中級: ニュースや書籍で見かける四字熟語</li>
          <li>上級: 専門的・文語的な四字熟語を含む全問題</li>
        </ul>
        <p>
          初級は問題数が限られるため、同じ問題が再出題されることがあります。難易度ごとに1日1問を遊べます。
        </p>
        <h3 className={styles.howToPlayHeading}>ヒント</h3>
        <ul>
          <li>難易度と読みの文字数は、初めから出ています</li>
          <li>3回目の推測のあとに、読みの最初の字が出ます</li>
          <li>4回目の推測のあとに、出典（中国の古典か日本か）が出ます</li>
          <li>5回目の推測のあとに、分類が出ます</li>
        </ul>
      </div>
    </Accordion>
  );
}
