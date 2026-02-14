import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import { generateGameJsonLd } from "@/lib/seo";
import GameContainer from "@/components/games/yoji-kimeru/GameContainer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "四字キメル - 毎日の四字熟語パズル | Yolo-Web",
  description:
    "毎日1つの四字熟語を当てるパズルゲーム。6回以内に正解を見つけよう!4文字の漢字を入力して、色のフィードバックを頼りに推理する新感覚の四字熟語クイズです。",
  keywords: [
    "四字熟語",
    "パズル",
    "クイズ",
    "Wordle",
    "漢字",
    "日本語",
    "ゲーム",
    "デイリーゲーム",
    "四字キメル",
  ],
  openGraph: {
    title: "四字キメル - 毎日の四字熟語パズル",
    description:
      "毎日1つの四字熟語を当てるパズルゲーム。色のフィードバックで推理しよう!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "四字キメル - 毎日の四字熟語パズル",
    description:
      "毎日1つの四字熟語を当てるパズルゲーム。色のフィードバックで推理しよう!",
  },
};

const gameJsonLd = generateGameJsonLd({
  name: "四字キメル - 毎日の四字熟語パズル",
  description:
    "毎日1つの四字熟語を当てるパズルゲーム。6回以内に正解を見つけよう!4文字の漢字を入力して、色のフィードバックを頼りに推理する新感覚の四字熟語クイズです。",
  url: "/games/yoji-kimeru",
});

export default function YojiKimeruPage() {
  return (
    <div className={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "ゲーム", href: "/games" },
          { label: "四字キメル" },
        ]}
      />
      <GameContainer />
    </div>
  );
}
