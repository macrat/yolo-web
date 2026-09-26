"use client";

import type { CompatibilityEntry } from "@/play/quiz/types";
import ShareButtons from "@/components/ShareButtons";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import styles from "./CompatibilitySection.module.css";

interface TypeInfo {
  id: string;
  title: string;
  icon?: string;
}

interface CompatibilitySectionProps {
  /** The current user's type */
  myType: TypeInfo;
  /** The referrer's (friend's) type */
  friendType: TypeInfo;
  /** Compatibility data for this pair */
  compatibility: CompatibilityEntry;
  /** Quiz title for share text */
  quizTitle: string;
  /** Quiz slug for share URL */
  quizSlug: string;
}

/**
 * Displays the compatibility result between two personality types.
 * Shown after quiz completion when a referrer type is present.
 */
export default function CompatibilitySection({
  myType,
  friendType,
  compatibility,
  quizTitle,
  quizSlug,
}: CompatibilitySectionProps) {
  const hashtag = quizTitle.replace(/\s/g, "");
  const shareText = `私は「${myType.title}」、友達は「${friendType.title}」。相性は「${compatibility.label}」でした! #${hashtag} #yolosnet`;

  return (
    <div className={styles.section}>
      <p className={styles.heading}>友達との相性結果</p>
      {/* 絵文字（icon）は置かない（DESIGN.md §5）。各タイプはタイトルの文言だけで見分ける。 */}
      <div className={styles.typeIcons}>
        <div className={styles.typeBox}>
          <span className={styles.typeName}>{myType.title}</span>
        </div>
        <span className={styles.separator}>&times;</span>
        <div className={styles.typeBox}>
          <span className={styles.typeName}>{friendType.title}</span>
        </div>
      </div>
      <h3 className={styles.label}>{compatibility.label}</h3>
      <p className={styles.description}>{compatibility.description}</p>
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
  );
}
