import type { Metadata } from "next";
import { generateGameJsonLd, safeJsonLdStringify } from "@/lib/seo";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { gameBySlug } from "@/games/registry";
import GameLayout from "@/games/_components/GameLayout";
import GameContainer from "@/games/nakamawake/_components/GameContainer";

export const metadata: Metadata = {
  title: "ナカマワケ - 毎日の仲間分けパズル | yolos.net",
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
    url: `${BASE_URL}/games/nakamawake`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "ナカマワケ - 毎日の仲間分けパズル",
    description:
      "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう！",
  },
  alternates: {
    canonical: `${BASE_URL}/games/nakamawake`,
  },
};

const gameMeta = gameBySlug.get("nakamawake")!;

const gameJsonLd = generateGameJsonLd({
  name: "ナカマワケ - 毎日の仲間分けパズル",
  description:
    "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう！日本語・日本文化をテーマにした無料デイリーパズルです。",
  url: "/games/nakamawake",
  genre: "Puzzle",
  inLanguage: "ja",
  numberOfPlayers: "1",
  publishedAt: gameMeta.publishedAt,
  updatedAt: gameMeta.updatedAt,
});

export default function NakamawakePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(gameJsonLd) }}
      />
      <GameLayout meta={gameMeta}>
        <GameContainer />
      </GameLayout>
    </>
  );
}
