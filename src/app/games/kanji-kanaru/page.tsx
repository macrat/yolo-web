import type { Metadata } from "next";
import Link from "next/link";
import { generateGameJsonLd } from "@/lib/seo";
import { gameBySlug } from "@/games/registry";
import GameLayout from "@/games/_components/GameLayout";
import GameContainer from "@/games/kanji-kanaru/_components/GameContainer";

export const metadata: Metadata = {
  title: "漢字カナール - 毎日の漢字パズル | yolos.net",
  description:
    "毎日1つの漢字を当てるパズルゲーム。6回以内に正解を見つけよう!部首・画数・読みなどのヒントを頼りに推理する、新感覚の漢字クイズです。",
  openGraph: {
    title: "漢字カナール - 毎日の漢字パズル",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "漢字カナール - 毎日の漢字パズル",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
  },
};

const gameJsonLd = generateGameJsonLd({
  name: "漢字カナール - 毎日の漢字パズル",
  description:
    "毎日1つの漢字を当てるパズルゲーム。6回以内に正解を見つけよう!部首・画数・読みなどのヒントを頼りに推理する、新感覚の漢字クイズです。",
  url: "/games/kanji-kanaru",
  genre: "Puzzle",
  inLanguage: "ja",
  numberOfPlayers: "1",
});

const gameMeta = gameBySlug.get("kanji-kanaru")!;

export default function KanjiKanaruPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <GameLayout
        meta={gameMeta}
        attribution={
          <>
            <p>
              漢字データは{" "}
              <a
                href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
                target="_blank"
                rel="noopener noreferrer"
              >
                KANJIDIC2
              </a>{" "}
              (CC BY-SA 4.0) を基に作成しています。
            </p>
            <p>
              <Link href="/dictionary/kanji">漢字辞典</Link>
              で漢字の読み方・意味を調べる
            </p>
          </>
        }
      >
        <GameContainer />
      </GameLayout>
    </>
  );
}
