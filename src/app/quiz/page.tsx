import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import { allQuizMetas } from "@/quiz/registry";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `クイズ・診断 | ${SITE_NAME}`,
  description:
    "漢字力診断や性格診断など、楽しいクイズ・診断テストを無料で遊べます。結果をSNSでシェアして友達と比べよう!",
  keywords: [
    "クイズ",
    "診断",
    "性格診断",
    "漢字クイズ",
    "伝統色",
    "無料",
    "テスト",
  ],
  alternates: {
    canonical: `${BASE_URL}/quiz`,
  },
  openGraph: {
    title: `クイズ・診断 | ${SITE_NAME}`,
    description:
      "漢字力診断や性格診断など、楽しいクイズ・診断テストを無料で遊べます。",
    type: "website",
    url: `${BASE_URL}/quiz`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `クイズ・診断 | ${SITE_NAME}`,
    description:
      "漢字力診断や性格診断など、楽しいクイズ・診断テストを無料で遊べます。",
  },
};

export default function QuizListPage() {
  return (
    <div className={styles.main}>
      <Breadcrumb
        items={[{ label: "ホーム", href: "/" }, { label: "クイズ・診断" }]}
      />

      <section className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>クイズ・診断</h1>
        <p className={styles.heroSubtext}>
          知識テストや性格診断で楽しく自分を発見しよう
        </p>
      </section>

      <div className={styles.grid} role="list" aria-label="Quiz list">
        {/* 日替わり占い - 看板コンテンツとして最上部に配置 */}
        <div role="listitem">
          <Link
            href="/fortune/daily"
            className={styles.card}
            style={
              {
                "--quiz-accent": "#e67e22",
              } as React.CSSProperties
            }
          >
            <div className={styles.cardIcon}>{"🔮"}</div>
            <h2 className={styles.cardTitle}>今日のユーモア運勢</h2>
            <p className={styles.cardDescription}>
              毎日変わる、あなただけのユーモア運勢。60種類のユニークな運勢からあなたの今日の運命を占います。
            </p>
            <div className={styles.cardMeta}>
              <span className={styles.typeBadge}>占い</span>
              <span className={styles.questionCount}>日替わり</span>
              <span className={styles.cardCta}>占う</span>
            </div>
          </Link>
        </div>
        {allQuizMetas.map((quiz) => (
          <div key={quiz.slug} role="listitem">
            <Link
              href={`/quiz/${quiz.slug}`}
              className={styles.card}
              style={
                {
                  "--quiz-accent": quiz.accentColor,
                } as React.CSSProperties
              }
            >
              <div className={styles.cardIcon}>{quiz.icon}</div>
              <h2 className={styles.cardTitle}>{quiz.title}</h2>
              <p className={styles.cardDescription}>{quiz.shortDescription}</p>
              <div className={styles.cardMeta}>
                <span className={styles.typeBadge}>
                  {quiz.type === "knowledge" ? "知識テスト" : "性格診断"}
                </span>
                <span className={styles.questionCount}>
                  {quiz.questionCount}問
                </span>
                <span className={styles.cardCta}>挑戦する</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
