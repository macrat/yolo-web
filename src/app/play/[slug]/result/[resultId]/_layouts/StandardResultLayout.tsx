/**
 * 標準形式の結果レイアウトコンポーネント（Server Component）。
 * B-258: 結果ページコンポーネントのアーキテクチャ改善で page.tsx から分離。
 *
 * contrarian-fortune / character-fortune 以外の標準 personality クイズで使用する。
 * - DescriptionExpander + CTA1 は常に表示
 * - traits/behaviors/advice + CTA2 は detailedContent が存在する場合のみ表示
 *
 * variant条件分岐はpage.tsxのdispatch側で行い、このコンポーネントは含まない。
 */

import Link from "next/link";
import DescriptionExpander from "../DescriptionExpander";
import styles from "./StandardResultLayout.module.css";
import pageStyles from "../page.module.css";
import type { StandardResultLayoutProps } from "./types";

export default function StandardResultLayout({
  slug,
  quizMeta,
  result,
  ctaText,
  detailedContent,
  isDescriptionLong,
  traitsHeading,
  behaviorsHeading,
  adviceHeading,
}: StandardResultLayoutProps) {
  return (
    <>
      {/* description */}
      <DescriptionExpander
        description={result.description}
        isLong={isDescriptionLong}
      />

      {/* CTA1 */}
      <div className={pageStyles.trySection}>
        <Link
          href={`/play/${slug}`}
          className={pageStyles.tryButton}
          style={{ backgroundColor: quizMeta.accentColor }}
        >
          {ctaText}
        </Link>
        <p className={pageStyles.tryCost}>
          全{quizMeta.questionCount}問 / 登録不要
        </p>
      </div>

      {/* detailedContent がある場合のみ追加セクションを表示（標準形式） */}
      {detailedContent && (
        <div className={pageStyles.detailedSection}>
          <h2
            className={pageStyles.detailedSectionHeading}
            style={{ color: quizMeta.accentColor }}
          >
            {traitsHeading}
          </h2>
          <ul className={styles.traitsList}>
            {detailedContent.traits.map((trait, i) => (
              <li key={i} className={styles.traitsItem}>
                {trait}
              </li>
            ))}
          </ul>

          <h2
            className={pageStyles.detailedSectionHeading}
            style={{ color: quizMeta.accentColor }}
          >
            {behaviorsHeading}
          </h2>
          <ul className={pageStyles.behaviorsList}>
            {detailedContent.behaviors.map((behavior, i) => (
              <li key={i} className={pageStyles.behaviorsItem}>
                {behavior}
              </li>
            ))}
          </ul>

          <h2
            className={pageStyles.detailedSectionHeading}
            style={{ color: quizMeta.accentColor }}
          >
            {adviceHeading}
          </h2>
          <div
            className={styles.adviceCard}
            style={{ backgroundColor: `${quizMeta.accentColor}18` }}
          >
            {detailedContent.advice}
          </div>

          {/* CTA2: detailedContent読了者向けのテキストリンク形式CTA */}
          <div className={styles.cta2Section}>
            <Link href={`/play/${slug}`} className={styles.cta2Link}>
              {ctaText}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
