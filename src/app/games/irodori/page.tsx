import type { Metadata } from "next";
import { generateGameJsonLd } from "@/lib/seo";
import { gameBySlug } from "@/games/registry";
import GameLayout from "@/games/_components/GameLayout";
import GameContainer from "@/games/irodori/_components/GameContainer";

export const metadata: Metadata = {
  title: "イロドリ - 毎日の色彩チャレンジ | yolos.net",
  description:
    "ターゲットカラーにどれだけ近い色を作れるかチャレンジ! HSLスライダーで色を混ぜて、あなたの色彩感覚を試そう。日本の伝統色も登場する無料デイリーゲーム。",
  keywords: [
    "色彩感覚テスト",
    "カラーIQ",
    "色覚テスト 無料",
    "color sense test",
    "色当てゲーム",
    "色彩チャレンジ",
    "デイリーゲーム",
    "イロドリ",
    "伝統色",
  ],
  openGraph: {
    title: "イロドリ - 毎日の色彩チャレンジ",
    description:
      "ターゲットカラーにどれだけ近い色を作れるかチャレンジ! HSLスライダーで色彩感覚を試そう。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "イロドリ - 毎日の色彩チャレンジ",
    description:
      "ターゲットカラーにどれだけ近い色を作れるかチャレンジ! HSLスライダーで色彩感覚を試そう。",
  },
};

const gameJsonLd = generateGameJsonLd({
  name: "イロドリ - 毎日の色彩チャレンジ",
  description:
    "ターゲットカラーにどれだけ近い色を作れるかチャレンジ! HSLスライダーで色を混ぜて、あなたの色彩感覚を試そう。日本の伝統色も登場する無料デイリーゲーム。",
  url: "/games/irodori",
  genre: "Puzzle",
  inLanguage: "ja",
  numberOfPlayers: "1",
});

const gameMeta = gameBySlug.get("irodori")!;

export default function IrodoriPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <GameLayout meta={gameMeta}>
        <GameContainer />
      </GameLayout>
    </>
  );
}
