"use client";

import type { ReactNode } from "react";
import type { CompatibilityEntry } from "@/play/quiz/types";
import PhrasedText from "@/components/PhrasedText";
import ShareButtons from "@/components/ShareButtons";
import type { HeadingFontAttr } from "@/lib/zen-antique-charset";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import styles from "./CompatibilitySection.module.css";

interface TypeInfo {
  id: string;
  title: string;
}

/**
 * 置く面。どちらの面かで、2人のタイプの言い方が決まる。
 * - 解き終えた画面: 友達の共有のリンクから来て診断を解いた来訪者に見せる。来訪者が myType、友達が friendType。
 * - 結果のページ: 相性を共有したリンクを受け取った人が開く。開いた人がどちらのタイプかは分からないので、
 *   2人のタイプを立場を言わずに並べる。相性の名前はサーバーで文節に区切って渡す（§4）。
 */
type Placement =
  | { placement: "solvedScreen" }
  | {
      placement: "resultPage";
      /** 相性の名前の見出し。phrases はサーバーで splitIntoPhrases（@/lib/phrase-breaks）が作ったもの。 */
      labelHeading: HeadingFontAttr & { phrases: readonly string[] };
    };

type CompatibilitySectionProps = Placement & {
  myType: TypeInfo;
  friendType: TypeInfo;
  compatibility: CompatibilityEntry;
  /** 診断名（共有の文に使う） */
  quizTitle: string;
  /** 診断の slug（共有の URL に使う） */
  quizSlug: string;
};

/**
 * 2人のタイプの相性。読みもののセクションの最後に置き、相性の名前をセクションの中の小見出しにして、相性の説明と、
 * この相性を共有するボタンを続ける。
 */
export default function CompatibilitySection(props: CompatibilitySectionProps) {
  const { myType, friendType, compatibility, quizTitle, quizSlug } = props;
  const hashtag = quizTitle.replace(/\s/g, "");
  const shareText = `私は「${myType.title}」、友達は「${friendType.title}」。相性は「${compatibility.label}」でした! #${hashtag} #yolosnet`;

  let caption: string;
  let heading: ReactNode;
  if (props.placement === "resultPage") {
    const { phrases, ...fontAttr } = props.labelHeading;
    caption = `「${myType.title}」と「${friendType.title}」の相性`;
    heading = (
      <PhrasedText
        as="h3"
        phrases={phrases}
        className={styles.label}
        {...fontAttr}
      />
    );
  } else {
    caption = "友達との相性";
    heading = <h3 className={styles.label}>{compatibility.label}</h3>;
  }

  return (
    <div className={styles.section}>
      <p className={styles.caption}>{caption}</p>
      {heading}
      {props.placement === "solvedScreen" && (
        <p className={styles.text}>
          あなたは「{myType.title}」、友達は「{friendType.title}」。
        </p>
      )}
      <p className={styles.text}>{compatibility.description}</p>
      <div className={styles.share}>
        <ShareButtons
          url={`/play/${quizSlug}/result/${myType.id}?with=${friendType.id}`}
          title={quizTitle}
          text={shareText}
          sns={["x", "line", "copy"]}
          contentType="diagnosis"
          contentId={contentIdForQuiz(quizSlug)}
          surface="text"
        />
      </div>
    </div>
  );
}
