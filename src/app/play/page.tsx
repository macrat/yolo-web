import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { allPlayContents } from "@/play/registry";
import { getPlayPath } from "@/play/paths";
import Breadcrumb from "@/components/common/Breadcrumb";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `遊ぶ | ${SITE_NAME}`,
  description:
    "ゲーム、クイズ、診断などインタラクティブなコンテンツの入口。ブラウザで無料で遊べるパズルや知識テストが揃っています。",
  keywords: [
    "ゲーム",
    "クイズ",
    "診断",
    "パズル",
    "ブラウザゲーム",
    "無料",
    "インタラクティブ",
  ],
  openGraph: {
    title: `遊ぶ | ${SITE_NAME}`,
    description:
      "ゲーム、クイズ、診断などインタラクティブなコンテンツの入口。ブラウザで無料で遊べます。",
    type: "website",
    url: `${BASE_URL}/play`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `遊ぶ | ${SITE_NAME}`,
    description:
      "ゲーム、クイズ、診断などインタラクティブなコンテンツの入口。ブラウザで無料で遊べます。",
  },
  alternates: {
    canonical: `${BASE_URL}/play`,
  },
};

export default function PlayPage() {
  return (
    <div className={styles.main}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "遊ぶ" }]} />

      {/* ヒーローバナー */}
      <section className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>遊ぶ</h1>
        <p className={styles.heroSubtext}>
          パズル・クイズ・診断など、楽しいコンテンツで遊ぼう
        </p>
      </section>

      {/* ゲーム一覧 */}
      <div className={styles.grid} role="list" aria-label="Play contents list">
        {allPlayContents.map((content) => (
          <div key={content.slug} role="listitem">
            <Link
              href={getPlayPath(content.slug)}
              className={styles.card}
              style={
                {
                  "--play-accent": content.accentColor,
                } as React.CSSProperties
              }
            >
              <div className={styles.cardIcon}>{content.icon}</div>
              <h2 className={styles.cardTitle}>{content.title}</h2>
              <p className={styles.cardDescription}>
                {content.shortDescription}
              </p>
              <div className={styles.cardMeta}>
                <span className={styles.cardCta}>遊ぶ</span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* クイズ・診断への誘導セクション */}
      <section className={styles.quizPromo}>
        <div className={styles.quizPromoContent}>
          <p className={styles.quizPromoText}>
            知識テストや性格診断も揃っています
          </p>
          <Link href="/quiz" className={styles.quizPromoLink}>
            クイズ・診断へ →
          </Link>
        </div>
      </section>
    </div>
  );
}
