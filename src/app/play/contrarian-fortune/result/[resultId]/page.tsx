import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import contrarianFortuneQuiz from "@/play/quiz/data/contrarian-fortune";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
};

const SLUG = "contrarian-fortune";
const quiz = contrarianFortuneQuiz;

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) return {};

  // contrarian-fortuneは常にdetailedContentありなので常にindex: true
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

export default async function ContrarianFortuneResultPage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした！あなたは? #${quiz.meta.title.replace(/\s/g, "")} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;
  const ctaText = "あなたはどのタイプ? 診断してみよう";

  // detailedContent は contrarian-fortune では必ず存在する
  const cf = result.detailedContent;
  if (!cf || cf.variant !== "contrarian-fortune") notFound();

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
    >
      <>
        {/* (a) キャッチコピー: h1直下のサブタイトル — detailedSectionの外側に配置 */}
        <p className={styles.catchphrase}>{cf.catchphrase}</p>

        <div className={styles.detailedSection}>
          {/* (b) 核心の一文: accentColorの透過色背景でカード風に視覚的独立性を付与 */}
          <p
            className={styles.coreSentence}
            style={{ backgroundColor: `${quiz.meta.accentColor}18` }}
          >
            {cf.coreSentence}
          </p>

          {/* (c) あるある箇条書き */}
          <h2
            className={styles.detailedSectionHeading}
            style={{ color: quiz.meta.accentColor }}
          >
            このタイプの人、こんなことしてませんか？
          </h2>
          <ul className={styles.behaviorsList}>
            {cf.behaviors.map((behavior, i) => (
              <li key={i} className={styles.behaviorsItem}>
                {behavior}
              </li>
            ))}
          </ul>

          {/* (d) シェアボタン第一置き場（あるある直後） */}
          <div className={styles.midShareSection}>
            <ShareButtons
              shareText={shareText}
              shareUrl={shareUrl}
              quizTitle={quiz.meta.title}
              contentType="diagnosis"
              contentId={`quiz-${SLUG}`}
            />
          </div>

          {/* (e) タイプの人物像 */}
          <p className={styles.persona}>{cf.persona}</p>

          {/* (f) 第三者専用セクション */}
          <div className={styles.thirdPartySection}>
            <h2
              className={styles.thirdPartyHeading}
              style={{ color: quiz.meta.accentColor }}
            >
              このタイプの人と一緒にいると
            </h2>
            <p className={styles.thirdPartyNote}>{cf.thirdPartyNote}</p>
          </div>

          {/* (g) タイプ固有の笑い指標（存在する場合のみ） */}
          {cf.humorMetrics && cf.humorMetrics.length > 0 && (
            <table className={styles.humorMetricsTable}>
              <tbody>
                {cf.humorMetrics.map((metric, i) => (
                  <tr key={i}>
                    <th>{metric.label}</th>
                    <td>{metric.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* (h) 全タイプ一覧 + 診断CTA */}
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
            <p className={styles.allTypesCta}>あなたのタイプはどれ？</p>
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
      </>
    </ResultPageShell>
  );
}
