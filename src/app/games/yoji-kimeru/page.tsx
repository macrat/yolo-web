import type { Metadata } from "next";
import Link from "next/link";
import { generateGameJsonLd } from "@/lib/seo";
import { gameBySlug } from "@/games/registry";
import GameLayout from "@/games/_components/GameLayout";
import GameContainer from "@/games/yoji-kimeru/_components/GameContainer";

export const metadata: Metadata = {
  title: "四字キメル - 毎日の四字熟語パズル | yolos.net",
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
  genre: "Puzzle",
  inLanguage: "ja",
  numberOfPlayers: "1",
});

const gameMeta = gameBySlug.get("yoji-kimeru")!;

export default function YojiKimeruPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <GameLayout
        meta={gameMeta}
        attribution={
          <p>
            <Link href="/dictionary/yoji">四字熟語辞典</Link>
            で四字熟語の読み方・意味を調べる
          </p>
        }
      >
        <GameContainer />
      </GameLayout>
    </>
  );
}
