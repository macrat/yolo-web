import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import styles from "./page.module.css";

const GAMES = [
  {
    slug: "kanji-kanaru",
    title: "漢字カナール",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
    icon: "\u{1F4DA}",
    accentColor: "#4d8c3f",
    difficulty: "初級〜中級",
  },
  {
    slug: "yoji-kimeru",
    title: "四字キメル",
    description:
      "毎日1つの四字熟語を当てるパズルゲーム。4文字の漢字を推理しよう!",
    icon: "\u{1F3AF}",
    accentColor: "#9a8533",
    difficulty: "中級〜上級",
  },
  {
    slug: "nakamawake",
    title: "ナカマワケ",
    description:
      "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう!",
    icon: "\u{1F9E9}",
    accentColor: "#8a5a9a",
    difficulty: "初級〜上級",
  },
  {
    slug: "irodori",
    title: "イロドリ",
    description:
      "毎日5つの色を作って色彩感覚を鍛えよう! ターゲットカラーにどれだけ近づけるかチャレンジ!",
    icon: "\u{1F3A8}",
    accentColor: "#e91e63",
    difficulty: "初級〜上級",
  },
];

function getTodayFormatted(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const year = jst.getUTCFullYear();
  const month = jst.getUTCMonth() + 1;
  const day = jst.getUTCDate();
  return `${year}年${month}月${day}日`;
}

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
};

export default function GamesPage() {
  const today = getTodayFormatted();

  return (
    <div className={styles.main}>
      {/* ヒーローバナー */}
      <section className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>毎日4つのパズルに挑戦</h1>
        <p className={styles.heroDate}>{today}のパズル</p>
        <p className={styles.heroSubtext}>全ゲームクリアで今日の完全制覇!</p>
      </section>

      <div className={styles.grid} role="list" aria-label="Games list">
        {GAMES.map((game) => (
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
