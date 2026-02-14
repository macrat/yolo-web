import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import { generateGameJsonLd } from "@/lib/seo";
import GameContainer from "@/components/games/nakamawake/GameContainer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "ナカマワケ - 毎日の仲間分けパズル | Yolo-Web",
  description:
    "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう！日本語・日本文化をテーマにした無料デイリーパズルです。",
  keywords: [
    "仲間分け",
    "グループ分け パズル",
    "Connections 日本語",
    "脳トレ 無料",
    "言葉 パズル",
    "日本語 クイズ",
    "デイリーゲーム",
    "ナカマワケ",
  ],
  openGraph: {
    title: "ナカマワケ - 毎日の仲間分けパズル",
    description:
      "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう！",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ナカマワケ - 毎日の仲間分けパズル",
    description:
      "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう！",
  },
};

const gameJsonLd = generateGameJsonLd({
  name: "ナカマワケ - 毎日の仲間分けパズル",
  description:
    "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう！日本語・日本文化をテーマにした無料デイリーパズルです。",
  url: "/games/nakamawake",
});

export default function NakamawakePage() {
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
          { label: "ナカマワケ" },
        ]}
      />
      <GameContainer />
    </div>
  );
}
