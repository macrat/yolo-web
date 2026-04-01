/**
 * character-fortune variant 専用の結果レイアウトコンポーネント。
 * B-258: 結果ページコンポーネントのアーキテクチャ改善で page.tsx から分離。
 *
 * キャラクターが固有の口調で語りかけるスタイルの結果ページを構成する。
 * Server Component として動作する（"use client" ディレクティブなし）。
 */

import Link from "next/link";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import styles from "./CharacterFortuneLayout.module.css";
import pageStyles from "../page.module.css";
import type { CharacterFortuneLayoutProps } from "./types";

export default function CharacterFortuneLayout({
  slug,
  resultId,
  quizMeta,
  shareText,
  shareUrl,
  ctaText,
  detailedContent,
  allResults,
}: CharacterFortuneLayoutProps) {
  const cf = detailedContent;

  return (
    <div className={pageStyles.detailedSection}>
      {/* (a) キャラクターの自己紹介 */}
      <p
        className={styles.characterIntro}
        style={{ backgroundColor: `${quizMeta.accentColor}18` }}
      >
        {cf.characterIntro}
      </p>

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

      {/* (b) キャラが語る「あるある」 */}
      <h2
        className={pageStyles.detailedSectionHeading}
        style={{ color: quizMeta.accentColor }}
      >
        {cf.behaviorsHeading}
      </h2>
      <ul className={pageStyles.behaviorsList}>
        {cf.behaviors.map((behavior, i) => (
          <li key={i} className={pageStyles.behaviorsItem}>
            {behavior}
          </li>
        ))}
      </ul>

      {/* シェアボタン中間配置 */}
      <div className={styles.midShareSection}>
        <ShareButtons
          shareText={shareText}
          shareUrl={shareUrl}
          quizTitle={quizMeta.title}
          contentType="diagnosis"
          contentId={`quiz-${slug}`}
        />
      </div>

      {/* (c) キャラの本音 */}
      <h2
        className={pageStyles.detailedSectionHeading}
        style={{ color: quizMeta.accentColor }}
      >
        {cf.characterMessageHeading}
      </h2>
      <p className={styles.characterMessage}>{cf.characterMessage}</p>

      {/* (d) 第三者視点のシーン描写 */}
      <div className={styles.thirdPartySection}>
        <h2
          className={styles.thirdPartyHeading}
          style={{ color: quizMeta.accentColor }}
        >
          このキャラの守護を受けている人と一緒にいると
        </h2>
        <p className={styles.thirdPartyNote}>{cf.thirdPartyNote}</p>
      </div>

      {/* (e) 相性診断への誘導 */}
      <div className={styles.compatibilitySection}>
        <p className={styles.compatibilityPrompt}>{cf.compatibilityPrompt}</p>
        <Link
          href={`/play/${slug}`}
          className={pageStyles.tryButton}
          style={{ backgroundColor: quizMeta.accentColor }}
        >
          診断して相性を見てみる
        </Link>
      </div>

      {/* (f) 全タイプ一覧 + CTA */}
      <div className={styles.allTypesSection}>
        <ul className={styles.allTypesList}>
          {allResults.map((r) => (
            <li
              key={r.id}
              className={
                r.id === resultId
                  ? styles.allTypesItemCurrent
                  : styles.allTypesItem
              }
            >
              <Link href={`/play/${slug}/result/${r.id}`}>
                {r.icon && <span>{r.icon}</span>}
                <span>{r.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.allTypesCta}>他のキャラも見てみよう</p>
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
      </div>
    </div>
  );
}
