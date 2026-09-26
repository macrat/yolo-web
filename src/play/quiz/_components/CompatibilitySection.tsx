"use client";

import type { CompatibilityEntry } from "@/play/quiz/types";
import ShareButtons from "@/components/ShareButtons";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import { type ResultPlacement, SECTION_HEADING } from "./OtherTypesNav";
import styles from "./CompatibilitySection.module.css";

interface TypeInfo {
  id: string;
  title: string;
  icon?: string;
}

interface CompatibilitySectionProps {
  /** 来訪者のタイプ */
  myType: TypeInfo;
  /** 共有のリンクを送った友達のタイプ */
  friendType: TypeInfo;
  compatibility: CompatibilityEntry;
  /** 診断名（共有の文に使う） */
  quizTitle: string;
  /** 診断の slug（共有の URL に使う） */
  quizSlug: string;
  /** 置く面。相性の名前の見出しの段が決まる（既定: 解き終えた画面） */
  placement?: ResultPlacement;
}

/**
 * 来訪者と友達のタイプの相性。友達の結果の共有のリンクから来た来訪者に、タイプの読みもののあとで見せる。
 * 相性の名前を見出しにし、2人のタイプ・相性の説明・この相性を共有するボタンを続ける。
 */
export default function CompatibilitySection({
  myType,
  friendType,
  compatibility,
  quizTitle,
  quizSlug,
  placement = "solvedScreen",
}: CompatibilitySectionProps) {
  const Heading = SECTION_HEADING[placement];
  const hashtag = quizTitle.replace(/\s/g, "");
  const shareText = `私は「${myType.title}」、友達は「${friendType.title}」。相性は「${compatibility.label}」でした! #${hashtag} #yolosnet`;

  return (
    <div className={styles.section}>
      <p className={styles.caption}>友達との相性</p>
      <Heading className={styles.label}>{compatibility.label}</Heading>
      <p className={styles.text}>
        あなたは「{myType.title}」、友達は「{friendType.title}」。
      </p>
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
