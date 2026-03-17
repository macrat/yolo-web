import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { allGameMetas } from "@/play/games/registry";
import TodayDate from "./TodayDate";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `ゲーム一覧 | ${SITE_NAME}`,
  description:
    "ブラウザで遊べる無料ゲーム集。漢字パズル、四字熟語パズルなど、楽しく学べるゲームを提供しています。",
  keywords: [
    "ゲーム",
    "ブラウザゲーム",
    "無料ゲーム",
    "漢字パズル",
    "四字熟語",
    "仲間分け",
    "学習",
  ],
  openGraph: {
    title: `ゲーム一覧 | ${SITE_NAME}`,
    description:
      "ブラウザで遊べる無料ゲーム集。漢字パズル、四字熟語パズルなど、楽しく学べるゲームを提供しています。",
    type: "website",
    url: `${BASE_URL}/games`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `ゲーム一覧 | ${SITE_NAME}`,
    description:
      "ブラウザで遊べる無料ゲーム集。漢字パズル、四字熟語パズルなど、楽しく学べるゲームを提供しています。",
  },
  alternates: {
    canonical: `${BASE_URL}/games`,
  },
};

export default function GamesPage() {
  return (
    <div className={styles.main}>
      {/* ヒーローバナー */}
      <section className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>毎日4つのパズルに挑戦</h1>
        <TodayDate className={styles.heroDate} />
        <p className={styles.heroSubtext}>全ゲームクリアで今日の完全制覇!</p>
      </section>

      <div className={styles.grid} role="list" aria-label="Games list">
        {allGameMetas.map((game) => (
          <div key={game.slug} role="listitem">
            <Link
              href={`/games/${game.slug}`}
              className={styles.card}
              style={
                {
                  "--game-accent": game.accentColor,
                } as React.CSSProperties
              }
            >
              <div className={styles.cardIcon}>{game.icon}</div>
              <h2 className={styles.cardTitle}>{game.title}</h2>
              <p className={styles.cardDescription}>{game.description}</p>
              <div className={styles.cardMeta}>
                <span className={styles.difficultyBadge}>
                  {game.difficulty}
                </span>
                <span className={styles.cardCta}>遊ぶ</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
