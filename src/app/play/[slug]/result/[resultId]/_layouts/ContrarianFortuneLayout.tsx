/**
 * ContrarianFortuneLayout — contrarian-fortune variant専用Server Component。
 * B-258: 結果ページコンポーネントのアーキテクチャ改善で導入。
 * page.tsx から contrarian-fortune 専用レンダリングロジックを分離する。
 *
 * DOM構造:
 *   <p catchphrase>       ← detailedSectionの外側（元のpage.tsxと同じ配置）
 *   <div detailedSection>
 *     <p coreSentence>
 *     <h2 あるある見出し>
 *     <ul behaviors>
 *     <div midShareSection> (ShareButtons)
 *     <p persona>
 *     <div thirdPartySection>
 *     <table humorMetrics> (存在する場合のみ)
 *     <div allTypesSection>
 *       <ul allTypesList>
 *       <p allTypesCta>
 *       <div trySection> (CTA)
 *     </div>
 *   </div>
 */

import Link from "next/link";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import styles from "./ContrarianFortuneLayout.module.css";
import pageStyles from "../page.module.css";
import type { ContrarianFortuneLayoutProps } from "./types";

export default function ContrarianFortuneLayout({
  slug,
  resultId,
  quizMeta,
  shareText,
  shareUrl,
  ctaText,
  detailedContent,
  allResults,
}: ContrarianFortuneLayoutProps) {
  const cf = detailedContent;

  return (
    <>
      {/* (a) キャッチコピー: h1直下のサブタイトル — detailedSectionの外側に配置 */}
      <p className={styles.catchphrase}>{cf.catchphrase}</p>

      <div className={pageStyles.detailedSection}>
        {/* (b) 核心の一文: accentColorの透過色背景でカード風に視覚的独立性を付与 */}
        <p
          className={styles.coreSentence}
          style={{ backgroundColor: `${quizMeta.accentColor}18` }}
        >
          {cf.coreSentence}
        </p>

        {/* (c) あるある箇条書き */}
        <h2
          className={pageStyles.detailedSectionHeading}
          style={{ color: quizMeta.accentColor }}
        >
          このタイプの人、こんなことしてませんか？
        </h2>
        <ul className={pageStyles.behaviorsList}>
          {cf.behaviors.map((behavior, i) => (
            <li key={i} className={pageStyles.behaviorsItem}>
              {behavior}
            </li>
          ))}
        </ul>

        {/* (d) シェアボタン第一置き場（あるある直後） */}
        <div className={styles.midShareSection}>
          <ShareButtons
            shareText={shareText}
            shareUrl={shareUrl}
            quizTitle={quizMeta.title}
            contentType="diagnosis"
            contentId={`quiz-${slug}`}
          />
        </div>

        {/* (e) タイプの人物像 */}
        <p className={styles.persona}>{cf.persona}</p>

        {/* (f) 第三者専用セクション */}
        <div className={styles.thirdPartySection}>
          <h2
            className={styles.thirdPartyHeading}
            style={{ color: quizMeta.accentColor }}
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
          <p className={styles.allTypesCta}>あなたのタイプはどれ？</p>
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
    </>
  );
}
