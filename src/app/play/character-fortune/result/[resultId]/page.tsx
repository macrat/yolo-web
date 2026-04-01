/**
 * /play/character-fortune/result/[resultId] 専用ルート。
 * ステップ4: Next.jsのファイルシステムルーティングにより、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * character-fortune variant のみを対象とするため、
 * variant dispatch ロジックが不要でシンプルな実装になる。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import characterFortuneQuiz from "@/play/quiz/data/character-fortune";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
};

const SLUG = "character-fortune";
const quiz = characterFortuneQuiz;

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) return {};

  // character-fortuneは常にdetailedContentありなので常にindex: true
  // searchParams処理不要（相性機能なし）
  const FULL_WIDTH_LIMIT = 60;
  const candidateTitle = `${result.title} | ${quiz.meta.title}の結果`;
  const title =
    countCharWidth(`${candidateTitle} | ${SITE_NAME}`) > FULL_WIDTH_LIMIT
      ? result.title
      : candidateTitle;
  const description = result.description;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${BASE_URL}/play/${SLUG}/result/${resultId}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/play/${SLUG}/result/${resultId}`,
    },
  };
}

export default async function CharacterFortuneResultPage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした！あなたは? #${quiz.meta.title.replace(/\s/g, "")} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;
  const ctaText = "あなたはどのタイプ? 診断してみよう";

  // detailedContent は character-fortune では必ず存在する
  const cf = result.detailedContent;
  if (!cf || cf.variant !== "character-fortune") notFound();

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
    >
      {/* character-fortune固有のJSX */}
      <div className={styles.detailedSection}>
        {/* (a) キャラクターの自己紹介 */}
        <p
          className={styles.characterIntro}
          style={{ backgroundColor: `${quiz.meta.accentColor}18` }}
        >
          {cf.characterIntro}
        </p>

        {/* CTA1 */}
        <div className={styles.trySection}>
          <Link
            href={`/play/${SLUG}`}
            className={styles.tryButton}
            style={{ backgroundColor: quiz.meta.accentColor }}
          >
            {ctaText}
          </Link>
          <p className={styles.tryCost}>
            全{quiz.meta.questionCount}問 / 登録不要
          </p>
        </div>

        {/* (b) キャラが語る「あるある」 */}
        <h2
          className={styles.detailedSectionHeading}
          style={{ color: quiz.meta.accentColor }}
        >
          {cf.behaviorsHeading}
        </h2>
        <ul className={styles.behaviorsList}>
          {cf.behaviors.map((behavior, i) => (
            <li key={i} className={styles.behaviorsItem}>
              {behavior}
            </li>
          ))}
        </ul>

        {/* シェアボタン中間配置 */}
        <div className={styles.midShareSection}>
          <ShareButtons
            shareText={shareText}
            shareUrl={shareUrl}
            quizTitle={quiz.meta.title}
            contentType="diagnosis"
            contentId={`quiz-${SLUG}`}
          />
        </div>

        {/* (c) キャラの本音 */}
        <h2
          className={styles.detailedSectionHeading}
          style={{ color: quiz.meta.accentColor }}
        >
          {cf.characterMessageHeading}
        </h2>
        <p className={styles.characterMessage}>{cf.characterMessage}</p>

        {/* (d) 第三者視点のシーン描写 */}
        <div className={styles.thirdPartySection}>
          <h2
            className={styles.thirdPartyHeading}
            style={{ color: quiz.meta.accentColor }}
          >
            このキャラの守護を受けている人と一緒にいると
          </h2>
          <p className={styles.thirdPartyNote}>{cf.thirdPartyNote}</p>
        </div>

        {/* (e) 相性診断への誘導 */}
        <div className={styles.compatibilitySection}>
          <p className={styles.compatibilityPrompt}>{cf.compatibilityPrompt}</p>
          <Link
            href={`/play/${SLUG}`}
            className={styles.tryButton}
            style={{ backgroundColor: quiz.meta.accentColor }}
          >
            診断して相性を見てみる
          </Link>
        </div>

        {/* (f) 全タイプ一覧 + CTA */}
        <div className={styles.allTypesSection}>
          <ul className={styles.allTypesList}>
            {quiz.results.map((r) => (
              <li
                key={r.id}
                className={
                  r.id === resultId
                    ? styles.allTypesItemCurrent
                    : styles.allTypesItem
                }
              >
                <Link href={`/play/${SLUG}/result/${r.id}`}>
                  {r.icon && <span>{r.icon}</span>}
                  <span>{r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.allTypesCta}>他のキャラも見てみよう</p>
          <div className={styles.trySection}>
            <Link
              href={`/play/${SLUG}`}
              className={styles.tryButton}
              style={{ backgroundColor: quiz.meta.accentColor }}
            >
              {ctaText}
            </Link>
            <p className={styles.tryCost}>
              全{quiz.meta.questionCount}問 / 登録不要
            </p>
          </div>
        </div>
      </div>
    </ResultPageShell>
  );
}
