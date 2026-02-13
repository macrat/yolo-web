import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import AiDisclaimer from "@/components/tools/AiDisclaimer";
import { SITE_NAME } from "@/lib/constants";
import styles from "./page.module.css";

const GAMES = [
  {
    slug: "kanji-kanaru",
    title: "漢字カナール",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
    icon: "\u{1F4DA}",
  },
];

export const metadata: Metadata = {
  title: `ゲーム一覧 | ${SITE_NAME}`,
  description:
    "ブラウザで遊べる無料ゲーム集。漢字パズルなど、楽しく学べるゲームを提供しています。",
  keywords: ["ゲーム", "ブラウザゲーム", "無料ゲーム", "漢字パズル", "学習"],
};

export default function GamesPage() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>ゲーム一覧</h1>
          <p className={styles.description}>
            ブラウザで遊べる無料ゲーム集です。楽しく学べるゲームを提供しています。
          </p>
        </header>
        <div className={styles.grid} role="list" aria-label="Games list">
          {GAMES.map((game) => (
            <div key={game.slug} role="listitem">
              <Link href={`/games/${game.slug}`} className={styles.card}>
                <div className={styles.cardIcon}>{game.icon}</div>
                <h2 className={styles.cardTitle}>{game.title}</h2>
                <p className={styles.cardDescription}>{game.description}</p>
              </Link>
            </div>
          ))}
        </div>
        <AiDisclaimer />
      </main>
      <Footer />
    </div>
  );
}
